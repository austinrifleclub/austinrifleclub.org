# Technology Stack & Database

Technical implementation details for the Austin Rifle Club website.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Cloudflare Workers | Edge compute |
| Framework | Hono | Web framework |
| Database | Cloudflare D1 (SQLite) | Primary data store |
| ORM | Drizzle | Type-safe database access |
| Auth | better-auth | Authentication & sessions |
| Validation | Zod | Runtime type validation |
| CMS | Decap (Git-based) | Content management |
| File Storage | Cloudflare R2 | Images, documents |
| Cache | Cloudflare KV | Session cache, rate limiting |
| Queues | Cloudflare Queues | Background jobs |
| Frontend | Astro | Static site generator |
| Hosting | Cloudflare Pages | Frontend hosting |
| Payments | Stripe | Payment processing |
| Email | Resend | Transactional email |
| SMS | Twilio | Text messages |
| Errors | Sentry | Error tracking |
| AI (free) | Gemini Flash | Chatbot, search |
| AI (paid) | Claude API | Advanced features |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Network                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Cloudflare │    │   Cloudflare │    │   Cloudflare │  │
│  │    Pages     │    │   Workers    │    │      D1      │  │
│  │   (Astro)    │───▶│   (Hono)     │───▶│   (SQLite)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         │                   ▼                   │           │
│         │            ┌──────────────┐           │           │
│         │            │      R2      │           │           │
│         │            │   (Files)    │           │           │
│         │            └──────────────┘           │           │
│         │                   │                   │           │
│         │                   ▼                   │           │
│         │            ┌──────────────┐           │           │
│         │            │      KV      │           │           │
│         └───────────▶│   (Cache)    │◀──────────┘           │
│                      └──────────────┘                       │
│                             │                               │
│                             ▼                               │
│                      ┌──────────────┐                       │
│                      │    Queues    │                       │
│                      │   (Jobs)     │                       │
│                      └──────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │       External Services        │
              ├───────────────────────────────┤
              │  Stripe │ Resend │ Twilio     │
              │  Sentry │ Gemini │ Claude     │
              └───────────────────────────────┘
```

---

## Database Schema

### Core Tables

```sql
-- Users (managed by better-auth)
users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Sessions (managed by better-auth)
sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Accounts (managed by better-auth)
accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Verifications (managed by better-auth)
verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Membership Tables

```sql
-- Members (extends users)
members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  badge_number TEXT UNIQUE,
  membership_type TEXT NOT NULL, -- individual, family, life, senior, veteran
  status TEXT NOT NULL, -- prospect, active, inactive, terminated
  primary_member_id TEXT REFERENCES members(id), -- for family members
  join_date INTEGER,
  expiration_date INTEGER,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT REFERENCES members(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Applications
applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL, -- submitted, documents_pending, payment_pending,
                        -- safety_eval_scheduled, safety_eval_completed,
                        -- orientation_scheduled, orientation_completed,
                        -- approved, rejected
  membership_type TEXT NOT NULL,
  how_heard_about_us TEXT,
  government_id_url TEXT,
  background_consent_url TEXT,
  payment_id TEXT,
  safety_eval_date INTEGER,
  safety_eval_result TEXT,
  safety_eval_notes TEXT,
  orientation_date INTEGER,
  approved_at INTEGER,
  approved_by TEXT REFERENCES users(id),
  rejected_at INTEGER,
  rejected_by TEXT REFERENCES users(id),
  rejection_reason TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Dues Payments
dues_payments (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  amount INTEGER NOT NULL, -- in cents
  payment_type TEXT NOT NULL, -- initiation, annual, prorated
  stripe_payment_id TEXT,
  period_start INTEGER,
  period_end INTEGER,
  status TEXT NOT NULL, -- pending, completed, refunded, failed
  created_at INTEGER NOT NULL
)
```

### Events Tables

```sql
-- Events
events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- match, class, orientation, workday,
                            -- board_meeting, private, closure
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  location TEXT, -- range A-L, education building, etc.
  max_participants INTEGER,
  registration_deadline INTEGER,
  cost INTEGER, -- in cents, 0 for free
  requires_certification TEXT, -- JSON array of certification IDs
  is_public INTEGER NOT NULL DEFAULT 1,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurrence_rule TEXT, -- iCal RRULE format
  parent_event_id TEXT REFERENCES events(id),
  director_id TEXT REFERENCES members(id),
  contact_email TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Event Registrations
event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id),
  member_id TEXT NOT NULL REFERENCES members(id),
  status TEXT NOT NULL, -- registered, waitlisted, cancelled, attended, no_show
  payment_id TEXT,
  waitlist_position INTEGER,
  checked_in_at INTEGER,
  checked_in_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(event_id, member_id)
)
```

### Guest Tables

```sql
-- Guest Visits
guest_visits (
  id TEXT PRIMARY KEY,
  host_member_id TEXT NOT NULL REFERENCES members(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  waiver_signed_at INTEGER NOT NULL,
  waiver_signature TEXT NOT NULL, -- base64 signature image
  visit_date INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL
)
```

### Shop Tables

```sql
-- Products
products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  member_price INTEGER NOT NULL, -- in cents
  non_member_price INTEGER, -- null if members only
  inventory_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Product Variants
product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  name TEXT NOT NULL, -- e.g., "Large", "Blue"
  sku TEXT UNIQUE,
  price_adjustment INTEGER NOT NULL DEFAULT 0, -- in cents
  inventory_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
)

-- Product Images
product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
)

-- Orders
orders (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  status TEXT NOT NULL, -- pending, paid, ready, shipped, completed, cancelled
  subtotal INTEGER NOT NULL,
  tax INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  stripe_payment_id TEXT,
  fulfillment_type TEXT NOT NULL, -- pickup, shipping
  shipping_address TEXT, -- JSON
  tracking_number TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Order Items
order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  variant_id TEXT REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  created_at INTEGER NOT NULL
)
```

### Content Tables

```sql
-- Announcements
announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  announcement_type TEXT NOT NULL, -- general, safety, event, board, prospect
  publish_at INTEGER NOT NULL,
  expires_at INTEGER,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  send_email INTEGER NOT NULL DEFAULT 0,
  send_sms INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Documents
documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  access_level TEXT NOT NULL, -- public, members, admin
  download_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Competition Tables

```sql
-- Match Results
match_results (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id),
  member_id TEXT NOT NULL REFERENCES members(id),
  division TEXT,
  classification TEXT,
  overall_place INTEGER,
  division_place INTEGER,
  total_time REAL,
  total_points REAL,
  penalty_count INTEGER,
  stage_results TEXT, -- JSON array of stage details
  practiscore_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(event_id, member_id)
)

-- Classifications
member_classifications (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  sport TEXT NOT NULL, -- uspsa, idpa, etc.
  division TEXT NOT NULL,
  classification TEXT NOT NULL,
  effective_date INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(member_id, sport, division)
)
```

### Volunteer Tables

```sql
-- Volunteer Hours
volunteer_hours (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  date INTEGER NOT NULL,
  hours REAL NOT NULL,
  activity TEXT NOT NULL,
  notes TEXT,
  verified_by TEXT REFERENCES users(id),
  verified_at INTEGER,
  credit_amount INTEGER, -- in cents
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Certifications
certifications (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  certification_type_id TEXT NOT NULL REFERENCES certification_types(id),
  earned_date INTEGER NOT NULL,
  expires_at INTEGER,
  document_url TEXT,
  verified_by TEXT REFERENCES users(id),
  verified_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Certification Types
certification_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- required, safety, skills, competition, instructor
  validity_months INTEGER, -- null if never expires
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
)
```

### System Tables

```sql
-- Notification Preferences
notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  general_announcements TEXT NOT NULL DEFAULT 'email',
  safety_alerts TEXT NOT NULL DEFAULT 'email_sms',
  event_reminders TEXT NOT NULL DEFAULT 'email',
  dues_reminders TEXT NOT NULL DEFAULT 'email_sms',
  newsletter TEXT NOT NULL DEFAULT 'email',
  match_results TEXT NOT NULL DEFAULT 'email',
  forum_notifications TEXT NOT NULL DEFAULT 'email',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- Audit Log
audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
)

-- Range Status
range_status (
  id TEXT PRIMARY KEY,
  range_name TEXT NOT NULL UNIQUE, -- A, B, C, etc.
  status TEXT NOT NULL, -- open, closed, reserved
  notes TEXT,
  updated_by TEXT REFERENCES users(id),
  updated_at INTEGER NOT NULL
)
```

---

## API Structure

### Route Groups

```
/api
├── /auth/**           # better-auth routes
├── /user
│   ├── GET /me        # current user
│   └── PATCH /me      # update profile
├── /members
│   ├── GET /          # list (admin)
│   ├── GET /:id       # get member
│   └── PATCH /:id     # update (admin)
├── /applications
│   ├── POST /         # submit application
│   ├── GET /:id       # get status
│   └── PATCH /:id     # update (admin)
├── /events
│   ├── GET /          # list events
│   ├── GET /:id       # get event
│   ├── POST /         # create (admin)
│   ├── PATCH /:id     # update (admin)
│   └── POST /:id/register  # register
├── /guests
│   ├── GET /          # list my guests
│   ├── POST /         # sign in guest
│   └── GET /history   # guest history
├── /shop
│   ├── GET /products  # list products
│   ├── GET /products/:id
│   ├── POST /orders   # create order
│   └── GET /orders    # my orders
├── /announcements
│   ├── GET /          # list
│   └── POST /         # create (admin)
├── /documents
│   ├── GET /          # list
│   └── GET /:id       # download
├── /range-status
│   ├── GET /          # current status
│   └── PATCH /:range  # update (admin)
└── /admin
    ├── /reports/*
    └── /settings/*
```

---

## Environment Variables

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
FROM_EMAIL=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Sentry
SENTRY_DSN=

# AI
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Cloudflare
CF_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

---

## Cloudflare Bindings

```toml
# wrangler.toml

[[d1_databases]]
binding = "DB"
database_name = "austinrifleclub-db"

[[kv_namespaces]]
binding = "KV"
id = "xxx"

[[r2_buckets]]
binding = "R2"
bucket_name = "austinrifleclub-files"

[[queues.producers]]
binding = "QUEUE"
queue = "austinrifleclub-jobs"

[[queues.consumers]]
queue = "austinrifleclub-jobs"
```
