# Technical Specification

Technology stack, database schema, validation rules, business logic, and security.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Database Schema](#2-database-schema)
3. [Validation Rules](#3-validation-rules)
4. [Business Rules](#4-business-rules)
5. [Security & Privacy](#5-security--privacy)

---

# 1. Tech Stack

## 1.1 Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Cloudflare Workers | Edge compute |
| Framework | Hono | Web framework |
| Database | Cloudflare D1 (SQLite) | Primary data store |
| ORM | Drizzle | Type-safe database access |
| Auth | better-auth | Authentication & sessions |
| Validation | Zod | Runtime type validation |
| File Storage | Cloudflare R2 | Images, documents |
| Cache | Cloudflare KV | Session cache, rate limiting |
| Queues | Cloudflare Queues | Background jobs |
| Frontend | Astro | Static site generator |
| Hosting | Cloudflare Pages | Frontend hosting |
| Payments | Stripe | Payment processing |
| Email | Resend | Transactional email |
| SMS | Twilio | Text messages |
| Errors | Sentry | Error tracking |
| AI | Gemini Flash (free), Claude API (paid) | Chatbot, search |

## 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                 Cloudflare Network              │
├─────────────────────────────────────────────────┤
│  Pages (Astro) → Workers (Hono) → D1 (SQLite)  │
│        ↓              ↓                         │
│       KV ←──────── R2 (Files)                  │
│        ↓                                        │
│     Queues (Background Jobs)                   │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  External: Stripe │ Resend │ Twilio │ Sentry   │
└─────────────────────────────────────────────────┘
```

## 1.3 Environment Variables

```env
# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
FROM_EMAIL=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AI
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Sentry
SENTRY_DSN=
```

## 1.4 Cloudflare Bindings

```toml
[[d1_databases]]
binding = "DB"
database_name = "austinrifleclub-db"

[[kv_namespaces]]
binding = "KV"

[[r2_buckets]]
binding = "R2"
bucket_name = "austinrifleclub-files"

[[queues.producers]]
binding = "QUEUE"
queue = "austinrifleclub-jobs"
```

## 1.5 API Routes

```
/api
├── /auth/**              # better-auth
├── /user/me              # GET, PATCH
├── /members              # GET (admin), GET/:id, PATCH/:id
├── /applications         # POST, GET/:id, PATCH/:id
├── /events               # CRUD, POST/:id/register
├── /guests               # GET, POST, GET/history
├── /shop/products        # GET, GET/:id
├── /shop/orders          # POST, GET
├── /announcements        # GET, POST (admin)
├── /documents            # GET, GET/:id
├── /range-status         # GET, PATCH/:range
└── /admin/**             # reports, settings
```

---

# 2. Database Schema

## 2.1 Core Tables (better-auth)

```sql
users (id, name, email, email_verified, image, created_at, updated_at)
sessions (id, user_id, token, expires_at, ip_address, user_agent, created_at, updated_at)
accounts (id, user_id, account_id, provider_id, access_token, password, created_at, updated_at)
verifications (id, identifier, value, expires_at, created_at, updated_at)
```

## 2.2 Membership Tables

```sql
members (
  id, user_id, badge_number, membership_type, status,
  primary_member_id, join_date, expiration_date,
  phone, address_line1, address_line2, city, state, zip,
  emergency_contact_name, emergency_contact_phone,
  referral_code, referred_by, created_at, updated_at
)

applications (
  id, user_id, status, membership_type, how_heard_about_us,
  government_id_url, background_consent_url, payment_id,
  safety_eval_date, safety_eval_result, safety_eval_notes,
  orientation_date, approved_at, approved_by,
  rejected_at, rejected_by, rejection_reason, created_at, updated_at
)

dues_payments (
  id, member_id, amount, payment_type, stripe_payment_id,
  period_start, period_end, status, created_at
)
```

## 2.3 Events Tables

```sql
events (
  id, title, description, event_type, start_time, end_time,
  location, max_participants, registration_deadline, cost,
  requires_certification, is_public, is_recurring, recurrence_rule,
  parent_event_id, director_id, contact_email, created_by, created_at, updated_at
)

event_registrations (
  id, event_id, member_id, status, payment_id,
  waitlist_position, checked_in_at, checked_in_by, created_at, updated_at
)
```

## 2.4 Guest, Shop, Content Tables

```sql
guest_visits (id, host_member_id, guest_name, guest_email, guest_phone, waiver_signed_at, waiver_signature, visit_date, notes, created_at)

products (id, name, description, category, member_price, inventory_count, is_active, sort_order, created_at, updated_at)
product_variants (id, product_id, name, sku, price_adjustment, inventory_count, is_active, created_at)
orders (id, member_id, status, subtotal, tax, shipping, total, stripe_payment_id, fulfillment_type, shipping_address, tracking_number, notes, created_at, updated_at)
order_items (id, order_id, product_id, variant_id, quantity, unit_price, created_at)

announcements (id, title, body, announcement_type, publish_at, expires_at, is_pinned, send_email, send_sms, created_by, created_at, updated_at)
documents (id, title, description, category, file_url, file_type, file_size, access_level, download_count, created_by, created_at, updated_at)
```

## 2.5 Competition & Volunteer Tables

```sql
match_results (id, event_id, member_id, division, classification, overall_place, division_place, total_time, total_points, penalty_count, stage_results, practiscore_id, created_at, updated_at)
member_classifications (id, member_id, sport, division, classification, effective_date, created_at)
volunteer_hours (id, member_id, date, hours, activity, notes, verified_by, verified_at, credit_amount, created_at, updated_at)
certifications (id, member_id, certification_type_id, earned_date, expires_at, document_url, verified_by, verified_at, created_at, updated_at)
```

## 2.6 Governance Tables

```sql
board_positions (id, title, description, election_year_parity, term_years, sort_order)
board_members (id, position_id, member_id, term_start, term_end, is_current, created_at)
elections (id, election_year, status, nominations_open_at, nominations_close_at, voting_open_at, voting_close_at, created_at)
election_candidates (id, election_id, position_id, member_id, bio, statement, photo_url, is_eligible, created_at)
election_votes (id, election_id, position_id, voter_id, candidate_id, voted_at)
meetings (id, meeting_type, title, scheduled_at, location, agenda_url, minutes_url, is_executive_session, attendance_count, created_at, updated_at)
motions (id, meeting_id, title, description, motion_type, proposed_by, seconded_by, votes_for, votes_against, votes_abstain, required_threshold, passed, created_at)
discipline_cases (id, member_id, status, charges, filed_by, certified_mail_sent_at, hearing_date, decision, votes_for, votes_against, appeal_result, created_at, updated_at)
```

## 2.7 System Tables

```sql
notification_preferences (id, user_id, general_announcements, safety_alerts, event_reminders, dues_reminders, newsletter, match_results, forum_notifications, created_at, updated_at)
audit_log (id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
range_status (id, range_name, status, notes, updated_by, updated_at)
```

---

# 3. Validation Rules

## 3.1 General Rules

| Type | Rule |
|------|------|
| Text | Trim whitespace, normalize unicode (NFC), max 255 chars |
| Email | RFC 5322, max 254 chars, stored lowercase |
| Phone | E.164 format (+1XXXXXXXXXX), 10 digits US |
| URL | https:// required, max 2048 chars |
| Date | Unix timestamp, UTC internally, display in CT |
| Currency | Integer cents ($100.00 = 10000), no negatives except refunds |

## 3.2 User Account

| Field | Required | Min | Max | Notes |
|-------|----------|-----|-----|-------|
| email | Yes | 5 | 254 | Unique |
| password | Yes | 8 | 128 | No common passwords, no last 5 reused |
| name | Yes | 1 | 100 | Full name |

## 3.3 Member Profile

| Field | Required | Max | Notes |
|-------|----------|-----|-------|
| first_name | Yes | 50 | — |
| last_name | Yes | 50 | — |
| phone | Yes | 15 | E.164 format |
| address_line1 | Yes | 100 | — |
| city | Yes | 50 | — |
| state | Yes | 2 | TX, etc. |
| zip | Yes | 10 | 12345 or 12345-6789 |
| emergency_name | Yes | 100 | — |
| emergency_phone | Yes | 15 | — |

## 3.4 File Uploads

| Context | Types | Max Size |
|---------|-------|----------|
| Profile photo | JPG, PNG | 2MB |
| ID document | JPG, PNG, PDF | 10MB |
| Product image | JPG, PNG, WebP | 5MB |
| Meeting minutes | PDF | 20MB |

**Security:** Virus scan all uploads, check magic bytes, sanitize filenames.

## 3.5 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Password reset | 3 requests | 1 hour |
| API general | 100 requests | 1 minute |
| File upload | 20 uploads | 1 hour |

---

# 4. Business Rules

## 4.1 Membership Year

- **Fiscal year:** April 1 – March 31
- **Expiration time:** 11:59 PM Central
- **Grace period:** None (access revoked immediately)
- **Reinstatement:** 0-60 days = pay online; 60+ days = reapply

## 4.2 Proration

| Join Month | Proration |
|------------|-----------|
| April | 100% |
| July | 75% |
| October | 50% |
| January | 25% |

**Minimum dues:** $25. **Initiation fee:** Never prorated ($200 always).

## 4.3 Family Membership

| Capability | Primary | Spouse | Junior |
|------------|---------|--------|--------|
| Independent login | Yes | Yes | Yes |
| Pay dues | Yes | No | No |
| Sign in guests | Yes | No | No |
| Voting rights | Yes | Family type only | No |

**Junior aging out:** Email 60 days before 21st birthday, 30-day grace to convert.

## 4.4 Life Membership

- **Path 1:** 25 years continuous
- **Path 2:** 19 years + 6 years prepaid
- **Post-2011:** 50% of annual dues (can request exemption)
- **Breaks continuity:** Lapsed 60+ days, voluntary resignation, expulsion

## 4.5 Applications

| Timeout | Days |
|---------|------|
| Documents | 30 |
| Safety eval | 60 from doc approval |
| Orientation | 90 from safety eval |
| Total | 180 from submission |

**BOD vote:** 3/4 majority required. Cannot auto-approve.

## 4.6 Events

| Cancellation | Refund |
|--------------|--------|
| 7+ days before | 100% |
| 2-6 days | 50% |
| <2 days | 0% |

**Waitlist:** 24 hours to claim spot when notified.

## 4.7 Guests

- Max 3 per member per visit
- Same guest: 3 visits per calendar year
- Waiver required every visit
- After 3rd visit: blocked until member

## 4.8 Volunteer Credits

| Activity | Credit |
|----------|--------|
| 1 hour | $10 |
| Match director | $25 |
| RSO full day | $25 |

**Expiration:** March 31 (no rollover). Use for dues, shop, events.

## 4.9 Voting Thresholds

| Decision | Threshold |
|----------|-----------|
| Application approval | 3/4 of BOD |
| Expulsion | 2/3 of full BOD |
| Bylaw amendment | 2/3 of voting members |
| Dues change | Majority of voting members |
| Expenditure $50k+ | 2/3 of voting members |

## 4.10 Calculations

```javascript
// Proration
months_remaining = 12 - (current_month - 4) % 12
prorated_dues = max(annual_dues * months_remaining / 12, 25)

// Age
age = floor((today - birth_date) / 365.25)

// Voting threshold (2/3)
required = ceil(total_voters * 2 / 3)
passed = votes_for >= required
```

---

# 5. Security & Privacy

## 5.1 Authentication

| Rule | Setting |
|------|---------|
| Password min length | 8 characters |
| Hashing | Argon2id |
| Session duration | 7 days |
| Concurrent sessions | Max 5 |
| Brute force | 5 attempts per 15 minutes |
| Account lockout | 30 minutes after 10 failures |
| MFA | Optional (TOTP) |

## 5.2 Authorization (RBAC)

| Role | Level | Scope |
|------|-------|-------|
| Visitor | 0 | Public content only |
| Prospect | 1 | Own application |
| Member | 2 | Member content, own data |
| Volunteer | 3 | Assigned functions |
| Director | 4 | Department functions |
| Admin | 5 | Full system access |

## 5.3 Data Classification

| Classification | Examples |
|----------------|----------|
| Public | Club info, pricing, range rules |
| Member | Directory (names), forums, bylaws |
| Sensitive | Full profiles, payments, ID docs |
| Confidential | Passwords, votes, card numbers |

## 5.4 Data Retention

| Data | Retention |
|------|-----------|
| Contact info | Membership + 3 years |
| Payment history | 7 years |
| ID documents | 30 days after approval |
| Audit logs | 7 years |
| Error logs | 90 days |

## 5.5 Encryption

| Location | Method |
|----------|--------|
| Database | D1 encrypted by Cloudflare |
| File storage | AES-256 (Cloudflare R2) |
| ID documents | Additional application-level encryption |
| Transit | TLS 1.3 |

## 5.6 API Security

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

**Protections:** Parameterized queries (SQL injection), output encoding (XSS), SameSite cookies + CSRF tokens, virus scan uploads.

## 5.7 Audit Logging

All logged: Login/logout, password changes, profile updates, payments, admin actions, permission changes, data exports/deletions.

**Protection:** Append-only, checksums, admin read-only, 7-year retention.

## 5.8 Incident Response

| Severity | Response Time |
|----------|---------------|
| Critical (active breach) | Immediate |
| High (vulnerability exploited) | 4 hours |
| Medium (vulnerability discovered) | 24 hours |

**Data breach:** Notify President immediately, affected members within 72 hours.

## 5.9 Third-Party Security

| Vendor | Compliance |
|--------|------------|
| Stripe | PCI-DSS |
| Cloudflare | SOC 2, ISO 27001 |
| Resend | SOC 2 |
| Twilio | SOC 2, ISO 27001 |

## 5.10 Member Rights

| Right | Method |
|-------|--------|
| Access | Download from dashboard |
| Correction | Self-service or admin request |
| Deletion | Request (30-day response) |
| Portability | Export as JSON/CSV |

---

# 6. Maintainability & Support Model

The board consists of volunteer members who are not software developers. This system must be maintainable without requiring a full-time technical staff, while still being a modern, custom solution that avoids the limitations of WordPress.

## 6.1 Support Tiers

| Tier | Who Handles | Tools | Response Time |
|------|-------------|-------|---------------|
| **Tier 1: Self-Service** | Board member | Admin UI | Immediate |
| **Tier 2: AI-Assisted** | Board member + AI | GitHub Copilot, Claude | Hours |
| **Tier 3: Developer** | Hired contractor | Full codebase access | Days/weeks |

### Tier 1: Self-Service (90% of needs)

Everything a board member routinely does should be possible through the admin UI with no code changes.

| Task | Solution |
|------|----------|
| Update range status | Admin → Range Status |
| Post announcement | Admin → Announcements |
| Approve application | Admin → Applications → Vote |
| Change dues pricing | Admin → Settings → Membership |
| Add event | Admin → Events → Create |
| Issue refund | Admin → Payments → Refund |
| Update board member | Admin → Governance → Board |
| Change email templates | Admin → Settings → Notifications |
| Update range rules PDF | Admin → Documents → Upload |
| Modify shop inventory | Admin → Shop → Products |

**Design principle:** If a board member asks "how do I change X?" and the answer requires code, that's a bug in the admin UI.

### Tier 2: AI-Assisted (8% of needs)

For changes that require touching code but are straightforward enough for AI to handle with guidance.

| Task | Example | AI Capability |
|------|---------|---------------|
| Update static content | Change About page text | High |
| Adjust validation rules | Change password min length | High |
| Modify email copy | Tweak welcome email wording | High |
| Add form field | Add "How did you hear about us?" option | Medium |
| Change business rule | Adjust proration formula | Medium |
| Fix simple bug | Button not working | Medium |

**How it works:**

1. Board member opens GitHub Codespaces or local VS Code
2. Describes problem to GitHub Copilot / Claude
3. AI suggests changes with explanation
4. Board member reviews diff, commits if it looks right
5. Automatic deployment via Cloudflare

**Requirements for Tier 2 to work:**

- Clean, well-typed TypeScript (AI understands it better)
- Descriptive variable/function names
- Inline comments explaining "why" for business logic
- Small, focused files (< 300 lines)
- Comprehensive test coverage (AI can verify changes don't break things)
- Clear error messages that explain what went wrong

### Tier 3: Developer (2% of needs)

For significant new features, complex bugs, or architectural changes. Hire a contractor or agency.

| Task | Example | Why Tier 3 |
|------|---------|-----------|
| New feature | Add forum system | Significant new code |
| Integration | Connect to new payment processor | Security-sensitive |
| Performance | Optimize slow queries | Requires profiling |
| Security issue | Fix vulnerability | Requires expertise |
| Major refactor | Restructure database | High risk |
| Upgrade | Major framework version bump | Breaking changes |

**Why this works:**

| Factor | Benefit |
|--------|---------|
| Standard stack | React/TypeScript/Hono—any agency knows this |
| No vendor lock-in | Not tied to WordPress plugins or proprietary systems |
| Clean codebase | New developer can understand it quickly |
| Good documentation | This spec + inline docs + README |
| Type safety | Compiler catches errors before deployment |
| Test coverage | Confidence that changes don't break things |

**Finding a contractor:**

- Any React/TypeScript development agency
- Cloudflare Workers experience helpful but not required
- Budget: $100-200/hr for US-based, $50-100/hr for international
- For small fixes: 2-4 hours. For features: 20-40 hours.

## 6.2 Design Principles for Maintainability

### Code Organization

```
src/
├── routes/           # API endpoints (one file per resource)
├── db/
│   └── schema.ts     # All tables in one file, well-commented
├── lib/
│   ├── auth.ts       # Authentication logic
│   ├── email.ts      # Email sending
│   ├── stripe.ts     # Payment processing
│   └── validation.ts # Zod schemas
├── middleware/       # Auth, rate limiting, etc.
└── index.ts          # App entry point
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `guest-visits.ts` |
| Functions | camelCase, verb-first | `createApplication()` |
| Types | PascalCase | `MembershipType` |
| Database tables | snake_case | `guest_visits` |
| Constants | SCREAMING_SNAKE | `MAX_GUESTS_PER_VISIT` |

### Documentation Requirements

| Location | What to Document |
|----------|------------------|
| README.md | Setup, deployment, common tasks |
| Code comments | Business logic ("why"), not obvious code |
| Type definitions | All fields with descriptions |
| API routes | Request/response examples |
| Database schema | What each table/column is for |

### Example: Well-Documented Business Logic

```typescript
/**
 * Calculate prorated dues for new members.
 *
 * Fiscal year runs April 1 - March 31.
 * Minimum dues is $25 regardless of join date.
 * Initiation fee ($200) is never prorated.
 *
 * @see Bylaws Section 4.2 for proration rules
 */
export function calculateProratedDues(
  annualDues: number,  // In cents (e.g., 15000 = $150)
  joinDate: Date
): number {
  const fiscalYearStart = 4; // April
  const currentMonth = joinDate.getMonth() + 1;

  // Months remaining in fiscal year
  const monthsRemaining = 12 - ((currentMonth - fiscalYearStart + 12) % 12);

  // Prorate, but minimum $25
  const prorated = Math.round(annualDues * monthsRemaining / 12);
  const minimum = 2500; // $25 in cents

  return Math.max(prorated, minimum);
}
```

## 6.3 Reducing Tier 3 Dependency

### Build Admin UI First

Before building any feature, ask: "Can a board member manage this without code?"

| Feature | Requires Admin UI For |
|---------|----------------------|
| Membership types | Add/edit types, pricing, rules |
| Events | Full CRUD, recurring, categories |
| Email templates | Edit subject, body, variables |
| Range configuration | Add ranges, set statuses, rules |
| Shop | Products, variants, inventory, pricing |
| Documents | Upload, categorize, set access |
| Settings | All configurable values |

### Configuration Over Code

Move business rules to database/config where possible:

```typescript
// ❌ Bad: Hardcoded, requires code change
const MAX_GUESTS = 3;
const GUEST_VISIT_LIMIT = 3;

// ✅ Good: Configurable via admin UI
const settings = await db.query.settings.findFirst();
const maxGuests = settings.maxGuestsPerVisit;        // 3
const visitLimit = settings.guestVisitsPerYear;      // 3
```

### Self-Healing Where Possible

| Scenario | Automatic Recovery |
|----------|-------------------|
| Failed payment | Retry 3x, then notify member |
| Email bounce | Mark email invalid, notify admin |
| Upload fails | Retry with exponential backoff |
| Rate limit hit | Queue and retry later |
| External API down | Use cached data, retry later |

## 6.4 Emergency Procedures

### Site Is Down

1. Check [status.cloudflare.com](https://status.cloudflare.com)
2. Check GitHub Actions for failed deployments
3. If recent deploy: revert via GitHub (one click)
4. If unclear: contact Tier 3 developer

### Payment System Broken

1. Check [status.stripe.com](https://status.stripe.com)
2. Accept manual payments (check/cash) at range
3. Log payments in Admin → Payments → Manual
4. Don't turn away members—honor memberships even if system shows expired

### Database Issue

1. D1 has automatic backups (Cloudflare)
2. Contact Tier 3 developer for restore
3. Point-in-time recovery available

### Credential Compromised

1. Rotate the specific secret in Cloudflare dashboard
2. Admin → Settings → Integrations → Reconnect
3. Check audit log for suspicious activity

## 6.5 Vendor Relationships

| Vendor | What They Provide | Failure Impact | Contact |
|--------|-------------------|----------------|---------|
| Cloudflare | Hosting, database, files | Site down | Dashboard or support |
| Stripe | Payments | Can't process payments | Dashboard |
| Resend | Email | Emails don't send | Dashboard |
| Twilio | SMS | Texts don't send | Dashboard |
| Domain registrar | Domain | Site unreachable | Varies |

**All credentials stored in:** Cloudflare Dashboard → Workers → Settings → Variables

**Password manager:** Use 1Password or similar for shared board access to vendor accounts.
