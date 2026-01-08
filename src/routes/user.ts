import { Hono } from "hono";
import { Env } from "../lib/auth";
import { requireAuth, getUser, AuthContext } from "../middleware/auth";

const user = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// All routes in this file require authentication
user.use("/*", requireAuth);

// Get current user profile
user.get("/me", (c) => {
  const currentUser = getUser(c);

  return c.json({
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    image: currentUser.image,
    createdAt: currentUser.createdAt,
  });
});

export default user;
