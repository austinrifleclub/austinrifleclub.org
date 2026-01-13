/**
 * Events API Routes
 *
 * Handles events, calendar, registration, and match results.
 *
 * @see features.md Section 2 for event features
 */

import { Hono } from "hono";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { Env } from "../lib/auth";
import { log } from "../lib/logger";
import {
  requireMember,
  requireAdmin,
  optionalAuth,
  MemberContext,
  AuthContext,
} from "../middleware/auth";
import { createDb } from "../db";
import { events, eventRegistrations, rangeStatus } from "../db/schema";
import {
  createEventSchema,
  updateEventSchema,
  eventRegistrationSchema,
  eventsQuerySchema,
  cancelEventSchema,
  uuidSchema,
} from "../lib/validation";
import { generateId } from "../lib/utils";
import {
  sendEmail,
  eventRegistrationEmail,
  registrationCancelledEmail,
  eventCancellationEmail,
  waitlistPromotionEmail,
} from "../lib/email";
import { logAudit } from "../lib/audit";
import { members, users, certifications, boardMembers } from "../db/schema";
import {
  buildAccessContext,
  canViewEvent,
  canRegisterForEvent,
  filterVisibleEvents,
  getMissingCertificationNames,
  type AccessContext,
} from "../lib/eventAccess";
import { ValidationError, NotFoundError, ConflictError, ForbiddenError } from "../lib/errors";
import { getPublicUrl } from "../lib/config";

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

/**
 * GET /api/events
 * List events (filtered by access control)
 */
app.get("/", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");

  const query = c.req.query();
  const { page, limit, start, end, type: eventType } = eventsQuerySchema.parse(query);
  const offset = (page - 1) * limit;

  // Date range filters (with defaults)
  const startDate = start ?? new Date();
  const endDate = end ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

  // Build access context for filtering
  const accessCtx = await buildAccessContext(db, user?.id);

  const conditions = [
    eq(events.status, "published"),
    gte(events.startTime, startDate),
    lte(events.startTime, endDate),
  ];

  if (eventType) {
    conditions.push(eq(events.eventType, eventType));
  }

  // Fetch events (we'll filter by access after)
  const eventList = await db.query.events.findMany({
    where: and(...conditions),
    orderBy: events.startTime,
    // Fetch more than limit to account for filtering
    limit: limit * 3,
  });

  // Filter by access control
  const visibleEvents = filterVisibleEvents(eventList, accessCtx);

  // Apply pagination after filtering
  const paginatedEvents = visibleEvents.slice(offset, offset + limit);

  // Get registration counts in a single query (fixes N+1)
  const eventIds = paginatedEvents.map((e) => e.id);

  let registrationCounts: Map<string, number> = new Map();

  if (eventIds.length > 0) {
    const counts = await db
      .select({
        eventId: eventRegistrations.eventId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(eventRegistrations)
      .where(
        and(
          sql`${eventRegistrations.eventId} IN (${sql.join(eventIds.map(id => sql`${id}`), sql`, `)})`,
          eq(eventRegistrations.status, "registered")
        )
      )
      .groupBy(eventRegistrations.eventId);

    registrationCounts = new Map(counts.map((c) => [c.eventId, c.count]));
  }

  const eventsWithCounts = paginatedEvents.map((event) => {
    const count = registrationCounts.get(event.id) ?? 0;
    return {
      ...event,
      registrationCount: count,
      spotsRemaining: event.maxParticipants
        ? event.maxParticipants - count
        : null,
    };
  });

  return c.json({
    events: eventsWithCounts,
    pagination: { page, limit, totalVisible: visibleEvents.length },
  });
});

/**
 * GET /api/events/:id
 * Get a specific event with access control info
 */
app.get("/:id", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");
  const id = uuidSchema.parse(c.req.param("id"));

  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  });

  if (!event) {
    throw new NotFoundError("Event", id);
  }

  // Build access context and check visibility
  const accessCtx = await buildAccessContext(db, user?.id);

  if (!canViewEvent(event, accessCtx)) {
    throw new NotFoundError("Event", id);
  }

  // Get registration count
  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, id),
        eq(eventRegistrations.status, "registered")
      )
    );

  // Check if user can register and get detailed info
  const registrationInfo = canRegisterForEvent(event, accessCtx);
  const missingCertNames = getMissingCertificationNames(registrationInfo.missingCertifications);

  return c.json({
    ...event,
    registrationCount: countResult?.count ?? 0,
    spotsRemaining: event.maxParticipants
      ? event.maxParticipants - (countResult?.count ?? 0)
      : null,
    // Access control info
    canRegister: registrationInfo.canRegister,
    registrationBlockReason: registrationInfo.reason,
    missingCertifications: missingCertNames,
  });
});

// =============================================================================
// MEMBER ROUTES
// =============================================================================

/**
 * POST /api/events/:id/register
 * Register for an event
 */
app.post("/:id/register", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const user = c.get("user");
  const eventId = c.req.param("id");

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    throw new NotFoundError("Event", eventId);
  }

  // Build access context and check registration permissions
  const accessCtx = await buildAccessContext(db, user?.id, member.id);
  const registrationInfo = canRegisterForEvent(event, accessCtx);

  if (!registrationInfo.canRegister) {
    const missingCertNames = getMissingCertificationNames(registrationInfo.missingCertifications);
    throw new ForbiddenError(registrationInfo.reason || "Registration not allowed");
  }

  if (event.status !== "published") {
    throw new ValidationError("Event not open for registration");
  }

  // Check registration deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw new ValidationError("Registration deadline has passed");
  }

  // Check if already registered
  const existing = await db.query.eventRegistrations.findFirst({
    where: and(
      eq(eventRegistrations.eventId, eventId),
      eq(eventRegistrations.memberId, member.id)
    ),
  });

  if (existing) {
    throw new ConflictError("Already registered for this event", { registration: existing });
  }

  // Parse optional body for division/classification
  let division: string | undefined;
  let classification: string | undefined;

  try {
    const body = await c.req.json();
    // Validate division format if provided (alphanumeric, spaces, hyphens only)
    if (body.division) {
      if (typeof body.division !== 'string' || body.division.length > 50 || !/^[A-Za-z0-9\s\-]+$/.test(body.division)) {
        throw new ValidationError("Invalid division format");
      }
      division = body.division;
    }
    // Validate classification format if provided (uppercase letters/numbers only)
    if (body.classification) {
      if (typeof body.classification !== 'string' || body.classification.length > 10 || !/^[A-Z0-9]+$/.test(body.classification)) {
        throw new ValidationError("Classification must be uppercase letters/numbers only");
      }
      classification = body.classification;
    }
  } catch (err) {
    // Only ignore JSON parsing errors (no body is acceptable)
    // Re-throw validation errors and other real errors
    if (!(err instanceof SyntaxError)) {
      throw err;
    }
  }

  // Insert registration first, then verify capacity (handles race condition)
  // This approach: insert as registered, then check if over capacity and update to waitlist
  const registrationId = generateId();
  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      id: registrationId,
      eventId,
      memberId: member.id,
      status: "registered", // Optimistically register
      division,
      classification,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Now check actual count including our insert (atomic read)
  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, "registered")
      )
    );

  const currentCount = countResult?.count ?? 0;
  const isFull = !!(event.maxParticipants && currentCount > event.maxParticipants);

  // If over capacity, move this registration to waitlist
  if (isFull) {
    const waitlistPosition = currentCount - (event.maxParticipants ?? 0);
    await db
      .update(eventRegistrations)
      .set({
        status: "waitlisted",
        waitlistPosition,
        updatedAt: new Date(),
      })
      .where(eq(eventRegistrations.id, registrationId));

    registration.status = "waitlisted";
    registration.waitlistPosition = waitlistPosition;
  }

  // Send confirmation email
  const emailTemplate = eventRegistrationEmail(
    member.firstName,
    event.title,
    event.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    event.location || 'Austin Rifle Club',
    isFull
  );

  // Get member email from the user table
  const memberUser = await db.query.users.findFirst({
    where: eq(users.id, member.userId),
  });

  if (memberUser) {
    await sendEmail(c.env.RESEND_API_KEY || '', {
      to: memberUser.email,
      ...emailTemplate,
    });
  }

  return c.json({
    registration,
    waitlisted: isFull,
    message: isFull
      ? `Added to waitlist at position ${registration.waitlistPosition}`
      : "Registration confirmed",
  }, 201);
});

/**
 * DELETE /api/events/:id/register
 * Cancel registration for an event
 */
app.delete("/:id/register", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const eventId = c.req.param("id");

  const registration = await db.query.eventRegistrations.findFirst({
    where: and(
      eq(eventRegistrations.eventId, eventId),
      eq(eventRegistrations.memberId, member.id)
    ),
  });

  if (!registration) {
    throw new NotFoundError("Event registration");
  }

  // Check cancellation policy
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    throw new NotFoundError("Event", eventId);
  }

  const daysUntilEvent = Math.floor(
    (event.startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Determine refund amount based on cancellation policy
  // 7+ days = 100%, 2-6 days = 50%, <2 days = 0%
  let refundPercent = 0;
  if (daysUntilEvent >= 7) refundPercent = 100;
  else if (daysUntilEvent >= 2) refundPercent = 50;

  await db
    .update(eventRegistrations)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(eventRegistrations.id, registration.id));

  const refundAmount = registration.amountPaid
    ? Math.round((registration.amountPaid * refundPercent) / 100)
    : 0;

  // Send cancellation confirmation
  const memberUser = await db.query.users.findFirst({
    where: eq(users.id, member.userId),
  });

  if (memberUser) {
    const emailTemplate = registrationCancelledEmail(
      member.firstName,
      event.title,
      refundPercent,
      refundAmount
    );
    await sendEmail(c.env.RESEND_API_KEY || '', {
      to: memberUser.email,
      ...emailTemplate,
    });
  }

  // Promote next person from waitlist
  if (registration.status === 'registered') {
    const nextInWaitlist = await db.query.eventRegistrations.findFirst({
      where: and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, 'waitlisted')
      ),
      orderBy: eventRegistrations.waitlistPosition,
    });

    if (nextInWaitlist) {
      // Update their status to registered
      await db
        .update(eventRegistrations)
        .set({
          status: 'registered',
          waitlistPosition: null,
          updatedAt: new Date(),
        })
        .where(eq(eventRegistrations.id, nextInWaitlist.id));

      // Get their member info and send promotion email
      const promotedMember = await db.query.members.findFirst({
        where: eq(members.id, nextInWaitlist.memberId),
      });

      if (promotedMember) {
        const promotedUser = await db.query.users.findFirst({
          where: eq(users.id, promotedMember.userId),
        });

        if (promotedUser) {
          const promotionEmail = waitlistPromotionEmail(
            promotedMember.firstName,
            event.title,
            event.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
            event.location || 'Austin Rifle Club'
          );
          await sendEmail(c.env.RESEND_API_KEY || '', {
            to: promotedUser.email,
            ...promotionEmail,
          });
        }
      }

      // Decrement waitlist positions for remaining
      await db
        .update(eventRegistrations)
        .set({
          waitlistPosition: sql`${eventRegistrations.waitlistPosition} - 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.status, 'waitlisted')
          )
        );
    }
  }

  // Process refund if applicable (via Stripe)
  let refundProcessed = false;
  if (refundAmount > 0 && registration.stripePaymentId && c.env.STRIPE_SECRET_KEY) {
    try {
      const { StripeService } = await import('../lib/stripe');
      const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

      const refundResult = await stripe.createRefund(registration.stripePaymentId, {
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          eventId,
          registrationId: registration.id,
          refundPercent: refundPercent.toString(),
        },
      });

      if (refundResult.success) {
        log.info('Event registration refund processed', { eventId, registrationId: registration.id, refundId: refundResult.refundId, amount: refundAmount });
        refundProcessed = true;
      } else {
        log.error('Event registration refund failed', new Error(refundResult.error || 'Unknown error'), { eventId, registrationId: registration.id });
      }
    } catch (error) {
      log.error('Event registration refund error', error instanceof Error ? error : new Error(String(error)), { eventId });
    }
  }

  return c.json({
    message: "Registration cancelled",
    refundPercent,
    refundAmount,
    refundProcessed,
  });
});

/**
 * GET /api/events/my-registrations
 * Get current member's event registrations
 */
app.get("/my-registrations", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");

  // Use join to avoid N+1 query
  const registrationsWithEvents = await db
    .select({
      id: eventRegistrations.id,
      eventId: eventRegistrations.eventId,
      memberId: eventRegistrations.memberId,
      status: eventRegistrations.status,
      waitlistPosition: eventRegistrations.waitlistPosition,
      division: eventRegistrations.division,
      classification: eventRegistrations.classification,
      checkedInAt: eventRegistrations.checkedInAt,
      amountPaid: eventRegistrations.amountPaid,
      stripePaymentId: eventRegistrations.stripePaymentId,
      createdAt: eventRegistrations.createdAt,
      updatedAt: eventRegistrations.updatedAt,
      event: {
        id: events.id,
        title: events.title,
        description: events.description,
        eventType: events.eventType,
        startTime: events.startTime,
        endTime: events.endTime,
        location: events.location,
        cost: events.cost,
        status: events.status,
        maxParticipants: events.maxParticipants,
      },
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(eventRegistrations.eventId, events.id))
    .where(eq(eventRegistrations.memberId, member.id))
    .orderBy(desc(eventRegistrations.createdAt))
    .limit(50);

  return c.json(registrationsWithEvents);
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

/**
 * POST /api/events
 * Create a new event (admin only)
 */
app.post("/", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const body = await c.req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const eventId = generateId();
  const { rangeIds, requiresCertification, ...eventData } = parsed.data;
  const [event] = await db
    .insert(events)
    .values({
      id: eventId,
      ...eventData,
      rangeIds: rangeIds ? JSON.stringify(rangeIds) : null,
      requiresCertification: requiresCertification ? JSON.stringify(requiresCertification) : null,
      status: "draft",
      createdBy: admin.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // If ranges are specified, update their status
  if (parsed.data.rangeIds && parsed.data.rangeIds.length > 0) {
    for (const rangeId of parsed.data.rangeIds) {
      await db
        .update(rangeStatus)
        .set({
          status: "event",
          statusNote: parsed.data.title,
          calendarEventId: eventId,
          expiresAt: parsed.data.endTime,
          updatedBy: admin.id,
          updatedAt: new Date(),
        })
        .where(eq(rangeStatus.id, rangeId));
    }
  }

  return c.json(event, 201);
});

/**
 * PATCH /api/events/:id
 * Update an event (admin only)
 */
app.patch("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const body = await c.req.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const { rangeIds: updateRangeIds, requiresCertification: updateReqCerts, ...updateData } = parsed.data;
  const [updated] = await db
    .update(events)
    .set({
      ...updateData,
      rangeIds: updateRangeIds ? JSON.stringify(updateRangeIds) : undefined,
      requiresCertification: updateReqCerts ? JSON.stringify(updateReqCerts) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError("Event", id);
  }

  return c.json(updated);
});

/**
 * POST /api/events/:id/cancel
 * Cancel an event (admin only)
 */
app.post("/:id/cancel", requireAdmin, async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const body = await c.req.json();
  const parsed = cancelEventSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const { reason } = parsed.data;

  const [updated] = await db
    .update(events)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError("Event", id);
  }

  // Get all registrations with member and user info in a single query (avoid N+1)
  const registrationsWithInfo = await db
    .select({
      id: eventRegistrations.id,
      memberId: eventRegistrations.memberId,
      status: eventRegistrations.status,
      amountPaid: eventRegistrations.amountPaid,
      stripePaymentId: eventRegistrations.stripePaymentId,
      memberFirstName: members.firstName,
      userEmail: users.email,
    })
    .from(eventRegistrations)
    .innerJoin(members, eq(eventRegistrations.memberId, members.id))
    .innerJoin(users, eq(members.userId, users.id))
    .where(
      and(
        eq(eventRegistrations.eventId, id),
        sql`${eventRegistrations.status} IN ('registered', 'waitlisted')`
      )
    );

  for (const reg of registrationsWithInfo) {
    // Send cancellation email
    const emailTemplate = eventCancellationEmail(
      reg.memberFirstName,
      updated.title,
      updated.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      reason,
      reg.amountPaid || undefined
    );
    await sendEmail(c.env.RESEND_API_KEY || '', {
      to: reg.userEmail,
      ...emailTemplate,
    });

    // Mark registration as cancelled
    await db
      .update(eventRegistrations)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(eventRegistrations.id, reg.id));

    // Process refund for this registration
    if (reg.amountPaid && reg.stripePaymentId && c.env.STRIPE_SECRET_KEY) {
      try {
        const { StripeService } = await import('../lib/stripe');
        const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

        const refundResult = await stripe.createRefund(reg.stripePaymentId, {
          reason: 'requested_by_customer',
          metadata: {
            eventId: id,
            registrationId: reg.id,
            reason: 'event_cancelled',
          },
        });

        if (refundResult.success) {
          log.info('Cancelled event refund processed', { eventId: id, registrationId: reg.id, refundId: refundResult.refundId });
        } else {
          log.error('Cancelled event refund failed', new Error(refundResult.error || 'Unknown error'), { eventId: id, registrationId: reg.id });
        }
      } catch (error) {
        log.error('Cancelled event refund error', error instanceof Error ? error : new Error(String(error)), { eventId: id, registrationId: reg.id });
      }
    }
  }

  return c.json(updated);
});

/**
 * GET /api/events/:id/registrations
 * Get all registrations for an event (admin only)
 */
app.get("/:id/registrations", requireAdmin, async (c) => {
  const db = c.get("db");
  const eventId = c.req.param("id");

  const registrations = await db.query.eventRegistrations.findMany({
    where: eq(eventRegistrations.eventId, eventId),
    orderBy: eventRegistrations.createdAt,
  });

  return c.json(registrations);
});

/**
 * POST /api/events/:id/check-in/:memberId
 * Check in a member at an event (admin only)
 */
app.post("/:id/check-in/:memberId", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const eventId = c.req.param("id");
  const memberId = c.req.param("memberId");

  const [updated] = await db
    .update(eventRegistrations)
    .set({
      checkedInAt: new Date(),
      checkedInBy: admin.id,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.memberId, memberId)
      )
    )
    .returning();

  if (!updated) {
    throw new NotFoundError("Registration");
  }

  return c.json(updated);
});

/**
 * GET /api/events/calendar.ics
 * Export events as iCal feed
 *
 * Query params:
 * - type: Filter by event type (match, youth_event, etc.)
 * - discipline: Filter matches by discipline (uspsa, idpa, steel, etc.)
 */
app.get("/calendar.ics", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const typeFilter = c.req.query("type");
  const disciplineFilter = c.req.query("discipline");

  const now = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  // Build where conditions
  const conditions = [
    eq(events.status, "published"),
    eq(events.isPublic, true),
    gte(events.startTime, now),
    lte(events.startTime, sixMonthsLater)
  ];

  // Add type filter if specified
  if (typeFilter) {
    conditions.push(eq(events.eventType, typeFilter));
  }

  let eventList = await db.query.events.findMany({
    where: and(...conditions),
    orderBy: events.startTime,
    limit: 200,
  });

  // Filter by discipline (title pattern) if specified
  if (disciplineFilter && typeFilter === 'match') {
    const disciplinePatterns: Record<string, RegExp> = {
      uspsa: /uspsa/i,
      idpa: /idpa/i,
      steel: /steel challenge/i,
      highpower: /high power|highpower/i,
      benchrest: /benchrest/i,
      silhouette: /silhouette/i,
      '2700': /2700|bullseye/i,
    };
    const pattern = disciplinePatterns[disciplineFilter];
    if (pattern) {
      eventList = eventList.filter((e) => pattern.test(e.title));
    }
  }

  // Build calendar name based on filters
  let calendarName = 'Austin Rifle Club Events';
  let filename = 'arc-events.ics';
  if (typeFilter === 'match' && disciplineFilter) {
    const disciplineNames: Record<string, string> = {
      uspsa: 'USPSA', idpa: 'IDPA', steel: 'Steel Challenge',
      highpower: 'High Power Rifle', benchrest: 'Benchrest',
      silhouette: 'Silhouette', '2700': '2700 Bullseye',
    };
    calendarName = `ARC ${disciplineNames[disciplineFilter] || disciplineFilter} Matches`;
    filename = `arc-${disciplineFilter}-matches.ics`;
  } else if (typeFilter) {
    const typeNames: Record<string, string> = {
      match: 'Matches', youth_event: 'Youth Events',
      organized_practice: 'Practice', work_day: 'Work Days',
      arc_meeting: 'Meetings', arc_education: 'Education',
    };
    calendarName = `ARC ${typeNames[typeFilter] || typeFilter}`;
    filename = `arc-${typeFilter}.ics`;
  }

  const formatICalDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const escapeICalText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const publicUrl = getPublicUrl(c.env);
  const domain = new URL(publicUrl).hostname;

  const icsEvents = eventList.map((event) => {
    const uid = `${event.id}@${domain}`;
    const dtstamp = formatICalDate(new Date());
    const dtstart = formatICalDate(event.startTime);
    const dtend = formatICalDate(event.endTime);
    const summary = escapeICalText(event.title);
    const description = event.description ? escapeICalText(event.description) : '';
    const location = event.location ? escapeICalText(event.location) : 'Austin Rifle Club';

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      description ? `DESCRIPTION:${description}` : '',
      `LOCATION:${location}`,
      `URL:${publicUrl}/events/${event.id}`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Austin Rifle Club//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:America/Chicago',
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

export default app;
