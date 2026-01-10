/**
 * Range Status API Routes
 *
 * Real-time range status display and management.
 * This is a key feature for the club - members need to know which ranges
 * are available before driving to the facility.
 *
 * Status values:
 * - open: Available for general use
 * - event: Reserved for scheduled event
 * - closed: Not available
 * - maintenance: Work in progress
 *
 * @see features.md Section 5.2 for range status features
 */

import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { Env } from "../lib/auth";
import {
  optionalAuth,
  requireAdmin,
  AuthContext,
  MemberContext,
} from "../middleware/auth";
import { createDb } from "../db";
import { rangeStatus, events, notificationPreferences, members } from "../db/schema";
import { updateRangeStatusSchema } from "../lib/validation";
import { logAudit } from "../lib/audit";
import {
  sendSMS,
  sendBulkSMS,
  rangeClosureAlert,
  rangeReopenAlert,
  safetyAlertSMS,
} from "../lib/sms";

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

/**
 * GET /api/range-status
 * Get status of all ranges (public)
 *
 * This is the main endpoint for the range status display.
 * Returns all ranges with their current status and any linked events.
 */
app.get("/", optionalAuth, async (c) => {
  const db = c.get("db")!;

  const ranges = await db.query.rangeStatus.findMany({
    orderBy: rangeStatus.id,
  });

  // Check for expired statuses and auto-revert
  const now = new Date();
  const results = await Promise.all(
    ranges.map(async (range) => {
      // If status has expired, revert to open
      if (range.expiresAt && new Date(range.expiresAt) < now) {
        if (range.status !== "open") {
          await db
            .update(rangeStatus)
            .set({
              status: "open",
              statusNote: null,
              expiresAt: null,
              calendarEventId: null,
              updatedAt: now,
            })
            .where(eq(rangeStatus.id, range.id));

          return {
            ...range,
            status: "open",
            statusNote: null,
            expiresAt: null,
            calendarEventId: null,
          };
        }
      }

      // If linked to an event, get event details
      let linkedEvent = null;
      if (range.calendarEventId) {
        linkedEvent = await db.query.events.findFirst({
          where: eq(events.id, range.calendarEventId),
        });
      }

      return {
        ...range,
        linkedEvent: linkedEvent
          ? {
              id: linkedEvent.id,
              title: linkedEvent.title,
              startTime: linkedEvent.startTime,
              endTime: linkedEvent.endTime,
            }
          : null,
      };
    })
  );

  // Add last updated timestamp for cache validation
  const lastUpdated = results.reduce((latest, range) => {
    const rangeUpdated = new Date(range.updatedAt);
    return rangeUpdated > latest ? rangeUpdated : latest;
  }, new Date(0));

  return c.json({
    ranges: results,
    lastUpdated,
    // Include weather placeholder - would integrate with weather API
    weather: {
      temp: null,
      conditions: null,
      windSpeed: null,
      source: "weather integration pending",
    },
  });
});

/**
 * GET /api/range-status/:id
 * Get status of a specific range
 */
app.get("/:id", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const id = c.req.param("id");

  const range = await db.query.rangeStatus.findFirst({
    where: eq(rangeStatus.id, id),
  });

  if (!range) {
    return c.json({ error: "Range not found" }, 404);
  }

  // Get linked event if any
  let linkedEvent = null;
  if (range.calendarEventId) {
    linkedEvent = await db.query.events.findFirst({
      where: eq(events.id, range.calendarEventId),
    });
  }

  return c.json({
    ...range,
    linkedEvent,
  });
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

/**
 * PATCH /api/range-status/:id
 * Update range status (admin only)
 *
 * This is used by RSOs and board members to update range availability.
 * Changes take effect immediately and are visible to all users.
 */
app.patch("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const body = await c.req.json();
  const parsed = updateRangeStatusSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const existing = await db.query.rangeStatus.findFirst({
    where: eq(rangeStatus.id, id),
  });

  if (!existing) {
    return c.json({ error: "Range not found" }, 404);
  }

  const [updated] = await db
    .update(rangeStatus)
    .set({
      ...parsed.data,
      updatedBy: admin.id,
      updatedAt: new Date(),
    })
    .where(eq(rangeStatus.id, id))
    .returning();

  // Log to audit
  await logAudit(db, {
    action: 'range.status_change',
    performedBy: admin.id,
    targetType: 'range',
    targetId: id,
    details: {
      previous: { status: existing.status, note: existing.statusNote },
      current: { status: updated.status, note: updated.statusNote },
    },
  });

  // If range was closed, send SMS notifications
  if (parsed.data.status === 'closed' && existing.status !== 'closed') {
    const sendNotifications = body.sendNotifications !== false;
    if (sendNotifications && c.env.TWILIO_ACCOUNT_SID && c.env.TWILIO_AUTH_TOKEN) {
      await sendRangeClosureNotifications(
        db,
        c.env.TWILIO_ACCOUNT_SID,
        c.env.TWILIO_AUTH_TOKEN,
        updated.name,
        parsed.data.statusNote || 'Temporarily closed'
      );
    }
  }

  return c.json(updated);
});

/**
 * POST /api/range-status/:id/close
 * Quick close a range (admin only)
 *
 * Convenience endpoint for quickly closing a range with a reason.
 */
app.post("/:id/close", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const body = await c.req.json();
  const reason = body.reason as string;
  const duration = body.duration as number; // Minutes
  const sendNotifications = body.sendNotifications !== false;

  if (!reason) {
    return c.json({ error: "Reason required" }, 400);
  }

  // Get current status for audit log
  const existing = await db.query.rangeStatus.findFirst({
    where: eq(rangeStatus.id, id),
  });

  if (!existing) {
    return c.json({ error: "Range not found" }, 404);
  }

  let expiresAt = null;
  if (duration && duration > 0) {
    expiresAt = new Date(Date.now() + duration * 60 * 1000);
  }

  const [updated] = await db
    .update(rangeStatus)
    .set({
      status: "closed",
      statusNote: reason,
      expiresAt,
      updatedBy: admin.id,
      updatedAt: new Date(),
    })
    .where(eq(rangeStatus.id, id))
    .returning();

  // Log to audit
  await logAudit(db, {
    action: 'range.close',
    performedBy: admin.id,
    targetType: 'range',
    targetId: id,
    details: {
      rangeName: updated.name,
      reason,
      expiresAt,
      previousStatus: existing.status,
    },
  });

  // Send SMS notifications to opted-in members
  let notificationsSent = 0;
  if (sendNotifications && c.env.TWILIO_ACCOUNT_SID && c.env.TWILIO_AUTH_TOKEN) {
    const result = await sendRangeClosureNotifications(
      db,
      c.env.TWILIO_ACCOUNT_SID,
      c.env.TWILIO_AUTH_TOKEN,
      updated.name,
      reason
    );
    notificationsSent = result.sent;
  }

  return c.json({
    ...updated,
    message: expiresAt
      ? `Range closed until ${expiresAt.toLocaleTimeString()}`
      : "Range closed until further notice",
    notificationsSent,
  });
});

/**
 * POST /api/range-status/:id/open
 * Quick open a range (admin only)
 *
 * Clears any closure status and returns range to normal operation.
 */
app.post("/:id/open", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const body = await c.req.json().catch(() => ({}));
  const sendNotifications = body.sendNotifications !== false;

  // Get current status for audit log
  const existing = await db.query.rangeStatus.findFirst({
    where: eq(rangeStatus.id, id),
  });

  if (!existing) {
    return c.json({ error: "Range not found" }, 404);
  }

  const [updated] = await db
    .update(rangeStatus)
    .set({
      status: "open",
      statusNote: null,
      expiresAt: null,
      calendarEventId: null,
      updatedBy: admin.id,
      updatedAt: new Date(),
    })
    .where(eq(rangeStatus.id, id))
    .returning();

  // Log to audit
  await logAudit(db, {
    action: 'range.open',
    performedBy: admin.id,
    targetType: 'range',
    targetId: id,
    details: {
      rangeName: updated.name,
      previousStatus: existing.status,
      previousNote: existing.statusNote,
    },
  });

  // If range was previously closed, send reopen notifications
  let notificationsSent = 0;
  if (existing.status === 'closed' && sendNotifications && c.env.TWILIO_ACCOUNT_SID && c.env.TWILIO_AUTH_TOKEN) {
    const result = await sendRangeReopenNotifications(
      db,
      c.env.TWILIO_ACCOUNT_SID,
      c.env.TWILIO_AUTH_TOKEN,
      updated.name
    );
    notificationsSent = result.sent;
  }

  return c.json({
    ...updated,
    notificationsSent,
  });
});

/**
 * POST /api/range-status/bulk-update
 * Update multiple ranges at once (admin only)
 *
 * Useful for work days or events that affect multiple ranges.
 */
app.post("/bulk-update", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const body = await c.req.json();
  const updates = body.updates as Array<{
    id: string;
    status: string;
    statusNote?: string;
    expiresAt?: string;
  }>;

  if (!Array.isArray(updates) || updates.length === 0) {
    return c.json({ error: "updates array required" }, 400);
  }

  const results = await Promise.all(
    updates.map(async (update) => {
      const parsed = updateRangeStatusSchema.safeParse(update);
      if (!parsed.success) {
        return { id: update.id, error: parsed.error.issues };
      }

      const [updated] = await db
        .update(rangeStatus)
        .set({
          ...parsed.data,
          updatedBy: admin.id,
          updatedAt: new Date(),
        })
        .where(eq(rangeStatus.id, update.id))
        .returning();

      return updated || { id: update.id, error: "Not found" };
    })
  );

  return c.json({ results });
});

/**
 * POST /api/range-status/sync-calendar
 * Sync range status with calendar events (admin only)
 *
 * Updates range statuses based on currently scheduled events.
 * Should be called periodically (e.g., every hour via cron).
 */
app.post("/sync-calendar", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const now = new Date();

  // Find active events that affect ranges
  const activeEvents = await db.query.events.findMany({
    where: (events, { and, lte, gte, eq }) =>
      and(
        eq(events.status, "published"),
        lte(events.startTime, now),
        gte(events.endTime, now)
      ),
  });

  const updates = [];

  for (const event of activeEvents) {
    if (!event.rangeIds) continue;

    let rangeIds: string[];
    try {
      rangeIds = JSON.parse(event.rangeIds);
    } catch {
      continue;
    }

    for (const rangeId of rangeIds) {
      const [updated] = await db
        .update(rangeStatus)
        .set({
          status: "event",
          statusNote: event.title,
          calendarEventId: event.id,
          expiresAt: event.endTime,
          updatedBy: admin.id,
          updatedAt: now,
        })
        .where(eq(rangeStatus.id, rangeId))
        .returning();

      if (updated) {
        updates.push({ rangeId, eventId: event.id, title: event.title });
      }
    }
  }

  // Clear ranges that no longer have active events
  const allRanges = await db.query.rangeStatus.findMany();

  for (const range of allRanges) {
    if (range.status === "event" && range.calendarEventId) {
      // Check if the linked event is still active
      const event = activeEvents.find((e) => e.id === range.calendarEventId);
      if (!event) {
        await db
          .update(rangeStatus)
          .set({
            status: "open",
            statusNote: null,
            calendarEventId: null,
            expiresAt: null,
            updatedBy: admin.id,
            updatedAt: now,
          })
          .where(eq(rangeStatus.id, range.id));

        updates.push({ rangeId: range.id, action: "cleared" });
      }
    }
  }

  return c.json({
    syncedAt: now,
    updates,
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper to check if SMS is enabled for a preference JSON
 */
function isSmsEnabled(prefJson: string | null): boolean {
  if (!prefJson) return false;
  try {
    const pref = JSON.parse(prefJson);
    return pref.sms === true;
  } catch {
    return false;
  }
}

/**
 * Send range closure notifications to opted-in members
 */
async function sendRangeClosureNotifications(
  db: any,
  accountSid: string,
  authToken: string,
  rangeName: string,
  reason: string
): Promise<{ sent: number; failed: number }> {
  // Get all notification preferences with rangeStatus SMS enabled
  const prefs = await db.query.notificationPreferences.findMany();

  // Filter for SMS enabled on rangeStatus and get user IDs
  const smsEnabledUserIds = prefs
    .filter((p: any) => isSmsEnabled(p.rangeStatus))
    .map((p: any) => p.userId);

  if (smsEnabledUserIds.length === 0) {
    return { sent: 0, failed: 0 };
  }

  // Get members with phones for these users
  const membersWithPhones = await db.query.members.findMany({
    where: sql`${members.userId} IN (${sql.join(smsEnabledUserIds.map((id: string) => sql`${id}`), sql`, `)}) AND ${members.phone} IS NOT NULL`,
  });

  if (membersWithPhones.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const phones = membersWithPhones.map((m: any) => m.phone).filter(Boolean);
  const message = rangeClosureAlert(rangeName, reason);

  return sendBulkSMS(accountSid, authToken, phones, message);
}

/**
 * Send range reopen notifications to opted-in members
 */
async function sendRangeReopenNotifications(
  db: any,
  accountSid: string,
  authToken: string,
  rangeName: string
): Promise<{ sent: number; failed: number }> {
  // Get all notification preferences with rangeStatus SMS enabled
  const prefs = await db.query.notificationPreferences.findMany();

  // Filter for SMS enabled on rangeStatus
  const smsEnabledUserIds = prefs
    .filter((p: any) => isSmsEnabled(p.rangeStatus))
    .map((p: any) => p.userId);

  if (smsEnabledUserIds.length === 0) {
    return { sent: 0, failed: 0 };
  }

  // Get members with phones for these users
  const membersWithPhones = await db.query.members.findMany({
    where: sql`${members.userId} IN (${sql.join(smsEnabledUserIds.map((id: string) => sql`${id}`), sql`, `)}) AND ${members.phone} IS NOT NULL`,
  });

  if (membersWithPhones.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const phones = membersWithPhones.map((m: any) => m.phone).filter(Boolean);
  const message = rangeReopenAlert(rangeName);

  return sendBulkSMS(accountSid, authToken, phones, message);
}

/**
 * POST /api/range-status/safety-alert
 * Send a safety alert to all opted-in members (admin only)
 */
app.post("/safety-alert", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const body = await c.req.json();
  const message = body.message as string;

  if (!message) {
    return c.json({ error: "Message required" }, 400);
  }

  if (message.length > 140) {
    return c.json({ error: "Message too long (max 140 characters)" }, 400);
  }

  // Get all notification preferences with safetyAlerts SMS enabled
  const prefs = await db.query.notificationPreferences.findMany();
  const smsEnabledUserIds = prefs
    .filter((p: any) => isSmsEnabled(p.safetyAlerts))
    .map((p: any) => p.userId);

  if (smsEnabledUserIds.length === 0) {
    return c.json({
      success: true,
      message: "No members opted in for safety alerts",
      sent: 0,
    });
  }

  // Get members with phones
  const membersWithPhones = await db.query.members.findMany({
    where: sql`${members.userId} IN (${sql.join(smsEnabledUserIds.map((id: string) => sql`${id}`), sql`, `)}) AND ${members.phone} IS NOT NULL`,
  });

  if (membersWithPhones.length === 0) {
    return c.json({
      success: true,
      message: "No members with phone numbers opted in",
      sent: 0,
    });
  }

  // Log to audit
  await logAudit(db, {
    action: 'safety_alert.send',
    performedBy: admin.id,
    targetType: 'broadcast',
    targetId: 'safety',
    details: {
      message,
      recipientCount: membersWithPhones.length,
    },
  });

  if (!c.env.TWILIO_ACCOUNT_SID || !c.env.TWILIO_AUTH_TOKEN) {
    console.log('[SMS] Safety alert (dev mode):', message);
    return c.json({
      success: true,
      message: "Safety alert logged (SMS not configured)",
      sent: 0,
    });
  }

  const phones = membersWithPhones.map((m: any) => m.phone).filter(Boolean);
  const smsBody = safetyAlertSMS(message);
  const result = await sendBulkSMS(c.env.TWILIO_ACCOUNT_SID, c.env.TWILIO_AUTH_TOKEN, phones, smsBody);

  return c.json({
    success: true,
    sent: result.sent,
    failed: result.failed,
  });
});

export default app;
