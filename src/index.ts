import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuth, Env } from "./lib/auth";
import healthRoutes from "./routes/health";
import userRoutes from "./routes/user";

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:4321", "http://localhost:3000"], // Astro dev servers
    credentials: true,
  })
);

// Health check routes
app.route("/health", healthRoutes);

// Protected user routes
app.route("/api/user", userRoutes);

// Mount better-auth at /api/auth/**
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Austin Rifle Club API",
    version: "1.0.0",
    docs: "/api/docs",
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
