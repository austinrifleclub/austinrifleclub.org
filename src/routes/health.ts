import { Hono } from "hono";
import { Env } from "../lib/auth";

const health = new Hono<{ Bindings: Env }>();

// Basic health check endpoint
health.get("/", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Readiness check - verifies all services
health.get("/ready", async (c) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // Check D1 Database
  try {
    const result = await c.env.DB.prepare("SELECT 1 as ok").first();
    checks.database = result?.ok === 1 ? "connected" : "error";
  } catch {
    checks.database = "error";
    allHealthy = false;
  }

  // Check KV Namespace
  try {
    await c.env.KV.get("health-check");
    checks.kv = "connected";
  } catch {
    checks.kv = "error";
    allHealthy = false;
  }

  // Check R2 Bucket
  try {
    await c.env.R2.head("health-check");
    checks.r2 = "connected";
  } catch (error: unknown) {
    // R2.head returns null for non-existent keys, only errors on connection issues
    const isNotFound = error instanceof Error && error.message.includes("not found");
    checks.r2 = isNotFound || !error ? "connected" : "error";
    if (checks.r2 === "error") allHealthy = false;
  }

  // Check required secrets
  checks.auth = c.env.BETTER_AUTH_SECRET ? "configured" : "missing";
  if (!c.env.BETTER_AUTH_SECRET) allHealthy = false;

  // Optional services
  checks.stripe = c.env.STRIPE_SECRET_KEY ? "configured" : "not configured";
  checks.email = c.env.RESEND_API_KEY ? "configured" : "not configured";

  return c.json(
    {
      status: allHealthy ? "ready" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503
  );
});

// Liveness check - simple ping
health.get("/live", (c) => {
  return c.json({ status: "alive" });
});

export default health;
