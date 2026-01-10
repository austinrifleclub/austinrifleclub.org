import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db";
import * as schema from "../db/schema";
import { sendEmail, passwordResetEmail, magicLinkEmail } from "./email";

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
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          // In staging/dev, log the magic link for easy testing
          const isProduction = env.BETTER_AUTH_URL?.includes('austinrifleclub.org')
            && !env.BETTER_AUTH_URL?.includes('staging');

          if (!isProduction) {
            console.log('========================================');
            console.log('[Magic Link] Login link for testing:');
            console.log(`  Email: ${email}`);
            console.log(`  URL: ${url}`);
            console.log('========================================');
          }

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
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
