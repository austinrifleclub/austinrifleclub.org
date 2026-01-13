/**
 * Applications API Routes
 *
 * Handles the membership application flow from prospect to approved member.
 *
 * Application Status Flow:
 * draft → submitted → documents_pending → documents_approved → paid →
 * safety_scheduled → safety_complete → orientation_scheduled →
 * orientation_complete → pending_vote → approved/rejected
 *
 * @see features.md Section 1.2 for application process
 * @see features.md Section 8.1 for detailed UX flow
 */

import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { Env } from "../lib/auth";
import { log } from "../lib/logger";
import {
  requireAuth,
  requireAdmin,
  AuthContext,
  MemberContext,
} from "../middleware/auth";
import { createDb } from "../db";
import { applications, members, users } from "../db/schema";
import {
  startApplicationSchema,
  updateApplicationSchema,
  adminUpdateApplicationSchema,
  paginationSchema,
} from "../lib/validation";
import {
  generateId,
  generateResumeToken,
  generateBadgeNumber,
  generateReferralCode,
  calculateProratedDues,
  getFiscalYearEndDate,
  getCurrentFiscalYear,
} from "../lib/utils";
import {
  sendEmail,
  applicationReceivedEmail,
  applicationStatusUpdateEmail,
  applicationRejectedEmail,
  welcomeEmail,
  adminNotificationEmail,
} from "../lib/email";
import { logAudit } from "../lib/audit";
import { ValidationError, NotFoundError, ConflictError, InternalError } from "../lib/errors";

const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// PUBLIC ROUTES (No auth required)
// =============================================================================

/**
 * POST /api/applications
 * Start a new membership application
 *
 * This creates both a user account and an application record.
 * The prospect can resume their application via email link.
 */
app.post("/", async (c) => {
  const db = createDb(c.env.DB);

  const body = await c.req.json();
  const parsed = startApplicationSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const { email, firstName, lastName, phone, membershipType, howHeardAboutUs, utmSource, utmMedium, utmCampaign } = parsed.data;

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  let userId: string;

  if (existingUser) {
    // Check if they already have a pending application
    const existingApp = await db.query.applications.findFirst({
      where: and(
        eq(applications.userId, existingUser.id),
        sql`${applications.status} NOT IN ('approved', 'rejected', 'expired')`
      ),
    });

    if (existingApp) {
      throw new ConflictError("Application already exists", {
        applicationId: existingApp.id,
        status: existingApp.status,
        resumeToken: existingApp.resumeToken,
      });
    }

    // Check if they're already a member
    const existingMember = await db.query.members.findFirst({
      where: eq(members.userId, existingUser.id),
    });

    if (existingMember && ["active", "probationary"].includes(existingMember.status)) {
      throw new ConflictError("Already an active member");
    }

    userId = existingUser.id;
  } else {
    // Create new user
    userId = generateId();
    await db.insert(users).values({
      id: userId,
      email,
      name: `${firstName} ${lastName}`,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create application
  const applicationId = generateId();
  const resumeToken = generateResumeToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 180); // 180 days to complete

  const [application] = await db
    .insert(applications)
    .values({
      id: applicationId,
      userId,
      status: "draft",
      membershipType,
      howHeardAboutUs,
      utmSource,
      utmMedium,
      utmCampaign,
      resumeToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Send application received email
  const emailTemplate = applicationReceivedEmail(firstName);
  await sendEmail(c.env.RESEND_API_KEY || '', {
    to: email,
    ...emailTemplate,
  });

  // Notify admins of new application
  const publicUrl = c.env.PUBLIC_URL || 'https://austinrifleclub.org';
  const adminEmailAddr = c.env.ADMIN_EMAIL || 'membership@austinrifleclub.org';
  const adminEmail = adminNotificationEmail(
    'New Membership Application',
    `A new membership application has been submitted by ${firstName} ${lastName} (${email}).`,
    `${publicUrl}/admin/applications/${application.id}`,
    'Review Application'
  );
  await sendEmail(c.env.RESEND_API_KEY || '', {
    to: adminEmailAddr,
    ...adminEmail,
  });

  return c.json({
    id: application.id,
    status: application.status,
    resumeToken: application.resumeToken,
    resumeUrl: `${publicUrl}/apply/resume?token=${resumeToken}`,
    expiresAt: application.expiresAt,
  }, 201);
});

/**
 * GET /api/applications/resume/:token
 * Resume an application via email link token
 */
app.get("/resume/:token", async (c) => {
  const db = createDb(c.env.DB);
  const token = c.req.param("token");

  const application = await db.query.applications.findFirst({
    where: eq(applications.resumeToken, token),
  });

  if (!application) {
    throw new NotFoundError("Application");
  }

  // Check if expired
  if (application.expiresAt && new Date() > application.expiresAt) {
    throw new ValidationError("Application has expired");
  }

  // Check if already completed
  if (["approved", "rejected"].includes(application.status)) {
    throw new ValidationError(`Application already ${application.status}`);
  }

  return c.json(application);
});

// =============================================================================
// AUTHENTICATED APPLICANT ROUTES
// =============================================================================

/**
 * GET /api/applications/mine
 * Get current user's application (if any)
 */
app.get("/mine", requireAuth, async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, user.id),
      sql`${applications.status} NOT IN ('approved', 'rejected', 'expired')`
    ),
  });

  if (!application) {
    throw new NotFoundError("Application");
  }

  return c.json(application);
});

/**
 * PATCH /api/applications/mine
 * Update current user's application
 */
app.patch("/mine", requireAuth, async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, user.id),
      sql`${applications.status} NOT IN ('approved', 'rejected', 'expired', 'paid')`
    ),
  });

  if (!application) {
    throw new NotFoundError("Application");
  }

  const body = await c.req.json();
  const parsed = updateApplicationSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const [updated] = await db
    .update(applications)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, application.id))
    .returning();

  return c.json(updated);
});

/**
 * POST /api/applications/mine/submit
 * Submit application for review (after documents uploaded)
 */
app.post("/mine/submit", requireAuth, async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, user.id),
      eq(applications.status, "draft")
    ),
  });

  if (!application) {
    throw new NotFoundError("Draft application");
  }

  // Validate required fields are present
  if (!application.governmentIdUrl) {
    throw new ValidationError("Government ID required");
  }

  // LTC holders don't need background consent form
  if (!application.hasTexasLtc && !application.backgroundConsentUrl) {
    throw new ValidationError("Background consent form required (or provide Texas LTC)");
  }

  const [updated] = await db
    .update(applications)
    .set({
      status: "documents_pending",
      updatedAt: new Date(),
    })
    .where(eq(applications.id, application.id))
    .returning();

  // Notify admin of submission
  const publicUrl = c.env.PUBLIC_URL || 'https://austinrifleclub.org';
  const adminEmailAddr = c.env.ADMIN_EMAIL || 'membership@austinrifleclub.org';
  const adminEmail = adminNotificationEmail(
    'Application Documents Submitted',
    `Application documents have been submitted and are ready for review.`,
    `${publicUrl}/admin/applications/${application.id}`,
    'Review Documents'
  );
  await sendEmail(c.env.RESEND_API_KEY || '', {
    to: adminEmailAddr,
    ...adminEmail,
  });

  return c.json(updated);
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

/**
 * GET /api/applications
 * List all applications (admin only)
 */
app.get("/", requireAdmin, async (c) => {
  const db = c.get("db");

  const query = c.req.query();
  const { page, limit } = paginationSchema.parse(query);
  const offset = (page - 1) * limit;

  const status = query.status;

  let whereClause = undefined;
  if (status) {
    whereClause = eq(applications.status, status);
  }

  const [appList, countResult] = await Promise.all([
    db.query.applications.findMany({
      where: whereClause,
      orderBy: desc(applications.createdAt),
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(applications)
      .where(whereClause),
  ]);

  return c.json({
    applications: appList,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    },
  });
});

/**
 * GET /api/applications/:id
 * Get a specific application (admin only)
 */
app.get("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  if (!application) {
    throw new NotFoundError("Application", id);
  }

  // Get the user info
  const user = await db.query.users.findFirst({
    where: eq(users.id, application.userId),
  });

  return c.json({
    ...application,
    user,
  });
});

/**
 * PATCH /api/applications/:id
 * Update application status (admin only)
 */
app.patch("/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const body = await c.req.json();
  const parsed = adminUpdateApplicationSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", parsed.error.issues);
  }

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  if (!application) {
    throw new NotFoundError("Application", id);
  }

  const [updated] = await db
    .update(applications)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id))
    .returning();

  // Log to audit log
  await logAudit(db, {
    action: 'application.update',
    targetType: 'application',
    targetId: id,
    actorId: admin.id,
    details: parsed.data,
  });

  // Send status update email to applicant
  const user = await db.query.users.findFirst({
    where: eq(users.id, application.userId),
  });

  if (user && parsed.data.status) {
    const firstName = user.name.split(' ')[0] || 'Applicant';
    const emailTemplate = applicationStatusUpdateEmail(firstName, parsed.data.status);
    await sendEmail(c.env.RESEND_API_KEY || '', {
      to: user.email,
      ...emailTemplate,
    });
  }

  return c.json(updated);
});

/**
 * POST /api/applications/:id/approve
 * Approve application and create member record (admin only)
 *
 * This is the final step after BOD vote passes.
 * Creates the member record and assigns badge number.
 */
app.post("/:id/approve", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  if (!application) {
    throw new NotFoundError("Application", id);
  }

  if (application.status !== "pending_vote") {
    throw new ValidationError(`Application must be in pending_vote status (current: ${application.status})`);
  }

  // Verify BOD vote passed (3/4 majority)
  const totalVotes = (application.votesFor ?? 0) + (application.votesAgainst ?? 0);
  const requiredVotes = Math.ceil(totalVotes * 0.75);

  if ((application.votesFor ?? 0) < requiredVotes) {
    throw new ValidationError("BOD vote did not pass (3/4 majority required)", {
      votesFor: application.votesFor,
      votesAgainst: application.votesAgainst,
      required: requiredVotes,
    });
  }

  // Get the last badge number to generate next one
  const lastMember = await db.query.members.findFirst({
    orderBy: desc(members.badgeNumber),
  });

  const badgeNumber = generateBadgeNumber(lastMember?.badgeNumber ?? null);
  const referralCode = generateReferralCode();

  // Calculate dates
  const now = new Date();
  const probationEndsAt = new Date(now);
  probationEndsAt.setMonth(probationEndsAt.getMonth() + 6);

  const fiscalYear = getCurrentFiscalYear();
  const expirationDate = getFiscalYearEndDate(fiscalYear);

  // Get user info to populate member record
  const user = await db.query.users.findFirst({
    where: eq(users.id, application.userId),
  });

  if (!user) {
    throw new InternalError("User not found for application");
  }

  // Create member record
  const memberId = generateId();
  const [member] = await db
    .insert(members)
    .values({
      id: memberId,
      userId: application.userId,
      badgeNumber,
      membershipType: application.membershipType,
      status: "probationary",
      familyRole: "primary",
      joinDate: now,
      expirationDate,
      probationEndsAt,
      firstName: user.name.split(" ")[0] || "",
      lastName: user.name.split(" ").slice(1).join(" ") || "",
      phone: "", // Would come from application in full implementation
      addressLine1: "", // Would come from application
      city: "",
      state: "TX",
      zip: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      referralCode,
      hasTexasLtc: application.hasTexasLtc ?? false,
      ltcNumber: application.ltcNumber,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Update application as approved
  await db
    .update(applications)
    .set({
      status: "approved",
      approvedAt: now,
      approvedBy: admin.id,
      updatedAt: now,
    })
    .where(eq(applications.id, id));

  // Log to audit log
  await logAudit(db, {
    action: 'application.approve',
    targetType: 'application',
    targetId: id,
    actorId: admin.id,
    details: { status: 'approved', memberId: memberId, badgeNumber },
  });

  // Send welcome email with badge number
  const firstName = user.name.split(' ')[0] || 'Member';
  const emailTemplate = welcomeEmail(firstName);
  await sendEmail(c.env.RESEND_API_KEY || '', {
    to: user.email,
    ...emailTemplate,
  });

  return c.json({
    member,
    application: { id, status: "approved" },
    message: `Member approved with badge number ${badgeNumber}`,
  });
});

/**
 * POST /api/applications/:id/reject
 * Reject application (admin only)
 */
app.post("/:id/reject", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const body = await c.req.json();
  const reason = body.reason as string;

  if (!reason || reason.length < 10) {
    throw new ValidationError("Rejection reason required (min 10 characters)");
  }

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  if (!application) {
    throw new NotFoundError("Application", id);
  }

  if (["approved", "rejected"].includes(application.status)) {
    throw new ValidationError("Application already finalized");
  }

  const [updated] = await db
    .update(applications)
    .set({
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: admin.id,
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id))
    .returning();

  // Log to audit log
  await logAudit(db, {
    action: 'application.reject',
    targetType: 'application',
    targetId: id,
    actorId: admin.id,
    details: { status: 'rejected', reason },
  });

  // Get user info and send rejection email
  const user = await db.query.users.findFirst({
    where: eq(users.id, application.userId),
  });

  if (user) {
    const firstName = user.name.split(' ')[0] || 'Applicant';
    const emailTemplate = applicationRejectedEmail(firstName, reason);
    await sendEmail(c.env.RESEND_API_KEY || '', {
      to: user.email,
      ...emailTemplate,
    });
  }

  // Process refund if payment was made (via Stripe)
  if (application.stripePaymentIntentId && c.env.STRIPE_SECRET_KEY) {
    try {
      const { StripeService } = await import('../lib/stripe');
      const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

      const refundResult = await stripe.createRefund(application.stripePaymentIntentId, {
        reason: 'requested_by_customer',
        metadata: {
          applicationId: id,
          reason: reason,
        },
      });

      if (refundResult.success) {
        log.info('Application refund processed', { applicationId: id, refundId: refundResult.refundId });
      } else {
        log.error('Application refund failed', new Error(refundResult.error || 'Unknown error'), { applicationId: id });
      }
    } catch (error) {
      log.error('Application refund error', error instanceof Error ? error : new Error(String(error)), { applicationId: id });
    }
  }

  return c.json(updated);
});

export default app;
