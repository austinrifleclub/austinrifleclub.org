/**
 * Guests API Routes
 *
 * Handles guest sign-in with waiver, visit tracking, and offline sync.
 *
 * Business Rules:
 * - Max 3 guests per member per visit
 * - Same guest can visit 3 times per calendar year
 * - Waiver required every visit
 * - After 3rd visit, guest is blocked until they become a member
 *
 * @see features.md Section 3 for guest features
 * @see features.md Section 8.2 for guest sign-in UX flow
 */

import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { Env } from "../lib/auth";
import { requireMember, requireAdmin, MemberContext } from "../middleware/auth";
import { guests, guestVisits, members } from "../db/schema";
import {
  createGuestSchema,
  signInGuestSchema,
  quickGuestSignInSchema,
  uuidSchema,
} from "../lib/validation";
import { generateId } from "../lib/utils";
import { ValidationError, NotFoundError, ForbiddenError } from "../lib/errors";

const app = new Hono<{ Bindings: Env; Variables: MemberContext }>();

// All guest routes require member authentication
app.use("*", requireMember);

// =============================================================================
// GUEST MANAGEMENT
// =============================================================================

/**
 * GET /api/guests
 * Get member's saved guests
 */
app.get("/", async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const guestList = await db.query.guests.findMany({
    where: eq(guests.createdByMemberId, member.id),
    orderBy: desc(guests.lastVisitAt),
  });

  return c.json(guestList);
});

/**
 * POST /api/guests
 * Add a new guest (without signing them in)
 */
app.post("/", async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const body = await c.req.json();
  const parsed = createGuestSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const guestId = generateId();
  const currentYear = new Date().getFullYear();

  const [guest] = await db
    .insert(guests)
    .values({
      id: guestId,
      ...parsed.data,
      createdByMemberId: member.id,
      visitCountCurrentYear: 0,
      visitCountYear: currentYear,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return c.json(guest, 201);
});

/**
 * GET /api/guests/:id
 * Get a specific guest with visit history
 */
app.get("/:id", async (c) => {
  const member = c.get("member");
  const db = c.get("db");
  const id = uuidSchema.parse(c.req.param("id"));

  const guest = await db.query.guests.findFirst({
    where: eq(guests.id, id),
  });

  if (!guest) {
    throw new NotFoundError("Guest", id);
  }

  // Verify member owns this guest
  if (guest.createdByMemberId !== member.id) {
    throw new ForbiddenError("You can only view guests you created");
  }

  // Get visit history
  const visits = await db.query.guestVisits.findMany({
    where: eq(guestVisits.guestId, id),
    orderBy: desc(guestVisits.signedInAt),
    limit: 20,
  });

  return c.json({
    ...guest,
    visits,
  });
});

// =============================================================================
// GUEST SIGN-IN
// =============================================================================

/**
 * POST /api/guests/:id/sign-in
 * Sign in an existing guest (with waiver)
 */
app.post("/:id/sign-in", async (c) => {
  const member = c.get("member");
  const db = c.get("db");
  const guestId = uuidSchema.parse(c.req.param("id"));

  const body = await c.req.json();
  const parsed = signInGuestSchema.safeParse({ ...body, guestId });

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  // Get guest
  const guest = await db.query.guests.findFirst({
    where: eq(guests.id, guestId),
  });

  if (!guest) {
    throw new NotFoundError("Guest", guestId);
  }

  // Verify member owns this guest
  if (guest.createdByMemberId !== member.id) {
    throw new ForbiddenError("You can only sign in guests you created");
  }

  // Check if guest is banned
  if (guest.status === "banned") {
    throw new ForbiddenError(`Guest is banned: ${guest.bannedReason || "No reason provided"}`);
  }

  // Check visit limit (reset count if new year)
  const currentYear = new Date().getFullYear();
  let visitCount = guest.visitCountCurrentYear ?? 0;

  if (guest.visitCountYear !== currentYear) {
    visitCount = 0; // Reset for new year
  }

  if (visitCount >= 3) {
    throw new ForbiddenError("Guest has reached visit limit for this year (3 visits max). Guest should consider becoming a member.");
  }

  // Check how many guests member has signed in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(guestVisits)
    .where(
      and(
        eq(guestVisits.hostMemberId, member.id),
        sql`${guestVisits.signedInAt} >= ${today.getTime()}`
      )
    );

  if ((todayCount?.count ?? 0) >= 3) {
    throw new ForbiddenError("Maximum 3 guests per visit");
  }

  // Create visit record
  const visitId = generateId();
  const now = new Date();

  const [visit] = await db
    .insert(guestVisits)
    .values({
      id: visitId,
      guestId,
      hostMemberId: member.id,
      waiverAgreedAt: now,
      waiverSignatureUrl: parsed.data.waiverSignatureUrl,
      waiverIpAddress: c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For"),
      waiverUserAgent: c.req.header("User-Agent"),
      signedInAt: now,
      offlineId: parsed.data.offlineId,
      syncedAt: parsed.data.offlineId ? now : null,
      createdAt: now,
    })
    .returning();

  // Update guest visit count
  const newVisitCount = visitCount + 1;
  const newStatus = newVisitCount >= 3 ? "limit_reached" : newVisitCount >= 2 ? "should_join" : "active";

  await db
    .update(guests)
    .set({
      visitCountCurrentYear: newVisitCount,
      visitCountYear: currentYear,
      lastVisitAt: now,
      status: newStatus,
      updatedAt: now,
    })
    .where(eq(guests.id, guestId));

  return c.json({
    visit,
    visitNumber: newVisitCount,
    visitsRemaining: 3 - newVisitCount,
    message:
      newVisitCount >= 3
        ? "This was the guest's final visit. They must become a member to visit again."
        : newVisitCount >= 2
          ? "Consider inviting this guest to become a member!"
          : "Guest signed in successfully",
  }, 201);
});

/**
 * POST /api/guests/quick-sign-in
 * Create new guest and sign them in at once
 */
app.post("/quick-sign-in", async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const body = await c.req.json();
  const parsed = quickGuestSignInSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  // Check today's guest count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(guestVisits)
    .where(
      and(
        eq(guestVisits.hostMemberId, member.id),
        sql`${guestVisits.signedInAt} >= ${today.getTime()}`
      )
    );

  if ((todayCount?.count ?? 0) >= 3) {
    throw new ForbiddenError("Maximum 3 guests per visit");
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  // Check if guest with same email already exists for this member
  let guest;
  if (parsed.data.email) {
    guest = await db.query.guests.findFirst({
      where: and(
        eq(guests.email, parsed.data.email),
        eq(guests.createdByMemberId, member.id)
      ),
    });
  }

  if (guest) {
    // Existing guest - check limits
    let visitCount = guest.visitCountCurrentYear ?? 0;
    if (guest.visitCountYear !== currentYear) {
      visitCount = 0;
    }

    if (visitCount >= 3) {
      throw new ForbiddenError("Guest has reached visit limit for this year");
    }

    if (guest.status === "banned") {
      throw new ForbiddenError("Guest is banned");
    }
  } else {
    // Create new guest
    const guestId = generateId();
    [guest] = await db
      .insert(guests)
      .values({
        id: guestId,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        createdByMemberId: member.id,
        visitCountCurrentYear: 0,
        visitCountYear: currentYear,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
  }

  // Create visit
  const visitId = generateId();
  const [visit] = await db
    .insert(guestVisits)
    .values({
      id: visitId,
      guestId: guest.id,
      hostMemberId: member.id,
      waiverAgreedAt: now,
      waiverSignatureUrl: parsed.data.waiverSignatureUrl,
      waiverIpAddress: c.req.header("CF-Connecting-IP"),
      waiverUserAgent: c.req.header("User-Agent"),
      signedInAt: now,
      offlineId: parsed.data.offlineId,
      syncedAt: parsed.data.offlineId ? now : null,
      createdAt: now,
    })
    .returning();

  // Update guest
  const newVisitCount = (guest.visitCountCurrentYear ?? 0) + 1;
  await db
    .update(guests)
    .set({
      visitCountCurrentYear: newVisitCount,
      visitCountYear: currentYear,
      lastVisitAt: now,
      status: newVisitCount >= 3 ? "limit_reached" : newVisitCount >= 2 ? "should_join" : "active",
      updatedAt: now,
    })
    .where(eq(guests.id, guest.id));

  return c.json({
    guest,
    visit,
    visitNumber: newVisitCount,
    visitsRemaining: 3 - newVisitCount,
  }, 201);
});

/**
 * POST /api/guests/sync
 * Sync offline guest sign-ins
 * Accepts array of sign-ins made while offline
 */
app.post("/sync", async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const body = await c.req.json();
  const signIns = body.signIns as Array<{
    offlineId: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    waiverAgreedAt: string;
    waiverSignatureUrl?: string;
    signedInAt: string;
  }>;

  if (!Array.isArray(signIns)) {
    throw new ValidationError("signIns must be an array");
  }

  const results = [];

  for (const signIn of signIns) {
    // Check if already synced
    const existing = await db.query.guestVisits.findFirst({
      where: eq(guestVisits.offlineId, signIn.offlineId),
    });

    if (existing) {
      results.push({ offlineId: signIn.offlineId, status: "already_synced" });
      continue;
    }

    // Find or create guest (scoped to this member)
    let guest;
    if (signIn.guestEmail) {
      guest = await db.query.guests.findFirst({
        where: and(
          eq(guests.email, signIn.guestEmail),
          eq(guests.createdByMemberId, member.id)
        ),
      });
    }

    if (!guest) {
      const guestId = generateId();
      [guest] = await db
        .insert(guests)
        .values({
          id: guestId,
          name: signIn.guestName,
          email: signIn.guestEmail,
          phone: signIn.guestPhone,
          createdByMemberId: member.id,
          visitCountCurrentYear: 0,
          visitCountYear: new Date().getFullYear(),
          status: "active",
          createdAt: new Date(signIn.signedInAt),
          updatedAt: new Date(),
        })
        .returning();
    }

    // Create visit
    const visitId = generateId();
    await db.insert(guestVisits).values({
      id: visitId,
      guestId: guest.id,
      hostMemberId: member.id,
      waiverAgreedAt: new Date(signIn.waiverAgreedAt),
      waiverSignatureUrl: signIn.waiverSignatureUrl,
      signedInAt: new Date(signIn.signedInAt),
      offlineId: signIn.offlineId,
      syncedAt: new Date(),
      createdAt: new Date(),
    });

    // Update guest visit count
    await db
      .update(guests)
      .set({
        visitCountCurrentYear: sql`${guests.visitCountCurrentYear} + 1`,
        lastVisitAt: new Date(signIn.signedInAt),
        updatedAt: new Date(),
      })
      .where(eq(guests.id, guest.id));

    results.push({ offlineId: signIn.offlineId, status: "synced", visitId });
  }

  return c.json({ results });
});

export default app;
