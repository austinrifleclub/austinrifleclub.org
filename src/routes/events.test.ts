/**
 * Events API Tests
 *
 * Tests for the events endpoints.
 */

import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:8787';

describe('Events API', () => {
  describe('GET /api/events', () => {
    it('should return events list', async () => {
      const response = await fetch(`${API_BASE}/api/events`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json() as { events: unknown[]; pagination: unknown };

      expect(data).toHaveProperty('events');
      expect(Array.isArray(data.events)).toBe(true);
      expect(data).toHaveProperty('pagination');
    });

    it('should filter events by type', async () => {
      const response = await fetch(`${API_BASE}/api/events?type=match`);

      expect(response.ok).toBe(true);
      const data = await response.json() as { events: Array<{ eventType: string }> };

      data.events.forEach((event) => {
        expect(event.eventType).toBe('match');
      });
    });

    it('should filter events by date range', async () => {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(`${API_BASE}/api/events?start=${start}&end=${end}`);

      expect(response.ok).toBe(true);
      const data = await response.json() as { events: Array<{ startTime: string }> };

      data.events.forEach((event) => {
        const eventDate = new Date(event.startTime);
        expect(eventDate >= new Date(start)).toBe(true);
        expect(eventDate <= new Date(end)).toBe(true);
      });
    });

    it('should return event with registration count', async () => {
      const response = await fetch(`${API_BASE}/api/events`);
      const data = await response.json() as { events: Array<{ registrationCount?: number }> };

      if (data.events.length > 0) {
        const event = data.events[0];
        expect(event).toHaveProperty('registrationCount');
        expect(typeof event.registrationCount).toBe('number');
      }
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const response = await fetch(`${API_BASE}/api/events/nonexistent-id`);

      expect(response.status).toBe(404);
    });
  });
});
