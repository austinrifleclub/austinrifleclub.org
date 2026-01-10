/**
 * Health Check API Tests
 *
 * Tests for the health check endpoints.
 */

import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:8787';

describe('Health API', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_BASE}/health`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/ready', () => {
    it('should return database status', async () => {
      const response = await fetch(`${API_BASE}/health/ready`);

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty('status', 'ready');
      expect(data).toHaveProperty('database', 'connected');
      expect(data).toHaveProperty('timestamp');
    });
  });
});
