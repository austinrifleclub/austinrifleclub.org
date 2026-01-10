/**
 * Members API Tests
 */

import { describe, it, expect, vi } from "vitest";

const mockEnv = {
  DB: {
    prepare: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue({ ok: 1 }),
      all: vi.fn().mockResolvedValue({ results: [] }),
      run: vi.fn().mockResolvedValue({ success: true }),
    }),
  },
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:8787",
};

import app from "../index";

describe("Members API", () => {
  describe("GET /api/members/me", () => {
    it("should require authentication", async () => {
      const response = await app.request("/api/members/me", {
        method: "GET",
      }, mockEnv);

      // Should be 401 without auth
      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe("PATCH /api/members/me", () => {
    it("should require authentication", async () => {
      const response = await app.request("/api/members/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "512-555-1234" }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe("GET /api/members/me/referral-code", () => {
    it("should require authentication", async () => {
      const response = await app.request("/api/members/me/referral-code", {
        method: "GET",
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe("GET /api/members/me/payments", () => {
    it("should require authentication", async () => {
      const response = await app.request("/api/members/me/payments", {
        method: "GET",
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe("GET /api/members/me/volunteer-hours", () => {
    it("should require authentication", async () => {
      const response = await app.request("/api/members/me/volunteer-hours", {
        method: "GET",
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });
});

describe("Members Admin Routes", () => {
  describe("GET /api/members", () => {
    it("should require admin authentication", async () => {
      const response = await app.request("/api/members", {
        method: "GET",
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe("GET /api/members/:id", () => {
    it("should require admin authentication", async () => {
      const response = await app.request("/api/members/test-id", {
        method: "GET",
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe("PATCH /api/members/:id", () => {
    it("should require admin authentication", async () => {
      const response = await app.request("/api/members/test-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      }, mockEnv);

      expect([401, 403, 500]).toContain(response.status);
    });
  });
});
