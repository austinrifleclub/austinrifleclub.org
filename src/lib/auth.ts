import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db";
import * as schema from "../db/schema";
import { sendEmail, passwordResetEmail } from "./email";

export type Env = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
};

// Create auth instance per request with environment bindings
export function createAuth(env: Env) {
  const db = createDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production
      sendResetPassword: async ({ user, url }) => {
        const email = passwordResetEmail(url);
        await sendEmail(env.RESEND_API_KEY || '', {
          to: user.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    trustedOrigins: ["http://localhost:4321"], // Astro dev server
  });
}

export type Auth = ReturnType<typeof createAuth>;
