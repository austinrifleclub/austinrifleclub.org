/**
 * Stripe Payment Service
 *
 * Handles payment processing for membership dues and event fees.
 * Uses Stripe test mode by default.
 */

import { log } from './logger';

interface CreateCheckoutOptions {
  customerId?: string;
  customerEmail: string;
  lineItems: Array<{
    name: string;
    description?: string;
    amount: number; // in cents
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  mode?: 'payment' | 'subscription';
}

interface CreateCheckoutResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  customer: string;
  metadata: Record<string, string>;
}

interface StripeWebhookEventObject {
  id: string;
  amount_total?: number;
  payment_intent?: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeWebhookEventObject;
  };
}

interface StripeRefund {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  payment_intent: string;
}

interface StripePaymentIntent {
  id: string;
  amount: number;
  amount_received: number;
  status: string;
  metadata: Record<string, string>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: string;
  error?: string;
}

export class StripeService {
  private apiKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    let requestBody: string | undefined;
    if (body) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      requestBody = this.encodeFormData(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: requestBody,
    });

    const data: { error?: { message?: string } } & T = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe API error');
    }

    return data;
  }

  private encodeFormData(data: Record<string, unknown>, prefix = ''): string {
    const params: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;

      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        params.push(this.encodeFormData(value as Record<string, unknown>, fullKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            params.push(this.encodeFormData(item as Record<string, unknown>, `${fullKey}[${index}]`));
          } else {
            params.push(`${fullKey}[${index}]=${encodeURIComponent(String(item))}`);
          }
        });
      } else {
        params.push(`${fullKey}=${encodeURIComponent(String(value))}`);
      }
    }

    return params.filter(Boolean).join('&');
  }

  /**
   * Create a Stripe Checkout session
   */
  async createCheckoutSession(options: CreateCheckoutOptions): Promise<CreateCheckoutResult> {
    try {
      const lineItems = options.lineItems.map((item, index) => ({
        [`line_items[${index}][price_data][currency]`]: 'usd',
        [`line_items[${index}][price_data][product_data][name]`]: item.name,
        [`line_items[${index}][price_data][product_data][description]`]: item.description || '',
        [`line_items[${index}][price_data][unit_amount]`]: item.amount,
        [`line_items[${index}][quantity]`]: item.quantity,
      }));

      const flatLineItems = lineItems.reduce((acc, item) => ({ ...acc, ...item }), {});

      const sessionData: Record<string, string | number> = {
        mode: options.mode || 'payment',
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        customer_email: options.customerEmail,
        ...flatLineItems,
      };

      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          sessionData[`metadata[${key}]`] = value;
        });
      }

      const session = await this.request<StripeCheckoutSession>(
        '/checkout/sessions',
        'POST',
        sessionData
      );

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      log.error('Stripe checkout error', error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  /**
   * Retrieve a checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
    return this.request<StripeCheckoutSession>(`/checkout/sessions/${sessionId}`);
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   * @param payload - Raw request body
   * @param signature - Stripe-Signature header value
   * @param secret - Webhook signing secret
   * @returns Promise resolving to true if signature is valid
   */
  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (!signature || !secret) return false;

    // Stripe signature format: t=timestamp,v1=signature
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
    const sig = parts.find(p => p.startsWith('v1='))?.slice(3);

    if (!timestamp || !sig) return false;

    // Check timestamp isn't too old (5 minute tolerance)
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (age > 300) return false;

    // Compute expected signature using HMAC-SHA256
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex string
    const expectedSig = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Timing-safe comparison
    if (expectedSig.length !== sig.length) return false;

    let mismatch = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      mismatch |= expectedSig.charCodeAt(i) ^ sig.charCodeAt(i);
    }

    return mismatch === 0;
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: string): StripeWebhookEvent {
    return JSON.parse(payload);
  }

  /**
   * Create a refund for a payment intent
   */
  async createRefund(
    paymentIntentId: string,
    options?: {
      amount?: number; // Amount to refund in cents (omit for full refund)
      reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
      metadata?: Record<string, string>;
    }
  ): Promise<RefundResult> {
    try {
      const refundData: Record<string, string | number> = {
        payment_intent: paymentIntentId,
      };

      if (options?.amount) {
        refundData.amount = options.amount;
      }

      if (options?.reason) {
        refundData.reason = options.reason;
      }

      if (options?.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          refundData[`metadata[${key}]`] = value;
        });
      }

      const refund = await this.request<StripeRefund>('/refunds', 'POST', refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      };
    } catch (error) {
      log.error('Stripe refund error', error instanceof Error ? error : new Error(String(error)), { paymentIntentId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }

  /**
   * Get a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    return this.request<StripePaymentIntent>(`/payment_intents/${paymentIntentId}`);
  }
}

// Membership price IDs (would be created in Stripe dashboard)
export const MEMBERSHIP_PRICES = {
  individual: {
    amount: 15000, // $150.00
    name: 'Individual Membership',
    description: 'Annual individual membership dues',
  },
  family: {
    amount: 20000, // $200.00
    name: 'Family Membership',
    description: 'Annual family membership dues',
  },
  life: {
    amount: 150000, // $1,500.00
    name: 'Life Membership',
    description: 'One-time life membership dues',
  },
};

/**
 * Create a payment checkout for membership
 * @param baseUrl - The public URL for redirects (from env.PUBLIC_URL)
 */
export async function createMembershipCheckout(
  stripe: StripeService,
  email: string,
  membershipType: keyof typeof MEMBERSHIP_PRICES,
  memberId: string,
  baseUrl: string
): Promise<CreateCheckoutResult> {
  const price = MEMBERSHIP_PRICES[membershipType];

  return stripe.createCheckoutSession({
    customerEmail: email,
    lineItems: [
      {
        name: price.name,
        description: price.description,
        amount: price.amount,
        quantity: 1,
      },
    ],
    successUrl: `${baseUrl}/dashboard?payment=success`,
    cancelUrl: `${baseUrl}/membership?payment=cancelled`,
    metadata: {
      type: 'membership',
      membershipType,
      memberId,
    },
  });
}

/**
 * Create a payment checkout for event registration
 * @param baseUrl - The public URL for redirects (from env.PUBLIC_URL)
 */
export async function createEventCheckout(
  stripe: StripeService,
  email: string,
  eventId: string,
  eventTitle: string,
  amount: number, // in dollars
  memberId: string,
  baseUrl: string
): Promise<CreateCheckoutResult> {
  return stripe.createCheckoutSession({
    customerEmail: email,
    lineItems: [
      {
        name: `Event Registration: ${eventTitle}`,
        description: 'Event registration fee',
        amount: amount * 100, // convert to cents
        quantity: 1,
      },
    ],
    successUrl: `${baseUrl}/events/${eventId}?payment=success`,
    cancelUrl: `${baseUrl}/events/${eventId}?payment=cancelled`,
    metadata: {
      type: 'event',
      eventId,
      memberId,
    },
  });
}
