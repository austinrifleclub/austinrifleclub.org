# Environment Setup

This document describes how to configure environment variables and secrets for the Austin Rifle Club website.

## Local Development

### API (Cloudflare Workers)

Create a `.dev.vars` file in the root directory:

```ini
# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:8787

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
```

### Web (Astro)

Create a `.env` file in the `web/` directory:

```ini
PUBLIC_API_URL=http://localhost:8787
```

## Cloudflare Configuration

### D1 Database

Create databases for each environment:

```bash
# Create production database
wrangler d1 create austinrifleclub-db

# Create staging database
wrangler d1 create austinrifleclub-db-staging
```

Update `wrangler.toml` with the database IDs.

### R2 Storage

Create R2 buckets:

```bash
# Create production bucket
wrangler r2 bucket create austinrifleclub-uploads

# Create staging bucket
wrangler r2 bucket create austinrifleclub-uploads-staging
```

### KV Namespace

Create KV namespaces for rate limiting:

```bash
# Create production KV
wrangler kv:namespace create KV

# Create staging KV
wrangler kv:namespace create KV --env staging
```

## GitHub Secrets

Configure these secrets in your GitHub repository:

### Required Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers and Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### Environment Variables (per environment)

| Variable | Description |
|----------|-------------|
| `STAGING_API_URL` | URL of staging API (e.g., `https://api-staging.austinrifleclub.org`) |
| `PRODUCTION_API_URL` | URL of production API (e.g., `https://api.austinrifleclub.org`) |

## Secrets Management

### Setting Secrets

Use Wrangler to set secrets:

```bash
# Production
wrangler secret put BETTER_AUTH_SECRET --env production
wrangler secret put RESEND_API_KEY --env production
wrangler secret put STRIPE_SECRET_KEY --env production
wrangler secret put STRIPE_WEBHOOK_SECRET --env production

# Staging
wrangler secret put BETTER_AUTH_SECRET --env staging
wrangler secret put RESEND_API_KEY --env staging
wrangler secret put STRIPE_SECRET_KEY --env staging
wrangler secret put STRIPE_WEBHOOK_SECRET --env staging
```

### Secret Rotation

1. Generate new secret value
2. Update in Cloudflare: `wrangler secret put SECRET_NAME`
3. Test functionality
4. Remove old secret from any backups

## Third-Party Services

### Stripe

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhook endpoint: `https://api.austinrifleclub.org/api/payments/webhook`
4. Configure webhook events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.paid`

### Resend (Email)

1. Create Resend account at https://resend.com
2. Verify your domain
3. Get API key from Dashboard
4. Configure sender address in application

### Twilio (SMS) - Optional

1. Create Twilio account at https://twilio.com
2. Get Account SID and Auth Token
3. Purchase phone number for sending
4. Configure phone number in application

## Environment Validation

Run this command to validate your environment:

```bash
npm run typecheck
```

For production deployment validation:

```bash
wrangler deploy --dry-run --env production
```
