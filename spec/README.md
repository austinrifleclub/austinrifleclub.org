# Austin Rifle Club — Website Specification

A comprehensive website for a private, non-profit shooting club in Manor, Texas.

**Location**: 16312 Littig Rd, Manor, TX 78653
**Current Members**: ~1,500
**Founded**: 1894 | **Incorporated**: December 8, 1928
**Charter #**: 52790 (Texas Non-Profit Corporation)
**Fiscal Year**: April 1 – March 31

---

## Specification Index

### Core Domain

| Document | Description |
|----------|-------------|
| [membership.md](./membership.md) | Applications, dues, renewals, family members, life membership |
| [events.md](./events.md) | Calendar, matches, classes, scoring, volunteer tracking |
| [guests.md](./guests.md) | Guest sign-in, waivers, visit limits |
| [shop.md](./shop.md) | Products, orders, volunteer credits |
| [ranges.md](./ranges.md) | Status, reservations, rentals, digital member card |
| [content.md](./content.md) | Public website, announcements, documents, AI features |
| [community.md](./community.md) | Forums, classifieds, photos, mentorship, gamification |

### System & Operations

| Document | Description |
|----------|-------------|
| [01-overview.md](./01-overview.md) | Project overview and user roles |
| [05-admin-dashboard.md](./05-admin-dashboard.md) | Admin dashboard and reports |
| [06-notifications.md](./06-notifications.md) | Notification system |
| [07-tech-stack.md](./07-tech-stack.md) | Technology stack and database schema |
| [08-success-metrics.md](./08-success-metrics.md) | Success metrics and KPIs |

### Governance & Compliance

| Document | Description |
|----------|-------------|
| [09-content-strategy.md](./09-content-strategy.md) | Educational content and range guides |
| [10-governance.md](./10-governance.md) | Bylaws, BOD structure, elections, compliance |
| [11-operations.md](./11-operations.md) | Admin runbooks and procedures |

### Technical Reference

| Document | Description |
|----------|-------------|
| [12-validation.md](./12-validation.md) | Field validation rules and constraints |
| [13-business-rules.md](./13-business-rules.md) | Edge cases, calculations, system behavior |
| [14-security.md](./14-security.md) | Data protection, access control, privacy |

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

---

## Development Notes

Each spec document is organized by feature domain rather than implementation phase. This allows:

1. **Clear ownership** — Each document covers one area of functionality
2. **Easy reference** — Find related features in one place
3. **Incremental delivery** — Build features from any document independently
4. **Board handoffs** — Volunteers can understand their domain without reading everything

All documents reference the business rules and validation specs for implementation details.
