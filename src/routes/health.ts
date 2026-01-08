import { Hono } from "hono";
import { Env } from "../lib/auth";

const health = new Hono<{ Bindings: Env }>();

// Basic health check endpoint
health.get("/", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Readiness check - verifies database connection
health.get("/ready", async (c) => {
  try {
    // Simple query to verify D1 connection
    const result = await c.env.DB.prepare("SELECT 1 as ok").first();

    return c.json({
      status: "ready",
      database: result?.ok === 1 ? "connected" : "error",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        status: "not ready",
        database: "error",
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

export default health;
