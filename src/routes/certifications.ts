/**
 * Certifications API Routes
 *
 * Endpoints for managing certification types and member certifications.
 * Members can view their certifications.
 * Admins can manage certification types and grant/revoke certifications.
 */

import { Hono } from "hono";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { Env } from "../lib/auth";
import {
  requireMember,
  requireAdmin,
  MemberContext,
} from "../middleware/auth";
import {
  certificationTypes,
  certifications,
  members,
} from "../db/schema";
import { paginationSchema } from "../lib/validation";
import { logAudit } from "../lib/audit";
import { z } from "zod";
import { ValidationError, NotFoundError, ConflictError } from "../lib/errors";

const app = new Hono<{ Bindings: Env; Variables: MemberContext }>();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createCertificationTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  validityMonths: z.number().int().positive().optional(),
});

const updateCertificationTypeSchema = createCertificationTypeSchema.partial();

const grantCertificationSchema = z.object({
  memberId: z.string().uuid(),
  certificationTypeId: z.string().uuid(),
  earnedDate: z.string().datetime().optional(), // Defaults to now
  documentUrl: z.string().url().optional(),
});

// =============================================================================
// MEMBER ROUTES
// =============================================================================

/**
 * GET /api/certifications/my
 * Get current member's certifications
 */
app.get("/my", requireMember, async (c) => {
  const member = c.get("member");
  const db = c.get("db");

  const certs = await db
    .select({
      id: certifications.id,
      earnedDate: certifications.earnedDate,
      expiresAt: certifications.expiresAt,
      documentUrl: certifications.documentUrl,
      verifiedAt: certifications.verifiedAt,
      createdAt: certifications.createdAt,
      typeName: certificationTypes.name,
      typeDescription: certificationTypes.description,
      typeValidityMonths: certificationTypes.validityMonths,
    })
    .from(certifications)
    .innerJoin(certificationTypes, eq(certifications.certificationTypeId, certificationTypes.id))
    .where(eq(certifications.memberId, member.id))
    .orderBy(desc(certifications.earnedDate));

  // Categorize by status
  const now = new Date();
  const active = certs.filter((c) => !c.expiresAt || new Date(c.expiresAt) > now);
  const expired = certs.filter((c) => c.expiresAt && new Date(c.expiresAt) <= now);

  return c.json({
    certifications: certs,
    active,
    expired,
    summary: {
      total: certs.length,
      activeCount: active.length,
      expiredCount: expired.length,
    },
  });
});

/**
 * GET /api/certifications/types
 * List all certification types (public for viewing)
 */
app.get("/types", async (c) => {
  const db = c.get("db");

  const types = await db.query.certificationTypes.findMany({
    orderBy: certificationTypes.name,
  });

  return c.json(types);
});

// =============================================================================
// ADMIN ROUTES - CERTIFICATION TYPES
// =============================================================================

/**
 * POST /api/certifications/types
 * Create a new certification type (admin only)
 */
app.post("/types", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const body = await c.req.json();
  const parsed = createCertificationTypeSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const id = crypto.randomUUID();
  const now = new Date();

  const [created] = await db
    .insert(certificationTypes)
    .values({
      id,
      ...parsed.data,
      createdAt: now,
    })
    .returning();

  await logAudit(db, {
    action: 'certification_type.create',
    performedBy: admin.id,
    targetType: 'certification_type',
    targetId: id,
    details: parsed.data,
  });

  return c.json(created, 201);
});

/**
 * PATCH /api/certifications/types/:id
 * Update a certification type (admin only)
 */
app.patch("/types/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const existing = await db.query.certificationTypes.findFirst({
    where: eq(certificationTypes.id, id),
  });

  if (!existing) {
    throw new NotFoundError("Certification type", id);
  }

  const body = await c.req.json();
  const parsed = updateCertificationTypeSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const [updated] = await db
    .update(certificationTypes)
    .set(parsed.data)
    .where(eq(certificationTypes.id, id))
    .returning();

  await logAudit(db, {
    action: 'certification_type.update',
    performedBy: admin.id,
    targetType: 'certification_type',
    targetId: id,
    details: { before: existing, after: updated },
  });

  return c.json(updated);
});

/**
 * DELETE /api/certifications/types/:id
 * Delete a certification type (admin only)
 * Only allowed if no members have this certification
 */
app.delete("/types/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  // Check if any members have this certification
  const existingCerts = await db.query.certifications.findFirst({
    where: eq(certifications.certificationTypeId, id),
  });

  if (existingCerts) {
    throw new ValidationError("Cannot delete certification type: members have this certification. Revoke all certifications first.");
  }

  const [deleted] = await db
    .delete(certificationTypes)
    .where(eq(certificationTypes.id, id))
    .returning();

  if (!deleted) {
    throw new NotFoundError("Certification type", id);
  }

  await logAudit(db, {
    action: 'certification_type.delete',
    performedBy: admin.id,
    targetType: 'certification_type',
    targetId: id,
    details: { deleted },
  });

  return c.json({ success: true });
});

// =============================================================================
// ADMIN ROUTES - MEMBER CERTIFICATIONS
// =============================================================================

/**
 * GET /api/certifications
 * List all certifications with filters (admin only)
 */
app.get("/", requireAdmin, async (c) => {
  const db = c.get("db");
  const query = c.req.query();
  const { page, limit } = paginationSchema.parse(query);
  const offset = (page - 1) * limit;

  const conditions = [];

  // Filter by member
  if (query.memberId) {
    conditions.push(eq(certifications.memberId, query.memberId));
  }

  // Filter by type
  if (query.typeId) {
    conditions.push(eq(certifications.certificationTypeId, query.typeId));
  }

  // Filter by expiration status
  const now = Date.now();
  if (query.status === 'active') {
    conditions.push(
      sql`(${certifications.expiresAt} IS NULL OR ${certifications.expiresAt} > ${now})`
    );
  } else if (query.status === 'expired') {
    conditions.push(sql`${certifications.expiresAt} <= ${now}`);
  } else if (query.status === 'expiring_soon') {
    const thirtyDays = now + (30 * 24 * 60 * 60 * 1000);
    conditions.push(
      and(
        sql`${certifications.expiresAt} > ${now}`,
        sql`${certifications.expiresAt} <= ${thirtyDays}`
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [certs, countResult] = await Promise.all([
    db
      .select({
        id: certifications.id,
        memberId: certifications.memberId,
        memberFirstName: members.firstName,
        memberLastName: members.lastName,
        memberBadgeNumber: members.badgeNumber,
        earnedDate: certifications.earnedDate,
        expiresAt: certifications.expiresAt,
        documentUrl: certifications.documentUrl,
        verifiedBy: certifications.verifiedBy,
        verifiedAt: certifications.verifiedAt,
        createdAt: certifications.createdAt,
        typeName: certificationTypes.name,
        typeId: certificationTypes.id,
      })
      .from(certifications)
      .innerJoin(certificationTypes, eq(certifications.certificationTypeId, certificationTypes.id))
      .innerJoin(members, eq(certifications.memberId, members.id))
      .where(whereClause)
      .orderBy(desc(certifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(certifications)
      .where(whereClause),
  ]);

  return c.json({
    certifications: certs,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    },
  });
});

/**
 * POST /api/certifications
 * Grant a certification to a member (admin only)
 */
app.post("/", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const body = await c.req.json();
  const parsed = grantCertificationSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  // Check member exists
  const member = await db.query.members.findFirst({
    where: eq(members.id, parsed.data.memberId),
  });

  if (!member) {
    throw new NotFoundError("Member", parsed.data.memberId);
  }

  // Check certification type exists
  const certType = await db.query.certificationTypes.findFirst({
    where: eq(certificationTypes.id, parsed.data.certificationTypeId),
  });

  if (!certType) {
    throw new NotFoundError("Certification type", parsed.data.certificationTypeId);
  }

  // Check if member already has this certification (active)
  const existing = await db.query.certifications.findFirst({
    where: and(
      eq(certifications.memberId, parsed.data.memberId),
      eq(certifications.certificationTypeId, parsed.data.certificationTypeId),
      sql`(${certifications.expiresAt} IS NULL OR ${certifications.expiresAt} > ${Date.now()})`
    ),
  });

  if (existing) {
    throw new ConflictError("Member already has this certification", { existingCertification: existing });
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const earnedDate = parsed.data.earnedDate ? new Date(parsed.data.earnedDate) : now;

  // Calculate expiration if type has validity period
  let expiresAt: Date | null = null;
  if (certType.validityMonths) {
    expiresAt = new Date(earnedDate);
    expiresAt.setMonth(expiresAt.getMonth() + certType.validityMonths);
  }

  const [created] = await db
    .insert(certifications)
    .values({
      id,
      memberId: parsed.data.memberId,
      certificationTypeId: parsed.data.certificationTypeId,
      earnedDate,
      expiresAt,
      documentUrl: parsed.data.documentUrl,
      verifiedBy: admin.id,
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await logAudit(db, {
    action: 'certification.grant',
    performedBy: admin.id,
    targetType: 'certification',
    targetId: id,
    details: {
      memberId: parsed.data.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      certificationTypeName: certType.name,
      earnedDate,
      expiresAt,
    },
  });

  return c.json({
    ...created,
    typeName: certType.name,
    memberName: `${member.firstName} ${member.lastName}`,
  }, 201);
});

/**
 * DELETE /api/certifications/:id
 * Revoke a certification (admin only)
 */
app.delete("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  // Get certification details for audit log
  const cert = await db
    .select({
      id: certifications.id,
      memberId: certifications.memberId,
      memberFirstName: members.firstName,
      memberLastName: members.lastName,
      typeName: certificationTypes.name,
    })
    .from(certifications)
    .innerJoin(members, eq(certifications.memberId, members.id))
    .innerJoin(certificationTypes, eq(certifications.certificationTypeId, certificationTypes.id))
    .where(eq(certifications.id, id))
    .limit(1);

  if (!cert.length) {
    throw new NotFoundError("Certification", id);
  }

  await db.delete(certifications).where(eq(certifications.id, id));

  await logAudit(db, {
    action: 'certification.revoke',
    performedBy: admin.id,
    targetType: 'certification',
    targetId: id,
    details: {
      memberId: cert[0].memberId,
      memberName: `${cert[0].memberFirstName} ${cert[0].memberLastName}`,
      certificationTypeName: cert[0].typeName,
    },
  });

  return c.json({ success: true });
});

/**
 * POST /api/certifications/:id/renew
 * Renew an expiring or expired certification (admin only)
 */
app.post("/:id/renew", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const cert = await db
    .select({
      id: certifications.id,
      memberId: certifications.memberId,
      certificationTypeId: certifications.certificationTypeId,
      expiresAt: certifications.expiresAt,
      typeName: certificationTypes.name,
      typeValidityMonths: certificationTypes.validityMonths,
    })
    .from(certifications)
    .innerJoin(certificationTypes, eq(certifications.certificationTypeId, certificationTypes.id))
    .where(eq(certifications.id, id))
    .limit(1);

  if (!cert.length) {
    throw new NotFoundError("Certification", id);
  }

  if (!cert[0].typeValidityMonths) {
    throw new ValidationError("This certification does not expire and cannot be renewed");
  }

  // Calculate new expiration from now or current expiration (whichever is later)
  const now = new Date();
  const currentExpiry = cert[0].expiresAt ? new Date(cert[0].expiresAt) : now;
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseDate);
  newExpiry.setMonth(newExpiry.getMonth() + cert[0].typeValidityMonths);

  const [updated] = await db
    .update(certifications)
    .set({
      expiresAt: newExpiry,
      updatedAt: now,
    })
    .where(eq(certifications.id, id))
    .returning();

  await logAudit(db, {
    action: 'certification.renew',
    performedBy: admin.id,
    targetType: 'certification',
    targetId: id,
    details: {
      previousExpiry: cert[0].expiresAt,
      newExpiry,
      certificationTypeName: cert[0].typeName,
    },
  });

  return c.json({
    ...updated,
    typeName: cert[0].typeName,
  });
});

/**
 * GET /api/certifications/expiring
 * Get certifications expiring soon (admin only)
 */
app.get("/reports/expiring", requireAdmin, async (c) => {
  const db = c.get("db");
  const daysParam = parseInt(c.req.query("days") ?? "30", 10);
  const daysAhead = Number.isNaN(daysParam) ? 30 : Math.max(1, Math.min(365, daysParam));

  const now = Date.now();
  const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000);

  const expiring = await db
    .select({
      id: certifications.id,
      memberId: certifications.memberId,
      memberFirstName: members.firstName,
      memberLastName: members.lastName,
      memberEmail: sql<string>`(SELECT email FROM users WHERE id = ${members.userId})`,
      memberBadgeNumber: members.badgeNumber,
      expiresAt: certifications.expiresAt,
      typeName: certificationTypes.name,
    })
    .from(certifications)
    .innerJoin(certificationTypes, eq(certifications.certificationTypeId, certificationTypes.id))
    .innerJoin(members, eq(certifications.memberId, members.id))
    .where(
      and(
        sql`${certifications.expiresAt} > ${now}`,
        sql`${certifications.expiresAt} <= ${futureDate}`
      )
    )
    .orderBy(certifications.expiresAt);

  return c.json({
    expiring,
    count: expiring.length,
    daysAhead,
  });
});

/**
 * GET /api/certifications/stats
 * Get certification statistics (admin only)
 */
app.get("/stats", requireAdmin, async (c) => {
  const db = c.get("db");
  const now = Date.now();

  // Get counts by type
  const byType = await db
    .select({
      typeId: certificationTypes.id,
      typeName: certificationTypes.name,
      total: sql<number>`COUNT(${certifications.id})`,
      active: sql<number>`SUM(CASE WHEN ${certifications.expiresAt} IS NULL OR ${certifications.expiresAt} > ${now} THEN 1 ELSE 0 END)`,
      expired: sql<number>`SUM(CASE WHEN ${certifications.expiresAt} <= ${now} THEN 1 ELSE 0 END)`,
    })
    .from(certificationTypes)
    .leftJoin(certifications, eq(certificationTypes.id, certifications.certificationTypeId))
    .groupBy(certificationTypes.id, certificationTypes.name);

  // Get expiring soon counts
  const thirtyDays = now + (30 * 24 * 60 * 60 * 1000);
  const expiringSoon = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(certifications)
    .where(
      and(
        sql`${certifications.expiresAt} > ${now}`,
        sql`${certifications.expiresAt} <= ${thirtyDays}`
      )
    );

  return c.json({
    byType,
    expiringSoon: expiringSoon[0]?.count ?? 0,
    totalCertificationTypes: byType.length,
  });
});

export default app;
