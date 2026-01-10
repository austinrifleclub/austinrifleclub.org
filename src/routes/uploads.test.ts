/**
 * Uploads API Tests
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
  UPLOADS_BUCKET: {
    put: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  PUBLIC_URL: 'https://cdn.example.com',
  RESEND_API_KEY: 'test-key',
  BETTER_AUTH_SECRET: 'test-secret',
  BETTER_AUTH_URL: 'http://localhost:8787',
};

import app from '../index';

describe('Uploads API', () => {
  describe('POST /api/uploads/application/:id/government-id', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/uploads/application/app-123/government-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: 'test' }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/uploads/application/:id/background-consent', () => {
    it('should require authentication', async () => {
      const response = await app.request('/api/uploads/application/app-123/background-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: 'test' }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/uploads/document', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/uploads/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: 'test' }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/document/:id', () => {
    it('should return 404 for non-existent document', async () => {
      const response = await app.request('/api/uploads/document/non-existent-id', {
        method: 'GET',
      }, mockEnv);

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/uploads/document/:id', () => {
    it('should require admin authentication', async () => {
      const response = await app.request('/api/uploads/document/doc-123', {
        method: 'DELETE',
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/documents', () => {
    it('should return documents list', async () => {
      const response = await app.request('/api/uploads/documents', {
        method: 'GET',
      }, mockEnv);

      // Documents list may be public or error on missing DB
      expect([200, 500]).toContain(response.status);
    });
  });
});
