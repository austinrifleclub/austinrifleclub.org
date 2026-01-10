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
  paginationSchema,
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
import { members, users } from "../db/schema";

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

/**
 * GET /api/events
 * List events (public events for visitors, all for members)
 */
app.get("/", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");

  const query = c.req.query();
  const { page, limit } = paginationSchema.parse(query);
  const offset = (page - 1) * limit;

  // Date range filters
  const startDate = query.start ? new Date(query.start) : new Date();
  const endDate = query.end
    ? new Date(query.end)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

  const eventType = query.type;

  const conditions = [
    eq(events.status, "published"),
    gte(events.startTime, startDate),
    lte(events.startTime, endDate),
  ];

  // Non-authenticated users only see public events
  if (!user) {
    conditions.push(eq(events.isPublic, true));
  }

  if (eventType) {
    conditions.push(eq(events.eventType, eventType));
  }

  const eventList = await db.query.events.findMany({
    where: and(...conditions),
    orderBy: events.startTime,
    limit,
    offset,
  });

  // Get registration counts in a single query (fixes N+1)
  const eventIds = eventList.map((e) => e.id);

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

  const eventsWithCounts = eventList.map((event) => {
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
    pagination: { page, limit },
  });
});

/**
 * GET /api/events/:id
 * Get a specific event
 */
app.get("/:id", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");
  const id = c.req.param("id");

  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  });

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  // Check visibility
  if (!event.isPublic && !user) {
    return c.json({ error: "Event not found" }, 404);
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

  return c.json({
    ...event,
    registrationCount: countResult?.count ?? 0,
    spotsRemaining: event.maxParticipants
      ? event.maxParticipants - (countResult?.count ?? 0)
      : null,
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
  const eventId = c.req.param("id");

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  if (event.status !== "published") {
    return c.json({ error: "Event not open for registration" }, 400);
  }

  // Check registration deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return c.json({ error: "Registration deadline has passed" }, 400);
  }

  // Check if already registered
  const existing = await db.query.eventRegistrations.findFirst({
    where: and(
      eq(eventRegistrations.eventId, eventId),
      eq(eventRegistrations.memberId, member.id)
    ),
  });

  if (existing) {
    return c.json({ error: "Already registered", registration: existing }, 409);
  }

  // Check capacity
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
  const isFull = !!(event.maxParticipants && currentCount >= event.maxParticipants);

  // Parse optional body for division/classification
  let division: string | undefined;
  let classification: string | undefined;

  try {
    const body = await c.req.json();
    division = body.division;
    classification = body.classification;
  } catch {
    // No body is fine
  }

  const registrationId = generateId();
  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      id: registrationId,
      eventId,
      memberId: member.id,
      status: isFull ? "waitlisted" : "registered",
      waitlistPosition: isFull ? currentCount - (event.maxParticipants ?? 0) + 1 : null,
      division,
      classification,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

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
    return c.json({ error: "Not registered for this event" }, 404);
  }

  // Check cancellation policy
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
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
    ? Math.floor((registration.amountPaid * refundPercent) / 100)
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

  // TODO: Process refund if applicable (via Stripe)

  return c.json({
    message: "Registration cancelled",
    refundPercent,
    refundAmount,
  });
});

/**
 * GET /api/events/my-registrations
 * Get current member's event registrations
 */
app.get("/my-registrations", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");

  const registrations = await db.query.eventRegistrations.findMany({
    where: eq(eventRegistrations.memberId, member.id),
    orderBy: desc(eventRegistrations.createdAt),
    limit: 50,
  });

  // Get event details for each registration
  const withEvents = await Promise.all(
    registrations.map(async (reg) => {
      const event = await db.query.events.findFirst({
        where: eq(events.id, reg.eventId),
      });
      return { ...reg, event };
    })
  );

  return c.json(withEvents);
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
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const eventId = generateId();
  const [event] = await db
    .insert(events)
    .values({
      id: eventId,
      ...parsed.data,
      rangeIds: parsed.data.rangeIds ? JSON.stringify(parsed.data.rangeIds) : null,
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
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const [updated] = await db
    .update(events)
    .set({
      ...parsed.data,
      rangeIds: parsed.data.rangeIds ? JSON.stringify(parsed.data.rangeIds) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Event not found" }, 404);
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
  const reason = body.reason as string;

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
    return c.json({ error: "Event not found" }, 404);
  }

  // Notify all registrants
  const registrations = await db.query.eventRegistrations.findMany({
    where: and(
      eq(eventRegistrations.eventId, id),
      sql`${eventRegistrations.status} IN ('registered', 'waitlisted')`
    ),
  });

  for (const reg of registrations) {
    const regMember = await db.query.members.findFirst({
      where: eq(members.id, reg.memberId),
    });

    if (regMember) {
      const regUser = await db.query.users.findFirst({
        where: eq(users.id, regMember.userId),
      });

      if (regUser) {
        const emailTemplate = eventCancellationEmail(
          regMember.firstName,
          updated.title,
          updated.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          reason,
          reg.amountPaid || undefined
        );
        await sendEmail(c.env.RESEND_API_KEY || '', {
          to: regUser.email,
          ...emailTemplate,
        });
      }
    }

    // Mark registration as cancelled
    await db
      .update(eventRegistrations)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(eventRegistrations.id, reg.id));
  }

  // TODO: Process refunds via Stripe

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
    return c.json({ error: "Registration not found" }, 404);
  }

  return c.json(updated);
});

/**
 * GET /api/events/calendar.ics
 * Export events as iCal feed
 */
app.get("/calendar.ics", optionalAuth, async (c) => {
  const db = c.get("db")!;

  const now = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const eventList = await db.query.events.findMany({
    where: and(
      eq(events.status, "published"),
      eq(events.isPublic, true),
      gte(events.startTime, now),
      lte(events.startTime, threeMonthsLater)
    ),
    orderBy: events.startTime,
    limit: 100,
  });

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

  const icsEvents = eventList.map((event) => {
    const uid = `${event.id}@austinrifleclub.org`;
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
      `URL:https://austinrifleclub.org/events/${event.id}`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Austin Rifle Club//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Austin Rifle Club Events',
    'X-WR-TIMEZONE:America/Chicago',
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="arc-events.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

export default app;
