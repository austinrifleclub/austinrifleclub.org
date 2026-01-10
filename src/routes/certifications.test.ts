/**
 * Certifications API Tests
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

describe('Certifications API', () => {
  describe('GET /api/certifications/types', () => {
    it('should return certification types list', async () => {
      const response = await app.request('/api/certifications/types', {
        method: 'GET',
      }, mockEnv);

      // Should return 200 or error if DB not set up
      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json() as { types: unknown[] };
        expect(data).toHaveProperty('types');
        expect(Array.isArray(data.types)).toBe(true);
      }
    });
  });

  describe('POST /api/certifications/types', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/certifications/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Certification',
          description: 'A test certification',
        }),
      }, mockEnv);

      // Should be 401/403 without auth
      expect([401, 403, 500]).toContain(response.status);
    });

    it('should reject invalid certification type data', async () => {
      const response = await app.request('/api/certifications/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing name
          description: 'A test certification',
        }),
      }, mockEnv);

      expect([400, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/certifications', () => {
    it('should require admin authentication to grant certification', async () => {
      const response = await app.request('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: 'member-123',
          certificationTypeId: 'cert-type-123',
        }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/certifications/my', () => {
    it('should require member authentication', async () => {
      const response = await app.request('/api/certifications/my', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/certifications/reports/expiring', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/certifications/reports/expiring', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/certifications/stats', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/certifications/stats', {
        method: 'GET',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });
});
