/**
 * Volunteer Credits API Routes
 *
 * Handles volunteer hour logging and credit redemption.
 */

import { Hono } from "hono";
import { eq, and, sql, desc } from "drizzle-orm";
import { Env } from "../lib/auth";
import { requireMember, requireAdmin, MemberContext } from "../middleware/auth";
import { volunteerHours, duesPayments, members } from "../db/schema";
import { generateId, getCurrentFiscalYear } from "../lib/utils";
import { logAudit } from "../lib/audit";
import { ValidationError, NotFoundError } from "../lib/errors";

// Credit rates per activity type (in cents per hour)
const ACTIVITY_CREDIT_RATES: Record<string, { rate: number; maxPerDay: number }> = {
  work_day: { rate: 1500, maxPerDay: 6000 }, // $15/hr, max $60/day
  match_director: { rate: 2000, maxPerDay: 8000 }, // $20/hr, max $80/day
  rso: { rate: 1500, maxPerDay: 6000 },
  instructor: { rate: 2000, maxPerDay: 8000 },
  grounds_maintenance: { rate: 1500, maxPerDay: 6000 },
  event_support: { rate: 1500, maxPerDay: 6000 },
  other: { rate: 1000, maxPerDay: 4000 },
};

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// MEMBER ROUTES
// =============================================================================

/**
 * GET /api/volunteer/balance
 * Get current member's volunteer credit balance
 */
app.get("/balance", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const fiscalYear = getCurrentFiscalYear();

  // Get total credits earned and used for current fiscal year
  const [result] = await db
    .select({
      totalEarned: sql<number>`COALESCE(SUM(credit_amount), 0)`,
      totalUsed: sql<number>`COALESCE(SUM(credit_used), 0)`,
      totalHours: sql<number>`COALESCE(SUM(hours), 0)`,
    })
    .from(volunteerHours)
    .where(
      and(
        eq(volunteerHours.memberId, member.id),
        eq(volunteerHours.fiscalYear, fiscalYear)
      )
    );

  const balance = (result?.totalEarned ?? 0) - (result?.totalUsed ?? 0);

  // Get max credit allowed (from settings, default $100)
  const maxCredit = 10000; // $100 in cents

  return c.json({
    fiscalYear,
    balance,
    totalEarned: result?.totalEarned ?? 0,
    totalUsed: result?.totalUsed ?? 0,
    totalHours: result?.totalHours ?? 0,
    maxCredit,
    availableCredit: Math.min(balance, maxCredit),
  });
});

/**
 * GET /api/volunteer/history
 * Get member's volunteer hour history
 */
app.get("/history", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const fiscalYear = c.req.query("fiscalYear");

  let whereClause = eq(volunteerHours.memberId, member.id);
  if (fiscalYear) {
    const parsedYear = parseInt(fiscalYear, 10);
    if (!Number.isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100) {
      whereClause = and(whereClause, eq(volunteerHours.fiscalYear, parsedYear))!;
    }
  }

  const hours = await db.query.volunteerHours.findMany({
    where: whereClause,
    orderBy: desc(volunteerHours.date),
    limit: 100,
  });

  return c.json(hours);
});

/**
 * POST /api/volunteer/redeem
 * Redeem volunteer credits for dues payment
 */
app.post("/redeem", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const fiscalYear = getCurrentFiscalYear();

  const body = await c.req.json();
  const requestedAmount = body.amount as number; // in cents

  if (!requestedAmount || requestedAmount <= 0) {
    throw new ValidationError("Invalid redemption amount");
  }

  // Get available balance
  const [balanceResult] = await db
    .select({
      totalEarned: sql<number>`COALESCE(SUM(credit_amount), 0)`,
      totalUsed: sql<number>`COALESCE(SUM(credit_used), 0)`,
    })
    .from(volunteerHours)
    .where(
      and(
        eq(volunteerHours.memberId, member.id),
        eq(volunteerHours.fiscalYear, fiscalYear)
      )
    );

  const availableBalance = (balanceResult?.totalEarned ?? 0) - (balanceResult?.totalUsed ?? 0);
  const maxCredit = 10000; // $100 max

  if (requestedAmount > Math.min(availableBalance, maxCredit)) {
    throw new ValidationError("Insufficient credit balance", {
      available: Math.min(availableBalance, maxCredit),
      requested: requestedAmount,
    });
  }

  // Get unused volunteer hours to deduct from (FIFO)
  const unusedHours = await db.query.volunteerHours.findMany({
    where: and(
      eq(volunteerHours.memberId, member.id),
      eq(volunteerHours.fiscalYear, fiscalYear),
      sql`credit_amount > credit_used`
    ),
    orderBy: volunteerHours.date,
  });

  let remainingToDeduct = requestedAmount;
  const deductions: Array<{ id: string; amount: number }> = [];

  for (const hour of unusedHours) {
    if (remainingToDeduct <= 0) break;

    const currentUsed = hour.creditUsed ?? 0;
    const availableInRecord = hour.creditAmount - currentUsed;
    const deductFromRecord = Math.min(availableInRecord, remainingToDeduct);

    await db
      .update(volunteerHours)
      .set({
        creditUsed: currentUsed + deductFromRecord,
        updatedAt: new Date(),
      })
      .where(eq(volunteerHours.id, hour.id));

    deductions.push({ id: hour.id, amount: deductFromRecord });
    remainingToDeduct -= deductFromRecord;
  }

  // Create a dues payment record for the credit redemption
  const paymentId = generateId();
  await db.insert(duesPayments).values({
    id: paymentId,
    memberId: member.id,
    amount: requestedAmount,
    paymentType: "volunteer_credit",
    paymentMethod: "credit",
    creditsApplied: requestedAmount,
    status: "completed",
    createdAt: new Date(),
  });

  // Log to audit
  await logAudit(db, {
    action: 'volunteer.redeem',
    targetType: 'member',
    targetId: member.id,
    actorId: member.id,
    actorType: 'member',
    details: {
      amount: requestedAmount,
      deductions,
      paymentId,
    },
    ipAddress: c.req.header('cf-connecting-ip'),
  });

  return c.json({
    success: true,
    redeemed: requestedAmount,
    paymentId,
    remainingBalance: availableBalance - requestedAmount,
  });
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

/**
 * GET /api/volunteer/activity-types
 * Get all volunteer activity types
 */
app.get("/activity-types", async (c) => {
  // Return the static activity types with their rates
  const types = Object.entries(ACTIVITY_CREDIT_RATES).map(([id, config]) => ({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    creditRate: config.rate,
    maxCreditsPerDay: config.maxPerDay,
    isActive: true,
  }));

  return c.json(types);
});

/**
 * POST /api/volunteer/log
 * Log volunteer hours for a member (admin only)
 */
app.post("/log", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const body = await c.req.json();
  const {
    memberId,
    activity,
    date,
    hours,
    notes,
  } = body as {
    memberId: string;
    activity: string;
    date: string;
    hours: number;
    notes?: string;
  };

  if (!memberId || !activity || !date || !hours) {
    throw new ValidationError("Missing required fields: memberId, activity, date, hours");
  }

  if (hours <= 0 || hours > 24) {
    throw new ValidationError("Invalid hours (must be between 1 and 24)");
  }

  // Get activity rate config
  const activityConfig = ACTIVITY_CREDIT_RATES[activity] || ACTIVITY_CREDIT_RATES.other;

  // Verify member exists
  const targetMember = await db.query.members.findFirst({
    where: eq(members.id, memberId),
  });

  if (!targetMember) {
    throw new NotFoundError("Member", memberId);
  }

  // Calculate credits
  const creditAmount = Math.min(
    Math.round(hours * activityConfig.rate),
    activityConfig.maxPerDay
  );

  const volunteerDate = new Date(date);
  const fiscalYear = volunteerDate.getMonth() >= 9 // October+
    ? volunteerDate.getFullYear() + 1
    : volunteerDate.getFullYear();

  const hourId = generateId();
  const [loggedHour] = await db
    .insert(volunteerHours)
    .values({
      id: hourId,
      memberId,
      activity,
      date: volunteerDate,
      hours,
      notes,
      creditAmount,
      creditUsed: 0,
      fiscalYear,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Log to audit
  await logAudit(db, {
    action: 'volunteer.log',
    targetType: 'volunteer_hours',
    targetId: hourId,
    actorId: admin.id,
    actorType: 'admin',
    details: {
      memberId,
      hours,
      creditAmount,
      activity,
    },
    ipAddress: c.req.header('cf-connecting-ip'),
  });

  return c.json(loggedHour, 201);
});

/**
 * GET /api/volunteer/member/:id
 * Get volunteer hours for a specific member (admin only)
 */
app.get("/member/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const memberId = c.req.param("id");
  const fiscalYear = c.req.query("fiscalYear");

  let whereClause = eq(volunteerHours.memberId, memberId);
  if (fiscalYear) {
    const parsedYear = parseInt(fiscalYear, 10);
    if (!Number.isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100) {
      whereClause = and(whereClause, eq(volunteerHours.fiscalYear, parsedYear))!;
    }
  }

  const hours = await db.query.volunteerHours.findMany({
    where: whereClause,
    orderBy: desc(volunteerHours.date),
  });

  // Calculate summary
  const [summary] = await db
    .select({
      totalHours: sql<number>`COALESCE(SUM(hours), 0)`,
      totalEarned: sql<number>`COALESCE(SUM(credit_amount), 0)`,
      totalUsed: sql<number>`COALESCE(SUM(credit_used), 0)`,
    })
    .from(volunteerHours)
    .where(whereClause);

  return c.json({
    hours,
    summary: {
      totalHours: summary?.totalHours ?? 0,
      totalEarned: summary?.totalEarned ?? 0,
      totalUsed: summary?.totalUsed ?? 0,
      balance: (summary?.totalEarned ?? 0) - (summary?.totalUsed ?? 0),
    },
  });
});

/**
 * DELETE /api/volunteer/:id
 * Delete a volunteer hour record (admin only)
 */
app.delete("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const hour = await db.query.volunteerHours.findFirst({
    where: eq(volunteerHours.id, id),
  });

  if (!hour) {
    throw new NotFoundError("Volunteer record", id);
  }

  if ((hour.creditUsed ?? 0) > 0) {
    throw new ValidationError("Cannot delete record with used credits");
  }

  await db.delete(volunteerHours).where(eq(volunteerHours.id, id));

  // Log to audit
  await logAudit(db, {
    action: 'volunteer.delete',
    targetType: 'volunteer_hours',
    targetId: id,
    actorId: admin.id,
    actorType: 'admin',
    details: { memberId: hour.memberId, hours: hour.hours },
    ipAddress: c.req.header('cf-connecting-ip'),
  });

  return c.json({ success: true });
});

export default app;
