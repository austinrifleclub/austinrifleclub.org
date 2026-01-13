/**
 * Members API Routes
 *
 * Endpoints for member profile management.
 * Most operations require authenticated member or admin access.
 *
 * @see features.md Section 1 for membership requirements
 * @see technical.md Section 6 for support tier considerations
 */

import { Hono } from "hono";
import { eq, and, like, desc, asc, gte, lte, sql } from "drizzle-orm";
import { Env } from "../lib/auth";
import {
  requireAuth,
  requireMember,
  requireAdmin,
  AuthContext,
  MemberContext,
} from "../middleware/auth";
import {
  members,
  duesPayments,
  volunteerHours,
  certifications,
  certificationTypes,
  guestVisits,
  users,
  boardMembers,
  boardPositions,
} from "../db/schema";
import {
  updateMemberSchema,
  adminUpdateMemberSchema,
  paginationSchema,
} from "../lib/validation";
import {
  generateReferralCode,
  getCurrentFiscalYear,
  isDuesCurrent,
  isInGracePeriod,
} from "../lib/utils";
import { logAudit } from "../lib/audit";
import { ValidationError, NotFoundError } from "../lib/errors";

const app = new Hono<{ Bindings: Env; Variables: MemberContext }>();

// =============================================================================
// MEMBER SELF-SERVICE ROUTES
// =============================================================================

/**
 * GET /api/members/me
 * Get current member's profile with related data
 * Returns null if user has no member profile (allows dashboard to show apply flow)
 */
app.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  // Look up member profile for authenticated user
  const member = await db.query.members.findFirst({
    where: eq(members.userId, user.id),
  });

  // Return null if no member profile - user can still access dashboard to apply
  if (!member) {
    return c.json(null);
  }

  // Get volunteer credit balance for current fiscal year
  const fiscalYear = getCurrentFiscalYear();
  const credits = await db
    .select({
      total: sql<number>`COALESCE(SUM(credit_amount - credit_used), 0)`,
    })
    .from(volunteerHours)
    .where(
      and(
        eq(volunteerHours.memberId, member.id),
        eq(volunteerHours.fiscalYear, fiscalYear)
      )
    );

  // Get active certifications with type info
  const certs = await db
    .select({
      id: certifications.id,
      certificationTypeId: certifications.certificationTypeId,
      earnedDate: certifications.earnedDate,
      expiresAt: certifications.expiresAt,
      typeName: certificationTypes.name,
      typeDescription: certificationTypes.description,
    })
    .from(certifications)
    .leftJoin(certificationTypes, eq(certifications.certificationTypeId, certificationTypes.id))
    .where(eq(certifications.memberId, member.id));

  // Get family members if primary
  let familyMembers: typeof members.$inferSelect[] = [];
  if (member.familyRole === "primary") {
    familyMembers = await db.query.members.findMany({
      where: eq(members.primaryMemberId, member.id),
    });
  }

  // Get current board position (if any)
  const boardPosition = await db
    .select({
      positionId: boardPositions.id,
      title: boardPositions.title,
    })
    .from(boardMembers)
    .innerJoin(boardPositions, eq(boardMembers.positionId, boardPositions.id))
    .where(
      and(
        eq(boardMembers.memberId, member.id),
        eq(boardMembers.isCurrent, true)
      )
    )
    .limit(1);

  return c.json({
    ...member,
    volunteerCreditBalance: credits[0]?.total ?? 0,
    certifications: certs,
    familyMembers,
    duesCurrent: member.expirationDate
      ? isDuesCurrent(member.expirationDate)
      : false,
    inGracePeriod: member.expirationDate
      ? isInGracePeriod(member.expirationDate)
      : false,
    boardPosition: boardPosition[0] ?? null,
  });
});

/**
 * PATCH /api/members/me
 * Update current member's profile (self-service)
 */
app.patch("/me", requireMember, async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const body = await c.req.json();
  const parsed = updateMemberSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const [updated] = await db
    .update(members)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(members.id, member.id))
    .returning();

  return c.json(updated);
});

/**
 * GET /api/members/me/referral-code
 * Get or generate member's referral code
 */
app.get("/me/referral-code", requireMember, async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  // If member already has a referral code, return it
  if (member.referralCode) {
    // Count referrals
    const referrals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(members)
      .where(eq(members.referredBy, member.id));

    const publicUrl = c.env.PUBLIC_URL || 'https://austinrifleclub.org';
    return c.json({
      code: member.referralCode,
      referralCount: referrals[0]?.count ?? 0,
      referralUrl: `${publicUrl}/join?ref=${member.referralCode}`,
    });
  }

  // Generate new referral code
  const code = generateReferralCode();
  await db
    .update(members)
    .set({ referralCode: code, updatedAt: new Date() })
    .where(eq(members.id, member.id));

  const publicUrl = c.env.PUBLIC_URL || 'https://austinrifleclub.org';
  return c.json({
    code,
    referralCount: 0,
    referralUrl: `${publicUrl}/join?ref=${code}`,
  });
});

/**
 * GET /api/members/me/payments
 * Get member's payment history
 */
app.get("/me/payments", requireMember, async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const payments = await db.query.duesPayments.findMany({
    where: eq(duesPayments.memberId, member.id),
    orderBy: desc(duesPayments.createdAt),
    limit: 50,
  });

  return c.json(payments);
});

/**
 * GET /api/members/me/volunteer-hours
 * Get member's volunteer hours and credits
 */
app.get("/me/volunteer-hours", requireMember, async (c) => {
  const member = c.get("member");
  const db = c.get("db");
  const fiscalYear = getCurrentFiscalYear();

  const hours = await db.query.volunteerHours.findMany({
    where: eq(volunteerHours.memberId, member.id),
    orderBy: desc(volunteerHours.date),
    limit: 100,
  });

  // Sum credits by fiscal year
  const creditsByYear = await db
    .select({
      fiscalYear: volunteerHours.fiscalYear,
      totalCredits: sql<number>`SUM(credit_amount)`,
      usedCredits: sql<number>`SUM(credit_used)`,
    })
    .from(volunteerHours)
    .where(eq(volunteerHours.memberId, member.id))
    .groupBy(volunteerHours.fiscalYear);

  return c.json({
    hours,
    creditsByYear,
    currentYearBalance:
      creditsByYear.find((y) => y.fiscalYear === fiscalYear)?.totalCredits ?? 0,
  });
});

/**
 * GET /api/members/me/guests
 * Get guests the member has signed in
 */
app.get("/me/guests", requireMember, async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const visits = await db.query.guestVisits.findMany({
    where: eq(guestVisits.hostMemberId, member.id),
    orderBy: desc(guestVisits.signedInAt),
    limit: 100,
    with: {
      // Would need guest relation
    },
  });

  return c.json(visits);
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

/**
 * GET /api/members
 * List all members with advanced filtering (admin only)
 *
 * Query params:
 * - search: Search by name, badge number, or email
 * - status: Filter by member status (active, suspended, expired, etc.)
 * - type: Filter by membership type (individual, family, senior, etc.)
 * - expiresWithin: Filter members expiring within N days
 * - expiredAfter: Filter members expired after date (ISO string)
 * - hasCertification: Filter by certification type
 * - hasVolunteerHours: Filter members with volunteer hours (true/false)
 * - sort: Sort field (name, expiration, created, badge)
 * - order: Sort order (asc, desc)
 */
app.get("/", requireAdmin, async (c) => {
  const db = c.get("db");

  const query = c.req.query();
  const { page, limit } = paginationSchema.parse(query);
  const offset = (page - 1) * limit;

  // Filter options
  const status = query.status;
  const search = query.search;
  const membershipType = query.type;
  const expiresWithin = query.expiresWithin ? parseInt(query.expiresWithin, 10) : undefined;
  const expiredAfter = query.expiredAfter;
  const hasCertification = query.hasCertification;
  const hasVolunteerHours = query.hasVolunteerHours;
  const familyRole = query.familyRole;

  // Sort options
  const sortField = query.sort || 'created';
  const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

  const conditions = [];

  if (status) {
    conditions.push(eq(members.status, status));
  }
  if (membershipType) {
    conditions.push(eq(members.membershipType, membershipType));
  }
  if (familyRole) {
    conditions.push(eq(members.familyRole, familyRole));
  }
  if (search) {
    conditions.push(
      sql`(
        ${members.firstName} LIKE ${`%${search}%`} OR
        ${members.lastName} LIKE ${`%${search}%`} OR
        ${members.badgeNumber} LIKE ${`%${search}%`} OR
        EXISTS (
          SELECT 1 FROM ${users}
          WHERE ${users.id} = ${members.userId}
          AND ${users.email} LIKE ${`%${search}%`}
        )
      )`
    );
  }

  // Expiration filters
  if (expiresWithin !== undefined) {
    const now = Date.now();
    const futureDate = now + (expiresWithin * 24 * 60 * 60 * 1000);
    conditions.push(
      and(
        sql`${members.expirationDate} > ${now}`,
        sql`${members.expirationDate} <= ${futureDate}`
      )
    );
  }
  if (expiredAfter) {
    const expiredDate = new Date(expiredAfter).getTime();
    conditions.push(sql`${members.expirationDate} < ${Date.now()}`);
    conditions.push(sql`${members.expirationDate} >= ${expiredDate}`);
  }

  // Certification filter
  if (hasCertification) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${certifications}
        WHERE ${certifications.memberId} = ${members.id}
        AND ${certifications.certificationTypeId} = ${hasCertification}
        AND (${certifications.expiresAt} IS NULL OR ${certifications.expiresAt} > ${Date.now()})
      )`
    );
  }

  // Volunteer hours filter
  if (hasVolunteerHours === 'true') {
    const fiscalYear = getCurrentFiscalYear();
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${volunteerHours}
        WHERE ${volunteerHours.memberId} = ${members.id}
        AND ${volunteerHours.fiscalYear} = ${fiscalYear}
      )`
    );
  } else if (hasVolunteerHours === 'false') {
    const fiscalYear = getCurrentFiscalYear();
    conditions.push(
      sql`NOT EXISTS (
        SELECT 1 FROM ${volunteerHours}
        WHERE ${volunteerHours.memberId} = ${members.id}
        AND ${volunteerHours.fiscalYear} = ${fiscalYear}
      )`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Determine sort column
  let orderByClause;
  const orderFn = sortOrder === 'asc' ? asc : desc;
  switch (sortField) {
    case 'name':
      orderByClause = orderFn(members.lastName);
      break;
    case 'expiration':
      orderByClause = orderFn(members.expirationDate);
      break;
    case 'badge':
      orderByClause = orderFn(members.badgeNumber);
      break;
    case 'created':
    default:
      orderByClause = orderFn(members.createdAt);
      break;
  }

  const [memberList, countResult] = await Promise.all([
    db.query.members.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(members)
      .where(whereClause),
  ]);

  return c.json({
    members: memberList,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    },
    filters: {
      status,
      type: membershipType,
      search,
      expiresWithin,
      hasCertification,
      hasVolunteerHours,
      sort: sortField,
      order: sortOrder,
    },
  });
});

/**
 * GET /api/members/:id
 * Get a specific member (admin only)
 */
app.get("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const member = await db.query.members.findFirst({
    where: eq(members.id, id),
  });

  if (!member) {
    throw new NotFoundError("Member", id);
  }

  // Get additional data
  const [payments, hours, certs] = await Promise.all([
    db.query.duesPayments.findMany({
      where: eq(duesPayments.memberId, id),
      orderBy: desc(duesPayments.createdAt),
      limit: 10,
    }),
    db.query.volunteerHours.findMany({
      where: eq(volunteerHours.memberId, id),
      orderBy: desc(volunteerHours.date),
      limit: 20,
    }),
    db.query.certifications.findMany({
      where: eq(certifications.memberId, id),
    }),
  ]);

  return c.json({
    ...member,
    recentPayments: payments,
    recentVolunteerHours: hours,
    certifications: certs,
  });
});

/**
 * PATCH /api/members/:id
 * Update a member (admin only)
 */
app.patch("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  // Get current member state for audit log
  const currentMember = await db.query.members.findFirst({
    where: eq(members.id, id),
  });

  if (!currentMember) {
    throw new NotFoundError("Member", id);
  }

  const body = await c.req.json();
  const parsed = adminUpdateMemberSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const [updated] = await db
    .update(members)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(members.id, id))
    .returning();

  // Log changes to audit log
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    const oldValue = (currentMember as Record<string, unknown>)[key];
    if (oldValue !== value) {
      changes[key] = { from: oldValue, to: value };
    }
  }

  if (Object.keys(changes).length > 0) {
    await logAudit(db, {
      action: 'member.update',
      performedBy: admin.id,
      targetType: 'member',
      targetId: id,
      details: { changes },
    });
  }

  return c.json(updated);
});

/**
 * GET /api/members/expiring
 * Get members with expiring memberships (admin only)
 */
app.get("/reports/expiring", requireAdmin, async (c) => {
  const db = c.get("db");
  const daysAhead = parseInt(c.req.query("days") ?? "30", 10);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  const expiringMembers = await db.query.members.findMany({
    where: and(
      eq(members.status, "active"),
      sql`${members.expirationDate} <= ${cutoffDate.getTime()}`,
      sql`${members.expirationDate} > ${Date.now()}`
    ),
    orderBy: members.expirationDate,
  });

  return c.json(expiringMembers);
});

export default app;
