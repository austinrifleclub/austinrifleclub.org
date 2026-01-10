/**
 * Range Status API Tests
 *
 * Tests for the range status endpoints.
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:8787';

describe('Range Status API', () => {
  describe('GET /api/range-status', () => {
    it('should return all ranges', async () => {
      const response = await fetch(`${API_BASE}/api/range-status`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json() as { ranges: unknown[]; lastUpdated: string };

      expect(data).toHaveProperty('ranges');
      expect(Array.isArray(data.ranges)).toBe(true);
      expect(data).toHaveProperty('lastUpdated');
    });

    it('should return range data with correct structure', async () => {
      const response = await fetch(`${API_BASE}/api/range-status`);
      const data = await response.json() as { ranges: Array<{ id: string; name: string; status: string }> };

      if (data.ranges.length > 0) {
        const range = data.ranges[0];
        expect(range).toHaveProperty('id');
        expect(range).toHaveProperty('name');
        expect(range).toHaveProperty('status');
        expect(['open', 'closed', 'event', 'maintenance']).toContain(range.status);
      }
    });
  });

  describe('GET /api/range-status/:id', () => {
    it('should return a specific range', async () => {
      const response = await fetch(`${API_BASE}/api/range-status/A`);

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty('id', 'A');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('status');
    });

    it('should return 404 for non-existent range', async () => {
      const response = await fetch(`${API_BASE}/api/range-status/NONEXISTENT`);

      expect(response.status).toBe(404);
    });
  });
});
