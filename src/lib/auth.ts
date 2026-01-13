import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db";
import * as schema from "../db/schema";
import { sendEmail, magicLinkEmail } from "./email";

export type Env = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ALLOWED_ORIGINS?: string;
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
        passkey: schema.passkeys,
      },
    }),
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    // Passwordless authentication only - using magic links and passkeys
    emailAndPassword: {
      enabled: false,
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
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const emailContent = magicLinkEmail(url);
          await sendEmail(env.RESEND_API_KEY || '', {
            to: email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        },
        expiresIn: 60 * 15, // 15 minutes
      }),
      passkey({
        rpID: new URL(env.BETTER_AUTH_URL).hostname,
        rpName: "Austin Rifle Club",
        origin: env.BETTER_AUTH_URL,
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
