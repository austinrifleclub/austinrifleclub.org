import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuth, Env } from "./lib/auth";
import openApiSpec from "./openapi.json";
import { requestLogger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { securityHeaders, requestId } from "./middleware/security";
import { authRateLimit, apiRateLimit, publicRateLimit } from "./middleware/rateLimit";

// Route imports
import healthRoutes from "./routes/health";
import userRoutes from "./routes/user";
import membersRoutes from "./routes/members";
import applicationsRoutes from "./routes/applications";
import eventsRoutes from "./routes/events";
import guestsRoutes from "./routes/guests";
import rangeStatusRoutes from "./routes/range-status";
import paymentsRoutes from "./routes/payments";
import uploadsRoutes from "./routes/uploads";
import volunteerRoutes from "./routes/volunteer";
import certificationsRoutes from "./routes/certifications";

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use("*", requestId()); // Add request ID for tracing
app.use("*", securityHeaders()); // Add security headers
app.use("*", logger()); // Keep Hono's logger for development
app.use("*", requestLogger()); // Add structured JSON logging
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow configured origins in production
      const allowedOrigins = [
        "http://localhost:4321",
        "http://localhost:3000",
        "https://austinrifleclub.org",
        "https://www.austinrifleclub.org",
        "https://staging.austinrifleclub.org",
      ];
      return allowedOrigins.includes(origin) ? origin : null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposeHeaders: ["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 86400, // 24 hours
  })
);

// Health check routes (no rate limit)
app.route("/health", healthRoutes);

// Public endpoints with lenient rate limiting
app.use("/api/range-status/*", publicRateLimit);
app.use("/api/events", publicRateLimit); // GET events list is public

// Auth endpoints with strict rate limiting
app.use("/api/auth/*", authRateLimit);

// Mount better-auth at /api/auth/*
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// OpenAPI specification
app.get("/api/openapi.json", (c) => {
  return c.json(openApiSpec);
});

// Standard API rate limiting for all other endpoints
app.use("/api/*", apiRateLimit);

// API Routes
app.route("/api/user", userRoutes);
app.route("/api/members", membersRoutes);
app.route("/api/applications", applicationsRoutes);
app.route("/api/events", eventsRoutes);
app.route("/api/guests", guestsRoutes);
app.route("/api/range-status", rangeStatusRoutes);
app.route("/api/payments", paymentsRoutes);
app.route("/api/uploads", uploadsRoutes);
app.route("/api/volunteer", volunteerRoutes);
app.route("/api/certifications", certificationsRoutes);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Austin Rifle Club API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/**",
      members: "/api/members",
      applications: "/api/applications",
      events: "/api/events",
      guests: "/api/guests",
      rangeStatus: "/api/range-status",
      payments: "/api/payments",
      uploads: "/api/uploads",
      volunteer: "/api/volunteer",
      certifications: "/api/certifications",
    },
  });
});

// 404 handler - uses standardized error response
app.notFound(notFoundHandler);

// Error handler - uses standardized error handling with logging
app.onError(errorHandler);

export default app;
