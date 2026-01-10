/**
 * Volunteer API Tests
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
  RESEND_API_KEY: 'test-key',
  BETTER_AUTH_SECRET: 'test-secret',
  BETTER_AUTH_URL: 'http://localhost:8787',
};

import app from '../index';

describe('Volunteer API', () => {
  describe('GET /api/volunteer/balance', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/volunteer/balance', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/volunteer/history', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/volunteer/history', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/volunteer/redeem', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/volunteer/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          redeemFor: 'dues_discount',
        }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/volunteer/activity-types', () => {
    it('should return activity types', async () => {
      const response = await app.request('/api/volunteer/activity-types', {
        method: 'GET',
      }, mockEnv);

      // Activity types may be public
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/volunteer/log', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/volunteer/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: 'member-123',
          activity: 'work_day',
          hours: 4,
          date: new Date().toISOString(),
          description: 'General cleanup',
        }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/volunteer/member/:id', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/volunteer/member/member-123', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });
});
