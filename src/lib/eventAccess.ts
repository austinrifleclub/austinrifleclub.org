/**
 * Event Access Control Library
 *
 * Determines who can view and register for events based on:
 * - Authentication status
 * - Member status (prospect, probationary, active, etc.)
 * - Board membership
 * - Certifications (NMO, NMSE, RSO, Instructor)
 */

import { eq, and } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import type { Event, Member, Certification } from "../db/schema";
import { members, certifications, boardMembers } from "../db/schema";
import type * as schema from "../db/schema";

type DbType = DrizzleD1Database<typeof schema>;

export interface AccessContext {
  user: { id: string } | null;
  member: Member | null;
  memberCertifications: Certification[];
  isBoardMember: boolean;
}

export interface RegistrationResult {
  canRegister: boolean;
  reason: string | null;
  missingCertifications: string[];
}

// Event types that prospects can see and potentially register for
const PROSPECT_VISIBLE_EVENTS = ["arc_education", "arc_event"];

// Member statuses that grant full access (subject to certifications)
const ACTIVE_MEMBER_STATUSES = ["probationary", "active"];

/**
 * Check if a user can view an event
 *
 * Rules:
 * - Board-only events: only visible to current board members
 * - Public events: visible to everyone
 * - Non-public, not authenticated: hidden
 * - Prospects: only see orientation/education events
 * - Members-only: requires active/probationary status
 */
export function canViewEvent(event: Event, ctx: AccessContext): boolean {
  // Board-only events require current board membership
  if (event.boardOnly) {
    return ctx.isBoardMember;
  }

  // Public events are visible to everyone
  if (event.isPublic) {
    return true;
  }

  // Non-public events require authentication
  if (!ctx.user) {
    return false;
  }

  // If no member profile, check if it's a prospect-visible event
  if (!ctx.member) {
    return false;
  }

  // Prospects can only see orientation/education events
  if (ctx.member.status === "prospect") {
    return PROSPECT_VISIBLE_EVENTS.includes(event.eventType);
  }

  // Suspended/terminated/inactive members have limited access
  if (["suspended", "terminated", "inactive"].includes(ctx.member.status)) {
    // They can see public events (handled above) but not members-only
    return !event.membersOnly;
  }

  // Active/probationary members can see all non-board events
  return true;
}

/**
 * Check if a user can register for an event
 *
 * Returns detailed information about why registration may be blocked
 * and which certifications are missing.
 */
export function canRegisterForEvent(event: Event, ctx: AccessContext): RegistrationResult {
  // Must be able to view the event first
  if (!canViewEvent(event, ctx)) {
    return {
      canRegister: false,
      reason: "You do not have access to this event.",
      missingCertifications: [],
    };
  }

  // Must be authenticated
  if (!ctx.user) {
    return {
      canRegister: false,
      reason: "Please log in to register for events.",
      missingCertifications: [],
    };
  }

  // Must have a member profile
  if (!ctx.member) {
    return {
      canRegister: false,
      reason: "You need a member profile to register for events.",
      missingCertifications: [],
    };
  }

  // Check member status
  if (ctx.member.status === "suspended") {
    return {
      canRegister: false,
      reason: "Your membership is currently suspended.",
      missingCertifications: [],
    };
  }

  if (ctx.member.status === "terminated") {
    return {
      canRegister: false,
      reason: "Your membership has been terminated.",
      missingCertifications: [],
    };
  }

  if (ctx.member.status === "inactive") {
    return {
      canRegister: false,
      reason: "Your membership is inactive. Please renew your dues.",
      missingCertifications: [],
    };
  }

  // Members-only events require active/probationary status
  if (event.membersOnly && !ACTIVE_MEMBER_STATUSES.includes(ctx.member.status)) {
    if (ctx.member.status === "prospect") {
      return {
        canRegister: false,
        reason: "This event is for approved members only.",
        missingCertifications: [],
      };
    }
    return {
      canRegister: false,
      reason: "This event requires an active membership.",
      missingCertifications: [],
    };
  }

  // Check required certifications
  if (event.requiresCertification) {
    let requiredCerts: string[];
    try {
      requiredCerts = JSON.parse(event.requiresCertification);
    } catch {
      requiredCerts = [];
    }

    if (requiredCerts.length > 0) {
      const now = new Date();
      const validCertIds = ctx.memberCertifications
        .filter((cert) => {
          // Check if certification is not expired
          if (cert.expiresAt && cert.expiresAt < now) {
            return false;
          }
          return true;
        })
        .map((cert) => cert.certificationTypeId);

      const missingCerts = requiredCerts.filter((certId) => !validCertIds.includes(certId));

      if (missingCerts.length > 0) {
        return {
          canRegister: false,
          reason: "You are missing required certifications for this event.",
          missingCertifications: missingCerts,
        };
      }
    }
  }

  // All checks passed
  return {
    canRegister: true,
    reason: null,
    missingCertifications: [],
  };
}

/**
 * Build access context for a user
 *
 * This is typically called at the start of an API request to gather
 * all the information needed for access control decisions.
 */
export async function buildAccessContext(
  db: DbType,
  userId: string | null | undefined,
  memberId?: string | null
): Promise<AccessContext> {
  if (!userId) {
    return {
      user: null,
      member: null,
      memberCertifications: [],
      isBoardMember: false,
    };
  }

  // Load member profile
  let member: Member | null = null;
  if (memberId) {
    member = (await db.query.members.findFirst({
      where: eq(members.id, memberId),
    })) ?? null;
  } else {
    member = (await db.query.members.findFirst({
      where: eq(members.userId, userId),
    })) ?? null;
  }

  // Load certifications
  let memberCertifications: Certification[] = [];
  if (member) {
    memberCertifications = await db.query.certifications.findMany({
      where: eq(certifications.memberId, member.id),
    });
  }

  // Check board membership
  let isBoardMember = false;
  if (member) {
    const boardMember = await db.query.boardMembers.findFirst({
      where: and(eq(boardMembers.memberId, member.id), eq(boardMembers.isCurrent, true)),
    });
    isBoardMember = !!boardMember;
  }

  return {
    user: { id: userId },
    member,
    memberCertifications,
    isBoardMember,
  };
}

/**
 * Filter a list of events to only those the user can view
 */
export function filterVisibleEvents(events: Event[], ctx: AccessContext): Event[] {
  return events.filter((event) => canViewEvent(event, ctx));
}

/**
 * Certification type ID to human-readable name mapping
 */
export const CERTIFICATION_NAMES: Record<string, string> = {
  "cert-type-nmo": "New Member Orientation (NMO)",
  "cert-type-nmse": "New Member Safety Evaluation (NMSE)",
  "cert-type-rso": "Range Safety Officer (RSO)",
  "cert-type-instructor": "Instructor Certification",
};

/**
 * Get human-readable names for missing certifications
 */
export function getMissingCertificationNames(missingCerts: string[]): string[] {
  return missingCerts.map((certId) => CERTIFICATION_NAMES[certId] || certId);
}
