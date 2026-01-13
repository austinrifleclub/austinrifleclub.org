/**
 * Payments API Routes
 *
 * Handles Stripe checkout and webhooks for membership and event payments.
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { Env } from "../lib/auth";
import { log } from "../lib/logger";
import { requireMember, MemberContext } from "../middleware/auth";
import { createDb } from "../db";
import { members, eventRegistrations, duesPayments, events } from "../db/schema";
import {
  StripeService,
  createMembershipCheckout,
  createEventCheckout,
  MEMBERSHIP_PRICES,
} from "../lib/stripe";
import { generateId } from "../lib/utils";
import {
  sendEmail,
  applicationStatusUpdateEmail,
  eventRegistrationEmail,
} from "../lib/email";
import { logAudit } from "../lib/audit";
import { users } from "../db/schema";
import { ValidationError, NotFoundError, InternalError } from "../lib/errors";
import { getPublicUrl } from "../lib/config";

const app = new Hono<{ Bindings: Env & { STRIPE_SECRET_KEY: string; STRIPE_WEBHOOK_SECRET: string } }>();

/**
 * POST /api/payments/checkout/membership
 * Create checkout session for membership dues
 */
app.post("/checkout/membership", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const body = await c.req.json();
  const { membershipType } = body as { membershipType: keyof typeof MEMBERSHIP_PRICES };

  if (!membershipType || !MEMBERSHIP_PRICES[membershipType]) {
    throw new ValidationError("Invalid membership type");
  }

  // Get user email
  const user = await db.query.users.findFirst({
    where: eq(users.id, member.userId),
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
  const baseUrl = getPublicUrl(c.env);
  const result = await createMembershipCheckout(
    stripe,
    user.email,
    membershipType,
    member.id,
    baseUrl
  );

  if (!result.success) {
    throw new InternalError(result.error || "Payment checkout failed");
  }

  return c.json({
    sessionId: result.sessionId,
    url: result.url,
  });
});

/**
 * POST /api/payments/checkout/event/:eventId
 * Create checkout session for event registration
 */
app.post("/checkout/event/:eventId", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");
  const eventId = c.req.param("eventId");

  // Get event details
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    throw new NotFoundError("Event", eventId);
  }

  if (!event.cost || event.cost === 0) {
    throw new ValidationError("This event is free");
  }

  // Get user email
  const user = await db.query.users.findFirst({
    where: eq(users.id, member.userId),
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
  const baseUrl = getPublicUrl(c.env);
  const result = await createEventCheckout(
    stripe,
    user.email,
    eventId,
    event.title,
    event.cost,
    member.id,
    baseUrl
  );

  if (!result.success) {
    throw new InternalError(result.error || "Payment checkout failed");
  }

  return c.json({
    sessionId: result.sessionId,
    url: result.url,
  });
});

/**
 * GET /api/payments/session/:sessionId
 * Get checkout session status
 */
app.get("/session/:sessionId", requireMember, async (c) => {
  const sessionId = c.req.param("sessionId");
  const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.getCheckoutSession(sessionId);
    return c.json({
      status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error) {
    log.error('Stripe getCheckoutSession failed', error instanceof Error ? error : new Error(String(error)), { sessionId });
    throw new NotFoundError("Checkout session", sessionId);
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
app.post("/webhook", async (c) => {
  // Validate Stripe configuration before processing
  if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_WEBHOOK_SECRET) {
    log.error('Stripe webhook called without configuration', new Error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET'));
    throw new InternalError("Stripe configuration incomplete");
  }

  const signature = c.req.header("stripe-signature");
  const body = await c.req.text();

  if (!signature) {
    throw new ValidationError("Missing Stripe signature");
  }

  const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

  // Verify webhook signature (async HMAC-SHA256)
  const isValid = await stripe.verifyWebhookSignature(body, signature, c.env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    throw new ValidationError("Invalid webhook signature");
  }

  const event = stripe.parseWebhookEvent(body);
  const db = createDb(c.env.DB);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const metadata = session.metadata || {};

      // Validate payment type and required metadata fields
      const paymentType = metadata.type as string | undefined;
      if (paymentType === "membership") {
        if (!metadata.memberId || !metadata.membershipType) {
          log.error('Invalid membership webhook metadata', new Error('Missing required fields'), { metadata });
          throw new ValidationError("Invalid payment metadata: missing memberId or membershipType");
        }
      } else if (paymentType === "event") {
        if (!metadata.memberId || !metadata.eventId) {
          log.error('Invalid event webhook metadata', new Error('Missing required fields'), { metadata });
          throw new ValidationError("Invalid payment metadata: missing memberId or eventId");
        }
      } else {
        log.error('Unknown payment type in webhook', new Error(`Unknown type: ${paymentType}`), { metadata });
        throw new ValidationError(`Unknown payment type: ${paymentType}`);
      }

      // Record payment for membership dues
      if (metadata.type === "membership") {
        const paymentId = generateId();
        await db.insert(duesPayments).values({
          id: paymentId,
          memberId: metadata.memberId,
          amount: session.amount_total ?? 0, // Already in cents
          paymentType: metadata.membershipType === 'life' ? 'life' : 'annual',
          paymentMethod: "stripe",
          stripePaymentId: session.payment_intent ? String(session.payment_intent) : null,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: "completed",
          createdAt: new Date(),
        });
      }

      // Handle based on payment type
      if (metadata.type === "membership") {
        // Update member's expiration date
        const expirationDate = new Date();
        if (metadata.membershipType === "life") {
          expirationDate.setFullYear(expirationDate.getFullYear() + 100); // "Never" expires
        } else {
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        }

        await db
          .update(members)
          .set({
            status: "active",
            membershipType: metadata.membershipType,
            expirationDate,
          })
          .where(eq(members.id, metadata.memberId));

        // Get member and send confirmation email
        const paidMember = await db.query.members.findFirst({
          where: eq(members.id, metadata.memberId),
        });

        if (paidMember) {
          const memberUser = await db.query.users.findFirst({
            where: eq(users.id, paidMember.userId),
          });

          if (memberUser) {
            const emailTemplate = applicationStatusUpdateEmail(
              paidMember.firstName,
              'paid',
              `Your membership has been renewed until ${expirationDate.toLocaleDateString()}.`
            );
            await sendEmail(c.env.RESEND_API_KEY || '', {
              to: memberUser.email,
              ...emailTemplate,
            });
          }
        }

        // Log to audit
        await logAudit(db, {
          action: 'payment.membership',
          targetType: 'member',
          targetId: metadata.memberId,
          actorId: metadata.memberId,
          actorType: 'member',
          details: {
            amount: session.amount_total,
            membershipType: metadata.membershipType,
          },
        });

        log.info('Membership payment completed', { memberId: metadata.memberId, membershipType: metadata.membershipType });
      } else if (metadata.type === "event") {
        // Update event registration as paid
        await db
          .update(eventRegistrations)
          .set({
            stripePaymentId: session.payment_intent ? String(session.payment_intent) : null,
            amountPaid: session.amount_total,
          })
          .where(
            and(
              eq(eventRegistrations.eventId, metadata.eventId),
              eq(eventRegistrations.memberId, metadata.memberId)
            )
          );

        // Get event and member info for confirmation email
        const eventInfo = await db.query.events.findFirst({
          where: eq(events.id, metadata.eventId),
        });

        const eventMember = await db.query.members.findFirst({
          where: eq(members.id, metadata.memberId),
        });

        if (eventInfo && eventMember) {
          const eventUser = await db.query.users.findFirst({
            where: eq(users.id, eventMember.userId),
          });

          if (eventUser) {
            const startDate = new Date(eventInfo.startTime);
            const emailTemplate = eventRegistrationEmail(
              eventMember.firstName,
              eventInfo.title,
              startDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
              eventInfo.location || 'Austin Rifle Club',
              false
            );
            await sendEmail(c.env.RESEND_API_KEY || '', {
              to: eventUser.email,
              ...emailTemplate,
            });
          }
        }

        // Log to audit
        await logAudit(db, {
          action: 'payment.event',
          targetType: 'event_registration',
          targetId: metadata.eventId,
          actorId: metadata.memberId,
          actorType: 'member',
          details: {
            amount: session.amount_total,
            eventId: metadata.eventId,
          },
        });

        log.info('Event payment completed', { eventId: metadata.eventId, memberId: metadata.memberId });
      }
      break;
    }

    case "checkout.session.expired": {
      log.info('Checkout session expired', { sessionId: event.data.object.id });
      break;
    }

    case "payment_intent.payment_failed": {
      log.warn('Payment failed', { paymentIntentId: event.data.object.id });
      break;
    }
  }

  return c.json({ received: true });
});

/**
 * GET /api/payments/history
 * Get member's payment history
 */
app.get("/history", requireMember, async (c) => {
  const db = c.get("db");
  const member = c.get("member");

  const paymentHistory = await db.query.duesPayments.findMany({
    where: eq(duesPayments.memberId, member.id),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    limit: 50,
  });

  return c.json(paymentHistory);
});

export default app;
