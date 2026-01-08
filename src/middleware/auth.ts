import { Context, MiddlewareHandler } from "hono";
import { createAuth, Env } from "../lib/auth";
import type { User, Session } from "../db/schema";

// Extended context type with auth session
export type AuthContext = {
  user: User;
  session: Session;
};

// Middleware to require authentication
export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: AuthContext }> = async (c, next) => {
  const auth = createAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user as User);
  c.set("session", session.session as Session);

  await next();
};

// Optional auth middleware - attaches session if present but doesn't require it
export const optionalAuth: MiddlewareHandler<{ Bindings: Env; Variables: Partial<AuthContext> }> = async (c, next) => {
  const auth = createAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("user", session.user as User);
    c.set("session", session.session as Session);
  }

  await next();
};

// Helper to get current user from context
export function getUser(c: Context<{ Bindings: Env; Variables: AuthContext }>): User {
  return c.get("user");
}

// Helper to get current session from context
export function getSession(c: Context<{ Bindings: Env; Variables: AuthContext }>): Session {
  return c.get("session");
}
