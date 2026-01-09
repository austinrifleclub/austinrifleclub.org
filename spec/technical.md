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
