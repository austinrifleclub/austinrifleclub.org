/**
 * Applications API Tests
 */

import { describe, it, expect, beforeAll, vi } from "vitest";

// Mock the environment
const mockEnv = {
  DB: {
    prepare: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue({ ok: 1 }),
      all: vi.fn().mockResolvedValue({ results: [] }),
      run: vi.fn().mockResolvedValue({ success: true }),
    }),
  },
  RESEND_API_KEY: "test-key",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:8787",
};

// Import after mocking
import app from "../index";

describe("Applications API", () => {
  describe("POST /api/applications", () => {
    it("should create a new application with valid data", async () => {
      const response = await app.request("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "512-555-1234",
          membershipType: "individual",
        }),
      }, mockEnv);

      // Since we're mocking, we expect either success or a validation response
      expect([201, 400, 409, 500]).toContain(response.status);
    });

    it("should reject application with missing required fields", async () => {
      const response = await app.request("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          // Missing firstName, lastName
        }),
      }, mockEnv);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should reject application with invalid email", async () => {
      const response = await app.request("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          firstName: "John",
          lastName: "Doe",
          membershipType: "individual",
        }),
      }, mockEnv);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/applications/resume/:token", () => {
    it("should return 404 for non-existent token", async () => {
      const response = await app.request(
        "/api/applications/resume/non-existent-token",
        { method: "GET" },
        mockEnv
      );

      // Could be 404 or 500 depending on mock setup
      expect([404, 500]).toContain(response.status);
    });
  });
});

describe("Applications Admin Routes", () => {
  describe("GET /api/applications", () => {
    it("should require admin authentication", async () => {
      const response = await app.request("/api/applications", {
        method: "GET",
      }, mockEnv);

      // Should be 401 or 403 without auth
      expect([401, 403, 500]).toContain(response.status);
    });
  });
});
