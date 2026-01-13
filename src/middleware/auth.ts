import { Context, MiddlewareHandler } from "hono";
import { eq } from "drizzle-orm";
import { createAuth, Env } from "../lib/auth";
import { createDb, Database } from "../db";
import type { User, Session, Member } from "../db/schema";
import { members } from "../db/schema";

// Extended context type with auth session
export type AuthContext = {
  user: User;
  session: Session;
  db: Database;
};

// Extended context with member info
export type MemberContext = AuthContext & {
  member: Member;
};

// Middleware to require authentication
export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: AuthContext }> = async (c, next) => {
  const auth = createAuth(c.env);
  const db = createDb(c.env.DB);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user as User);
  c.set("session", session.session as Session);
  c.set("db", db);

  await next();
};

/**
 * Middleware to require authenticated member (not just user)
 * Use this for routes that need member profile access
 */
export const requireMember: MiddlewareHandler<{ Bindings: Env; Variables: MemberContext }> = async (c, next) => {
  const auth = createAuth(c.env);
  const db = createDb(c.env.DB);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Look up member profile
  const member = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!member) {
    return c.json({ error: "Member profile not found. Please complete your membership application." }, 404);
  }

  // Check member is active or probationary
  if (!["active", "probationary"].includes(member.status)) {
    return c.json({ error: "Membership not active", status: member.status }, 403);
  }

  c.set("user", session.user as User);
  c.set("session", session.session as Session);
  c.set("db", db);
  c.set("member", member);

  await next();
};

/**
 * Middleware to require admin role
 * Checks if the member has admin privileges (board member or admin status)
 */
export const requireAdmin: MiddlewareHandler<{ Bindings: Env; Variables: MemberContext }> = async (c, next) => {
  const auth = createAuth(c.env);
  const db = createDb(c.env.DB);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const member = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!member) {
    return c.json({ error: "Member profile not found" }, 404);
  }

  // Check if member is on the board (has a current board position)
  const boardMember = await db.query.boardMembers.findFirst({
    where: (bm, { eq, and }) =>
      and(eq(bm.memberId, member.id), eq(bm.isCurrent, true)),
  });

  if (!boardMember) {
    return c.json({ error: "Admin access required" }, 403);
  }

  c.set("user", session.user as User);
  c.set("session", session.session as Session);
  c.set("db", db);
  c.set("member", member);

  await next();
};

// Optional auth middleware - attaches session if present but doesn't require it
export const optionalAuth: MiddlewareHandler<{ Bindings: Env; Variables: Partial<AuthContext> }> = async (c, next) => {
  const auth = createAuth(c.env);
  const db = createDb(c.env.DB);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("db", db);

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
