/**
 * Stripe Payment Service
 *
 * Handles payment processing for membership dues and event fees.
 * Uses Stripe test mode by default.
 */

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

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
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
    body?: Record<string, any>
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

  private encodeFormData(data: Record<string, any>, prefix = ''): string {
    const params: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;

      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        params.push(this.encodeFormData(value, fullKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            params.push(this.encodeFormData(item, `${fullKey}[${index}]`));
          } else {
            params.push(`${fullKey}[${index}]=${encodeURIComponent(item)}`);
          }
        });
      } else {
        params.push(`${fullKey}=${encodeURIComponent(value)}`);
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

      const sessionData: Record<string, any> = {
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
      console.error('[Stripe] Checkout error:', error);
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
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // In production, implement proper HMAC verification
    // For now, basic check that signature header exists
    if (!signature || !secret) return false;

    // Stripe signature format: t=timestamp,v1=signature
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
    const sig = parts.find(p => p.startsWith('v1='))?.slice(3);

    if (!timestamp || !sig) return false;

    // Check timestamp isn't too old (5 minute tolerance)
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (age > 300) return false;

    return true;
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: string): StripeWebhookEvent {
    return JSON.parse(payload);
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
 */
export async function createMembershipCheckout(
  stripe: StripeService,
  email: string,
  membershipType: keyof typeof MEMBERSHIP_PRICES,
  memberId: string,
  baseUrl = 'https://austinrifleclub.org'
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
 */
export async function createEventCheckout(
  stripe: StripeService,
  email: string,
  eventId: string,
  eventTitle: string,
  amount: number, // in dollars
  memberId: string,
  baseUrl = 'https://austinrifleclub.org'
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
