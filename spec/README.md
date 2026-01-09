# Austin Rifle Club — Website Specification

A comprehensive website for a private, non-profit shooting club in Manor, Texas.

**Location**: 16312 Littig Rd, Manor, TX 78653
**Current Members**: ~1,500
**Founded**: 1894 | **Incorporated**: December 8, 1928
**Charter #**: 52790 (Texas Non-Profit Corporation)
**Fiscal Year**: April 1 – March 31

---

## Specification Files

| Document | Description |
|----------|-------------|
| [features.md](./features.md) | All user-facing features: membership, events, guests, shop, ranges, content, community |
| [admin.md](./admin.md) | Admin dashboard, notifications, governance, bylaws, operations runbook |
| [technical.md](./technical.md) | Tech stack, database schema, validation rules, business rules, security |
| [growth.md](./growth.md) | Analytics, SEO, marketing, KPIs, content strategy |

---

## Quick Reference

### User Roles

| Role | Access Level |
|------|--------------|
| Visitor | Public content only |
| Prospect | Application in progress |
| Member | Full member features |
| Family | Limited member features |
| Volunteer | Member + assigned tasks |
| Instructor | Volunteer + class management |
| Director | Department administration |
| Admin | Full system access |

### Key Integrations

| Service | Purpose |
|---------|---------|
| Stripe | Payments |
| Resend | Email |
| Twilio | SMS |
| Cloudflare | Hosting, CDN, security |
| Practiscore | Match results |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Cloudflare Workers |
| Framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle |
| Auth | better-auth |
| Validation | Zod |
| Frontend | Astro on Cloudflare Pages |
| Files | Cloudflare R2 |

---

## How to Use This Spec

**For developers:** Start with `technical.md` for architecture, then `features.md` for requirements.

**For board members:** Read `admin.md` for operations runbook and governance rules.

**For marketing:** See `growth.md` for analytics, SEO, and content strategy.

**Looking for something specific:**

| Topic | File | Section |
|-------|------|---------|
| Membership application | features.md | 1. Membership |
| Event registration | features.md | 2. Events |
| Guest waivers | features.md | 3. Guests |
| Shop orders | features.md | 4. Shop |
| Range status | features.md | 5. Ranges |
| BOD elections | admin.md | 3. Governance |
| Discipline process | admin.md | 3. Governance |
| Database schema | technical.md | 2. Database |
| Validation rules | technical.md | 3. Validation |
| Security | technical.md | 5. Security |
| SEO | growth.md | 2. SEO & Marketing |
| KPIs | growth.md | 3. Success Metrics |
