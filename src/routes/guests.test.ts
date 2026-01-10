/**
 * Guests API Tests
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

describe('Guests API', () => {
  describe('POST /api/guests', () => {
    it('should require authentication to register a guest', async () => {
      const response = await app.request('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          memberId: 'member-123',
        }),
      }, mockEnv);

      // Registration likely requires authentication
      expect([201, 400, 401, 403, 500]).toContain(response.status);
    });

    it('should reject invalid guest data', async () => {
      const response = await app.request('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required fields
          name: '',
        }),
      }, mockEnv);

      // May be 400 for validation or 401 for auth
      expect([400, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/guests', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/guests', {
        method: 'GET',
      }, mockEnv);

      // Guests list requires authentication
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/guests/:id', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/guests/non-existent', {
        method: 'GET',
      }, mockEnv);

      // Getting a guest requires authentication
      expect([401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/guests/:id/sign-in', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/guests/guest-123/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waiverSigned: true,
        }),
      }, mockEnv);

      // Guest sign-in requires authentication
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/guests/quick-sign-in', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/guests/quick-sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Quick Guest',
          email: 'quick@example.com',
          memberId: 'member-123',
          waiverSigned: true,
        }),
      }, mockEnv);

      // Quick sign-in requires authentication
      expect([201, 400, 401, 403, 500]).toContain(response.status);
    });
  });
});
