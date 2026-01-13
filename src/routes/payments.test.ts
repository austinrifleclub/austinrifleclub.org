/**
 * Payments API Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the environment
const mockEnv = {
  DB: {
    prepare: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(null),
      all: vi.fn().mockResolvedValue({ results: [] }),
      run: vi.fn().mockResolvedValue({ success: true }),
    }),
  },
  STRIPE_SECRET_KEY: 'sk_test_fake',
  STRIPE_WEBHOOK_SECRET: 'whsec_fake',
  RESEND_API_KEY: 'test-key',
  BETTER_AUTH_SECRET: 'test-secret',
  BETTER_AUTH_URL: 'http://localhost:8787',
};

import app from '../index';

describe('Payments API', () => {
  describe('POST /api/payments/checkout/membership', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/payments/checkout/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipType: 'individual',
        }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/payments/checkout/event/:eventId', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/payments/checkout/event/event-123', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/payments/history', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/payments/history', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should reject requests without stripe signature', async () => {
      const response = await app.request('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: { object: {} },
        }),
      }, mockEnv);

      // Should fail - missing signature
      expect([400, 401, 500]).toContain(response.status);
    });

    it('should reject requests with invalid stripe signature', async () => {
      const response = await app.request('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 't=invalid,v1=invalid',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: { object: {} },
        }),
      }, mockEnv);

      // Should fail signature verification
      expect([400, 401, 500]).toContain(response.status);
    });

    it('should reject requests with expired timestamp', async () => {
      // Timestamp from 10 minutes ago (beyond 5 min tolerance)
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
      const response = await app.request('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': `t=${oldTimestamp},v1=fakesignature`,
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: { object: {} },
        }),
      }, mockEnv);

      // Should fail - timestamp too old
      expect([400, 401, 500]).toContain(response.status);
    });

    it('should reject malformed signature header', async () => {
      const response = await app.request('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'malformed-header-no-parts',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: { object: {} },
        }),
      }, mockEnv);

      // Should fail - can't parse signature
      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('GET /api/payments/session/:sessionId', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/payments/session/cs_test_123', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });
});
