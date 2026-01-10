# Features Specification

All user-facing features for the Austin Rifle Club website.

---

## Table of Contents

1. [Membership](#1-membership)
2. [Events & Calendar](#2-events--calendar)
3. [Guests](#3-guests)
4. [Shop](#4-shop)
5. [Ranges & Facilities](#5-ranges--facilities)
6. [Content & Communication](#6-content--communication)
7. [Community](#7-community)

---

# 1. Membership

Member lifecycle from application through life membership.

## 1.1 Member Stages

| Stage | Description |
|-------|-------------|
| Prospect | Submitted application, not yet approved |
| Member | Active, dues current |
| Family | Spouse/junior on primary's account |
| Life | 25+ years or qualified prepayment |
| Inactive | Dues expired, within 60-day grace |
| Terminated | Removed or lapsed beyond grace |

## 1.2 Application Process

| Step | What Happens | System Support |
|------|--------------|----------------|
| 1. Start | Enter name, email, create password | Account creation |
| 2. Form | Address, phone, emergency contact, referral source | Profile form |
| 3. Documents | Government ID, background check consent | File upload (10MB, JPG/PNG/PDF) |
| 4. Payment | $200 initiation fee | Stripe checkout |
| 5. Safety Eval | Pick date, attend in person | Calendar booking |
| 6. Orientation | Pick date, attend (~2 hours) | Calendar booking |
| 7. BOD Vote | 3/4 majority required | Vote recording |
| 8. Approved | Badge issued, full access | Auto-activation |

### Application Status Values

- `submitted` → `documents_pending` → `documents_received` → `payment_pending` → `payment_received`
- `safety_eval_scheduled` → `safety_eval_completed` → `orientation_scheduled` → `orientation_completed`
- `approved` or `rejected`

### Timeouts

| Milestone | Deadline |
|-----------|----------|
| Documents | 30 days from submission |
| Safety eval | 60 days from document approval |
| Orientation | 90 days from safety eval |
| Total | 180 days from submission |

Expired application: Must restart. Payment refunded minus $25 processing fee.

## 1.3 Member Types & Pricing

| Type | Initiation | Annual | Description |
|------|------------|--------|-------------|
| Individual | $200 | $150 | Single person |
| Family | $200 | $200 | Primary + spouse (both full members) + all juniors |
| Veteran | $200 | $125 | With DD-214 verification |
| Senior (65+) | $200 | $125 | With ID verification |
| Life | — | $0 or 50% | See Life Membership below |

### Family Add-Ons (Individual membership)

| Add-On | Annual | Notes |
|--------|--------|-------|
| Spouse | +$25 | Dependent on primary, no independent access |
| Junior | +$10 each | Under 21, dependent on primary |

### Proration

```
months_remaining = 12 - ((current_month - 4) % 12)
prorated_dues = max(annual_dues * months_remaining / 12, 25)
```

Initiation fee ($200) is never prorated.

## 1.4 Family Membership

### Primary vs Dependents

| Capability | Primary | Spouse (dependent) | Junior |
|------------|---------|-------------------|--------|
| Independent login | Yes | Yes (if email) | Yes (if email) |
| Range access alone | Yes | No | No |
| Sign in guests | Yes | No | No |
| Pay dues | Yes | No | No |
| Shop purchases | Yes | No | No |
| Event registration | Yes | Yes | Yes (parent approval) |
| Voting rights | Yes | No | No |

### Junior Aging Out

| Event | Action |
|-------|--------|
| 60 days before 21st birthday | Reminder email |
| On 21st birthday | Junior status ends |
| 30-day grace | Convert to Individual or lose access |
| Conversion | Initiation fee waived if continuous |

## 1.5 Life Membership

**Path 1: Time-based** — 25 years continuous membership

**Path 2: Prepayment** — 19 years continuous + 6 years prepaid

| Event | Breaks Continuity? |
|-------|-------------------|
| Renewed within 60 days | No |
| Lapsed 60+ days | Yes (counter resets) |
| Voluntary resignation | Yes |
| Expulsion | Yes |
| Military deployment (documented) | No (pauses) |

### Post-2011 Rule

| Joined | Life Member Dues |
|--------|------------------|
| Before Feb 1, 2011 | $0 |
| After Feb 1, 2011 | 50% of annual dues |

## 1.6 Dues & Renewals

**Fiscal Year: April 1 – March 31**

| When | Action |
|------|--------|
| 90 days before | Early renewal opens |
| 60 days before | First reminder email |
| 30 days before | Second reminder + dashboard banner |
| 7 days before | Urgent reminder (email + SMS) |
| Expiration | Access revoked at 11:59 PM CT |
| 30 days after | Late notice, final warning |
| 60 days after | Membership terminated |

### Reinstatement

| Days Overdue | Process |
|--------------|---------|
| 0-60 | Pay online, instant reactivation |
| 60+ | Must reapply as new member |

## 1.7 Member Dashboard

| Section | Features |
|---------|----------|
| Profile | Name, email, phone, address, emergency contact, photo |
| Membership | Status, type, badge number, expiration, renewal |
| Family | Add/remove dependents, view their status |
| History | Payments, events, matches, guests, volunteer hours |
| Documents | Download member card, access member-only docs |

## 1.8 Digital Member Card

| Field | Display |
|-------|---------|
| Member name | Full name |
| Badge number | Unique ID |
| Member type | Individual, Family, Life |
| Photo | If uploaded |
| Expiration | Date or "Life Member" |
| QR code | For verification |

### Wallet Pass Specification

#### Apple Wallet (.pkpass)

**Pass Type:** Generic pass (PKPassTypeGeneric)

**Visual Layout:**

```
┌─────────────────────────────────────────┐
│  [ARC LOGO]    AUSTIN RIFLE CLUB        │  ← Header (white on dark green)
├─────────────────────────────────────────┤
│                                         │
│  JOHN SMITH                             │  ← Primary field (large)
│  Badge #12345                           │  ← Secondary field
│                                         │
│  ┌─────────┐                            │
│  │ [PHOTO] │  Individual Member         │  ← Thumbnail + aux field
│  │         │  Valid through Mar 2026    │
│  └─────────┘                            │
│                                         │
├─────────────────────────────────────────┤
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              │  ← QR code
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              │
├─────────────────────────────────────────┤
│  Back fields:                           │
│  • Emergency Contact: Jane Smith        │
│  • Phone: 512-555-1234                  │
│  • Member Since: 2019                   │
│  • austinrifleclub.org                  │
└─────────────────────────────────────────┘
```

**Pass Fields:**

| Field | Location | Value |
|-------|----------|-------|
| `logoText` | Header | "AUSTIN RIFLE CLUB" |
| `primaryFields[0]` | Primary | Member full name |
| `secondaryFields[0]` | Secondary | "Badge #" + badge_number |
| `auxiliaryFields[0]` | Auxiliary | Membership type |
| `auxiliaryFields[1]` | Auxiliary | "Valid through " + expiration |
| `backFields[0]` | Back | Emergency contact |
| `backFields[1]` | Back | Phone |
| `backFields[2]` | Back | Member since year |

**Barcode:**

| Property | Value |
|----------|-------|
| Format | PKBarcodeFormatQR |
| Message | `{"member_id": "abc123", "badge": "12345", "exp": "2026-03-31"}` |
| Encoding | UTF-8, JSON |

**Colors:**

| Element | Color |
|---------|-------|
| Background | #1B4D3E (dark green) |
| Foreground | #FFFFFF (white) |
| Label | #CCCCCC (light gray) |

#### Google Wallet

**Object Type:** GenericObject

**Fields:** Same as Apple Wallet, mapped to Google Wallet schema

#### Update Triggers

| Event | Action |
|-------|--------|
| Membership renewed | Push update with new expiration |
| Membership expired | Update status, change visual (grayed out) |
| Profile photo changed | Push update with new image |
| Membership type changed | Push update |
| Membership terminated | Void/delete pass |

#### Expired Pass Visual

```
┌─────────────────────────────────────────┐
│  [ARC LOGO]    AUSTIN RIFLE CLUB        │
├─────────────────────────────────────────┤
│                                         │
│  JOHN SMITH                             │
│  Badge #12345                           │
│                                         │
│  ⚠️ EXPIRED                             │  ← Red warning
│  Expired Mar 31, 2025                   │
│                                         │
│  [Renew Membership]                     │  ← Link to renewal page
│                                         │
└─────────────────────────────────────────┘
```

#### Offline Verification

QR code contains signed JWT with:
- `member_id` (for lookup)
- `badge` (visual verification)
- `exp` (expiration timestamp)
- `sig` (HMAC signature)

Verifier app can validate signature offline, check expiration locally.

---

# 2. Events & Calendar

Matches, classes, orientations, work days, and all scheduled activities.

## 2.1 Event Types

| Type | Color | Visibility | Registration |
|------|-------|------------|--------------|
| Match | Blue | Public (most) | Required |
| Class | Green | Some public | Required |
| Orientation | Orange | Members only | Required |
| Safety Eval | Orange | Prospects only | Required |
| Work Day | Yellow | Members only | Optional |
| Board Meeting | Gray | BOD only | Invite |
| Membership Meeting | Gray | Members only | Optional |
| Private Event | Red | Invited only | By reservation |
| Range Closure | Black | Public | N/A |

## 2.2 Event Data

### Required Fields

| Field | Type | Notes |
|-------|------|-------|
| title | text | Max 100 chars |
| event_type | enum | See types above |
| start_time | datetime | Must be future |
| end_time | datetime | After start |

### Optional Fields

| Field | Type | Notes |
|-------|------|-------|
| description | rich text | Max 5000 chars |
| location | text | Range A-L, Education Bldg |
| max_participants | integer | 0 = unlimited |
| registration_deadline | datetime | Before start |
| cost | cents | 0 = free |
| required_certifications | array | Cert IDs |
| director_id | member | Match director, instructor |

## 2.3 Registration

### Capacity & Waitlist

| Scenario | Behavior |
|----------|----------|
| Under capacity | Instant registration |
| At capacity | Added to waitlist |
| Spot opens | First on waitlist notified (24hr to claim) |

### Cancellation & Refunds

| When | Refund |
|------|--------|
| 7+ days before | 100% |
| 2-6 days before | 50% |
| <2 days before | 0% |
| No-show | 0% |

## 2.4 Matches & Scoring

### Match Types

| Match | Scoring System |
|-------|----------------|
| USPSA | Time + points, hit factor |
| IDPA | Time + penalties |
| Steel Challenge | Time only |
| 3-Gun | Combined time |
| High Power | Points |

### Score Entry

**Manual:** Director enters scores per shooter

**Practiscore Import:** Automated import from Practiscore results

### Practiscore Integration

#### Import Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: Import Scores                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Import from Practiscore                                    │
│                                                             │
│  Practiscore Match ID: [_______________________]            │
│                                                             │
│  How to find this:                                          │
│  1. Go to practiscore.com                                   │
│  2. Find your match                                         │
│  3. Copy the ID from the URL (e.g., practiscore.com/        │
│     results/new/abc123 → ID is "abc123")                   │
│                                                             │
│                              [Fetch Results]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Match Members                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Found 28 shooters. Match to members:                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Practiscore Name    │ Member Match      │ Status    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ John Smith          │ John Smith #1234  │ ✓ Auto    │    │
│  │ Bob Johnson         │ Robert Johnson #  │ ✓ Auto    │    │
│  │ Mike W              │ [Select Member ▼] │ ⚠️ Manual │    │
│  │ Jane Doe            │ (Not a member)    │ ○ Skip    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  24 matched • 3 need review • 1 non-member                  │
│                                                             │
│                          [Cancel]  [Import 27 Results]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### API Details

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/v1/matches/{match_id}` | Practiscore API | Fetch match metadata |
| `GET /api/v1/matches/{match_id}/results` | Practiscore API | Fetch all shooter results |

#### Field Mapping

| Practiscore Field | ARC Field | Notes |
|-------------------|-----------|-------|
| `shooter_name` | Member lookup | Fuzzy match by name |
| `division` | `match_results.division` | Direct map |
| `class` | `match_results.classification` | D, C, B, A, M, GM |
| `place_overall` | `match_results.overall_place` | Integer |
| `place_division` | `match_results.division_place` | Integer |
| `total_time` | `match_results.total_time` | Decimal seconds |
| `hit_factor` | `match_results.total_points` | Calculated |
| `stage_scores[]` | `match_results.stage_results` | JSON array |

#### Member Matching Logic

```
1. Exact match on full name (case-insensitive)
2. Exact match on last name + first initial
3. Fuzzy match (Levenshtein distance ≤ 2)
4. If no match, prompt for manual selection
```

#### Non-Member Handling

| Option | Result |
|--------|--------|
| Skip | Not imported, noted in log |
| Create placeholder | Imported with `member_id = null`, marked as "guest shooter" |

### Member Statistics

| Stat | Calculation |
|------|-------------|
| Matches attended | Count |
| Win rate | Division wins / matches |
| Average finish | Percentile |
| Personal bests | Best score, best stage |

### Classification Tracking

- USPSA: D, C, B, A, M, GM
- IDPA: NV, MM, SS, EX, MA
- Displayed on profile (opt-in)

## 2.5 Classes & Training

| Category | Examples |
|----------|----------|
| Required | Safety Eval, Orientation |
| Safety | First Aid, RSO Certification |
| Skills | Beginner Pistol, Carbine 101 |
| Competition | USPSA Intro, IDPA Basics |

Prerequisites enforced at registration. Completion adds certification to profile.

## 2.6 Volunteer Tracking

### Logging Hours

| Field | Required |
|-------|----------|
| Date | Yes |
| Hours | Yes |
| Activity | Yes (dropdown) |
| Notes | No |

### Volunteer Credits

| Activity | Credit |
|----------|--------|
| 1 hour | $10 |
| Match director | $25/match |
| RSO full day | $25 |
| Major project | $50 (admin discretion) |

Credits usable for dues, shop, events. Expire March 31 (no rollover).

## 2.7 Calendar Features

| Feature | Description |
|---------|-------------|
| Views | Month, Week, List, Day |
| Filters | By type, range, registration status |
| Sync | iCal feed, .ics download, Google/Apple direct add |
| Reminders | 7 days (email), 1 day (email + SMS + push) |

---

# 3. Guests

How members sign in guests and track visits.

## 3.1 Guest Sign-In Process

1. Member taps "Sign In Guest" on phone
2. Enter guest name, email (optional), phone (optional)
3. Guest signs digital waiver on screen
4. Guest receives copy via email (if provided)
5. Entry logged with timestamp

## 3.2 Guest Rules

| Rule | Limit |
|------|-------|
| Max guests per visit | 3 |
| Same guest per year | 3 visits (then must join) |
| Guest must stay with member | Always |
| Waiver | Required every visit |
| Year definition | Calendar year (Jan-Dec) |

## 3.3 Waiver Requirements

| Rule | Requirement |
|------|-------------|
| Signature type | Drawn on screen (not typed) |
| Minimum strokes | Cannot be single line |
| Storage | Base64 image |
| Validity | Single visit only |

## 3.4 Visit Tracking

| Visit # | System Action |
|---------|---------------|
| 1st | Normal sign-in |
| 2nd | Suggest membership in waiver email |
| 3rd | Flag as "should join" |
| 4th+ | Blocked until member |

## 3.5 Member Features

- Save frequent guests for fast entry
- View all guests signed in
- See visit counts and which guests became members

## 3.6 Admin Features

- View all guest sign-ins, filter by date/host
- Flags: Exceeded visits, Should join, Banned
- Manual overrides: Reset visit count, ban/unban

---

# 4. Shop

Product sales, orders, and fulfillment.

## 4.1 Product Categories

| Category | Examples |
|----------|----------|
| Apparel | Hats, t-shirts, polos, jackets |
| Accessories | Patches, stickers, decals |
| Targets | Paper targets, target stands |
| Gear | Club-branded bags, ear pro |

## 4.2 Product Data

| Field | Type | Notes |
|-------|------|-------|
| name | text | 1-100 chars |
| category | enum | See above |
| member_price | cents | Max $100,000 |
| inventory_count | integer | 0-99999 |
| description | rich text | Max 2000 chars |
| images | files | Up to 10, JPG/PNG/WebP, 5MB max |
| sizes/variants | array | S, M, L, XL, colors |

## 4.3 Pricing & Access

| Buyer | Access |
|-------|--------|
| Visitor | Browse only |
| Expired member | Cannot purchase |
| Active member | Member price |
| Life member | Member price |

## 4.4 Checkout & Fulfillment

**Payment:** Stripe (credit/debit cards)

| Option | Description |
|--------|-------------|
| Pickup | Default, at range house |
| Shipping | Flat rate or calculated |

### Order States

```
Created → Paid → Ready → Completed
                  ↓
              Shipped → Completed
```

## 4.5 Inventory

- Alert admin when stock ≤ 5
- Show "low stock" when ≤ 10
- Show "out of stock" when 0
- Inventory restored on cancel/refund

---

# 5. Ranges & Facilities

Range status, reservations, and equipment rentals.

## 5.1 Range Inventory

| Range | Type | Distance |
|-------|------|----------|
| A, B | Pistol | 25 yards |
| C, D | Rifle | 100 yards |
| E, F | Rifle/Action | 200 yards |
| G | Multi-use | Variable |
| H | Steel/Action | 50 yards |
| I, J | Shotgun | Skeet/Trap/5-Stand |
| K | Long Range | 600 yards |
| L | Long Range | 1000 yards |

## 5.2 Range Status

| Status | Color | Meaning |
|--------|-------|---------|
| Open | Green | Available for use |
| Closed | Red | Not available |
| Reserved | Orange | Private event/match |
| Maintenance | Yellow | Work in progress |

**Features:** Real-time status on website, admin updates from phone, weather widget, sunrise/sunset.

## 5.3 Reservations

| Facility | Min Duration | Max Duration |
|----------|--------------|--------------|
| Range A-L | 1 hour | 8 hours |
| Education Building | 2 hours | Full day |
| Meeting Room | 1 hour | 4 hours |

### Pricing

| Facility | Rate |
|----------|------|
| Standard range | $25/hour |
| Long range (K, L) | $50/hour |
| Education Building | $100/half day |

### Workflow

1. Member submits request
2. Admin reviews (conflicts, capacity)
3. Approved → Added to calendar
4. Denied → Member notified with reason

## 5.4 Equipment Rentals

| Item | Daily Rate | Deposit |
|------|------------|---------|
| Shot timer | $5 | None |
| Steel targets | $20 | $50 |
| Target stands (set of 4) | $10 | None |

## 5.5 Locker Rentals

- Annual fee: $50
- First come, first served
- Member provides own lock
- No ammunition storage
- Subject to inspection with notice

## 5.6 Weather Display

| Metric | Source |
|--------|--------|
| Temperature | Weather API |
| Wind speed/direction | Weather API |
| Sunrise/sunset | Calculated |
| Heat index, UV index | Weather API |

---

# 6. Content & Communication

Public website, announcements, documents, and AI features.

## 6.1 Public Website Pages

| Page | Content |
|------|---------|
| Home | Welcome, quick links, next event, announcements |
| About | History, mission, board members, contact |
| Ranges | Interactive map, descriptions, photos |
| Calendar | All events, color-coded, filterable |
| Membership | Pricing, benefits, how to join, FAQ |
| Rules | Range rules, safety, guest policy |
| Shop | Browse products (login to buy) |
| Contact | Address, email, phone, map |

## 6.2 Announcements

| Type | Who Sees | Delivery |
|------|----------|----------|
| General | All members | Email + website |
| Safety Alert | All members | Email + SMS + website |
| Event Update | Event registrants | Email |
| Board Update | All members | Email + website |

## 6.3 Documents

### Public

- Range rules, safety guidelines, waiver template, membership application

### Members Only

- Club bylaws, meeting minutes, annual report, financial statements

## 6.4 AI Features

### 6.4.1 Member-Facing Chatbot

#### Capabilities

| Category | Examples |
|----------|----------|
| FAQs | "What are the range hours?", "Do you have an indoor range?" |
| Events | "When is the next USPSA match?", "How do I register for orientation?" |
| Membership | "How do I join?", "What does membership cost?", "How do I renew?" |
| Ranges | "Which range is for rifles?", "Can I shoot steel targets?" |
| Account | "How do I update my email?", "Where's my digital badge?" |
| Guests | "Can I bring a guest?", "What's the guest fee?" |
| Shop | "Where's my order?", "Do you have medium t-shirts?" |

#### Knowledge Base Sources

| Source | Update Frequency | Priority |
|--------|------------------|----------|
| Range rules & info | When changed | Highest |
| Bylaws & policies | When changed | Highest |
| FAQ database | Weekly | High |
| Event calendar | Real-time | High |
| Range status | Real-time | High |
| Shop inventory | Real-time | Medium |
| Announcements | When posted | Medium |
| Match results | After import | Low |

#### Conversation Flow

```
User: "When is the next USPSA match?"
    ↓
[Check event calendar for type=USPSA]
    ↓
Bot: "The next USPSA match is Saturday, January 18th at 9 AM.
     Registration opens January 11th. Would you like me to
     notify you when registration opens?"
    ↓
User: "Yes"
    ↓
Bot: "Done! I'll send you an email when registration opens.
     Anything else I can help with?"
```

#### Response Guidelines

| Guideline | Implementation |
|-----------|----------------|
| Tone | Friendly, professional, concise |
| Length | 1-3 sentences preferred, max 5 |
| Formatting | Use bullets for lists, bold for emphasis |
| Uncertainty | "I'm not sure about that. Let me connect you with a human." |
| Out of scope | "I can help with club questions. For [topic], please contact [resource]." |

#### Fallback Behavior

| Trigger | Action |
|---------|--------|
| Low confidence (< 70%) | Offer clarification: "Did you mean X or Y?" |
| No match found | "I don't have info on that. Would you like to ask a human?" |
| Repeated failures | Auto-escalate to human after 2 failed attempts |
| Sensitive topics | Immediate escalation (discipline, complaints, safety incidents) |
| Account-specific | Require login or escalate: "I'll need to connect you with staff for that." |

#### Human Handoff

```
Bot: "I'll connect you with a club administrator.
     Someone will respond within 24 hours (usually much faster).

     [Your message will be sent to staff]

     Is there anything you'd like to add?"
    ↓
User types additional context
    ↓
[Create support ticket with conversation history]
    ↓
Bot: "Got it! You'll receive an email when we respond.
     Ticket #12345 for your reference."
```

#### Rate Limits

| Limit | Value | Action |
|-------|-------|--------|
| Messages per minute | 10 | Slow down: "You're asking lots of questions! Give me a moment." |
| Messages per hour | 50 | Soft limit: "You've been busy! Can I summarize or connect you with a human?" |
| Messages per day | 200 | Hard limit: "Let's continue tomorrow, or contact us directly." |
| Conversation length | 50 messages | Suggest human: "This is getting complex. Want me to connect you with staff?" |

#### Context Awareness

| Context | Behavior |
|---------|----------|
| Logged-in member | Personalized: membership status, registered events, order history |
| Guest/visitor | General info only, prompt to join or log in |
| Pending applicant | Application status, next steps, orientation info |
| Time of day | "The range is currently [open/closed]" |
| Current events | "There's a match today on Range H-K, so those bays are closed" |

#### Sample Interactions

**Membership Inquiry (Visitor)**
```
User: "How do I join?"
Bot: "Joining Austin Rifle Club involves:

1. **Apply online** - Fill out application, upload ID, pay $200 fee
2. **Background check** - Takes 3-5 days
3. **Orientation** - 2-hour session at the range
4. **Approval** - Board votes at monthly meeting

Ready to apply? [Start Application] or ask me anything about the process!"
```

**Event Registration (Member)**
```
User: "Sign me up for the steel challenge"
Bot: "I found Steel Challenge on February 1st at 9 AM.

     Registration: $20 (you have member pricing)
     Divisions available: RFPO, RFRI, PCCO, ISR

     Which division? Or [View All Divisions]"

User: "RFPO"
Bot: "Got it! Registering you for Steel Challenge - RFPO.

     ✓ February 1st, 9 AM
     ✓ RFPO Division
     ✓ $20 via card on file

     [Confirm Registration] or [Cancel]"
```

**Range Question**
```
User: "Can I shoot 300 blackout on range A?"
Bot: "Range A (Pistol Range) allows:
     ✓ Pistol calibers
     ✓ .22 LR rifles
     ✗ Centerfire rifle calibers like .300 Blackout

     For .300 Blackout, use **Range C** (100/200 yard) or **Range L** (rifle/shotgun bay).

     Need directions to those ranges?"
```

#### Privacy & Data

| Data | Retention | Notes |
|------|-----------|-------|
| Conversation logs | 90 days | For support escalation, quality improvement |
| Personal data in chat | Not stored | Extracted to ticket if escalated, then deleted from log |
| Feedback ratings | Indefinite | Aggregated, anonymized |
| Training data | Anonymized | Personal info stripped before training |

### 6.4.2 Admin AI Assistance

#### Content Generation

| Task | Input | Output |
|------|-------|--------|
| Announcements | Bullet points + tone | Formatted announcement |
| Event descriptions | Event type + details | SEO-friendly description |
| Email drafts | Purpose + key points | Complete email |
| Social posts | Topic + platform | Platform-optimized post |

#### Document Q&A

| Capability | Examples |
|------------|----------|
| Bylaws lookup | "What's the quorum for a board meeting?" |
| Policy search | "What's the disciplinary process?" |
| Rule clarification | "Can members store firearms at the club?" |
| Precedent search | "Have we ever expelled someone for this?" |

#### Data Analysis

| Task | Output |
|------|--------|
| Application summaries | Key info, flags, recommendation |
| Attendance patterns | Trends, anomalies, predictions |
| Financial summaries | Revenue breakdown, comparisons |
| Member engagement | Activity scores, at-risk members |

#### Guardrails

| Rule | Enforcement |
|------|-------------|
| No voting decisions | AI advises, humans decide |
| No disciplinary action | AI summarizes, board acts |
| No financial transactions | AI reports, humans approve |
| Audit trail | All AI actions logged with human reviewer |

### 6.4.3 Chatbot Technical Implementation

#### Architecture

```
User Message
    ↓
[Rate Limiter] → Block if exceeded
    ↓
[Intent Classifier] → Categorize query
    ↓
[Context Builder] → Add user state, time, events
    ↓
[Knowledge Retrieval] → RAG from indexed sources
    ↓
[Response Generator] → LLM with guardrails
    ↓
[Safety Filter] → Block harmful/off-topic
    ↓
Response to User
```

#### Technology Options

| Option | Pros | Cons |
|--------|------|------|
| Cloudflare Workers AI | Integrated, fast, no API costs | Limited models |
| OpenAI API | Best quality, GPT-4 | API costs, latency |
| Anthropic Claude | High quality, safety-focused | API costs |
| Self-hosted (Ollama) | No API costs, privacy | Infrastructure, quality |

**Recommended**: Cloudflare Workers AI for simple queries, OpenAI fallback for complex.

#### Knowledge Indexing

```
Sources                    Vector Store
┌─────────────┐           ┌─────────────┐
│ Range rules │──embed──→ │             │
│ Bylaws      │──embed──→ │  Vectorize  │
│ FAQs        │──embed──→ │   (D1 or    │
│ Events      │──embed──→ │  external)  │
│ Announcements│──embed──→ │             │
└─────────────┘           └─────────────┘
                                 ↓
                          [Similarity Search]
                                 ↓
                          [Top 5 chunks to LLM]
```

#### Update Process

| Trigger | Action |
|---------|--------|
| Content edited | Re-embed affected chunks |
| Event added/changed | Update event index |
| Range status change | Invalidate status cache |
| Nightly | Full re-index, prune old data |

#### Metrics & Improvement

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Resolution rate | > 80% | Add FAQs, improve prompts |
| User satisfaction | > 4/5 | Analyze negative feedback |
| Escalation rate | < 20% | Expand knowledge base |
| Response time | < 2s | Optimize retrieval, caching |
| Fallback rate | < 10% | Improve intent classification |

#### Training & Quality

| Process | Frequency |
|---------|-----------|
| Review escalated conversations | Weekly |
| Update FAQ from common questions | Weekly |
| A/B test response variations | Monthly |
| Full prompt tuning | Quarterly |
| User satisfaction survey | Ongoing (post-conversation) |

## 6.5 Notification Preferences

| Category | Options |
|----------|---------|
| General announcements | Email, none |
| Safety alerts | Email + SMS (required) |
| Event reminders | Email, SMS, both, none |
| Dues reminders | Email + SMS (required) |
| Range closures | SMS, none |

### Quiet Hours

No SMS/push 10 PM - 7 AM Central (except safety alerts).

---

# 7. Community

Forums, classifieds, photos, mentorship, and engagement features.

## 7.1 Forums

### Categories

| Category | Description |
|----------|-------------|
| General | Club news, chitchat |
| Competition | Match discussion, tips |
| Gear | Reviews, recommendations |
| Reloading | Recipes, components |
| Training | Drills, coaching |

### Features

Post, reply, quote, upvote, subscribe, search, rich text, images, @mentions.

### Moderation

Report, edit (author/admin), delete (admin), warn, ban.

## 7.2 Classifieds

### Listing Types

| Type | Description |
|------|-------------|
| For Sale | Member selling item |
| Wanted | Member looking for item |
| Free | Giving away |

### Categories

Handguns, Rifles, Shotguns, Ammunition, Reloading, Optics, Accessories, Other

### Rules

- Members only (active)
- Must follow state/federal laws
- No prohibited items
- Club not a party to transactions
- 30-day expiration (renewable)

## 7.3 Photo Gallery

| Type | Created By |
|------|------------|
| Match photos | Match director |
| Range photos | Admin |
| Member uploads | Any member |

**Features:** Tag members, download originals, slideshow, photo of the month.

**Rules:** No offensive content, no photos without consent, max 10MB, JPG/PNG/HEIC.

## 7.4 Mentorship Program

1. New member opts in
2. Admin matches with experienced member (2+ years, 10+ matches, no violations)
3. Mentor reaches out
4. After 90 days, both provide feedback

**Recognition:** Profile badge, priority event registration.

## 7.5 Ride Share

For matches at other clubs. Members post offers/requests with departure location, time, seats available.

## 7.6 Gamification

### Badges

| Badge | Criteria |
|-------|----------|
| First Match | Complete first match |
| 10/50 Matches | Attend 10/50 matches |
| Division/Overall Winner | Win division or match |
| Volunteer/Super Volunteer | Log 10+/50+ hours |
| 5/10-Year Member | Continuous membership |
| Life Member | Achieve life status |
| Recruiter | Refer 5 members |

### Leaderboards (opt-in)

Match points, volunteer hours, referrals, visit streak, forum reputation.

## 7.7 Referral Program

| Milestone | Reward |
|-----------|--------|
| Referred member approved | $25 credit |
| Refer 5 members | Badge |
| Refer 10 in a year | Free renewal |

Unique referral link per member. Credits for shop or dues.

## 7.8 Donations & Sponsorships

### Individual

One-time, monthly, sponsor a junior, scholarship fund, range improvement.

### Corporate Tiers

| Tier | Annual | Benefits |
|------|--------|----------|
| Bronze | $500 | Logo on website |
| Silver | $1,000 | + event mentions |
| Gold | $2,500 | + banner at range |
| Platinum | $5,000 | + featured sponsor |

Automatic tax receipts. Non-profit: Texas Charter #52790.

## 7.9 Mobile PWA

- Install on home screen
- Works offline (member card, cached calendar/docs)
- Push notifications
- Quick guest sign-in
- Event check-in
- Range status

---

# 8. User Flows

Screen-by-screen flows for key features.

## 8.1 Membership Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: Start Application                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Join Austin Rifle Club                                     │
│                                                             │
│  Email:        [_______________________]                    │
│  Password:     [_______________________]                    │
│  Confirm:      [_______________________]                    │
│                                                             │
│  [Create Account & Start Application]                       │
│                                                             │
│  Already have an account? [Log in]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Personal Information                              │
├─────────────────────────────────────────────────────────────┤
│  Step 1 of 5: Your Information                              │
│  ████░░░░░░░░░░░░░░░░ 20%                                   │
│                                                             │
│  First Name:   [_____________]  Last Name: [_____________]  │
│  Phone:        [_____________]                              │
│  Date of Birth:[_____________]                              │
│                                                             │
│  Address:      [_______________________]                    │
│  City:         [_____________]  State: [TX]  Zip: [_____]   │
│                                                             │
│  Emergency Contact                                          │
│  Name:         [_____________]  Phone: [_____________]      │
│                                                             │
│  How did you hear about us? [_____________________ ▼]       │
│                                                             │
│                              [Back]  [Continue]             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 3: Membership Type                                   │
├─────────────────────────────────────────────────────────────┤
│  Step 2 of 5: Choose Membership                             │
│  ████████░░░░░░░░░░░░ 40%                                   │
│                                                             │
│  ○ Individual     $200 initiation + $150/year               │
│  ○ Family         $200 initiation + $200/year               │
│                   Includes spouse + all children under 21   │
│  ○ Veteran        $200 initiation + $125/year               │
│                   Requires DD-214                           │
│  ○ Senior (65+)   $200 initiation + $125/year               │
│                   Requires ID verification                  │
│                                                             │
│  Today's total: $275.00 (prorated for 9 months remaining)   │
│                                                             │
│                              [Back]  [Continue]             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 4: Documents                                         │
├─────────────────────────────────────────────────────────────┤
│  Step 3 of 5: Required Documents                            │
│  ████████████░░░░░░░░ 60%                                   │
│                                                             │
│  Government ID (driver's license, passport, or state ID)    │
│  ┌─────────────────────────────────────────┐                │
│  │  [Upload File]  or drag and drop        │                │
│  │  JPG, PNG, or PDF up to 10MB            │                │
│  └─────────────────────────────────────────┘                │
│  ✓ drivers_license.jpg uploaded                             │
│                                                             │
│  Background Check Consent Form                              │
│  ┌─────────────────────────────────────────┐                │
│  │  [Upload File]  or drag and drop        │                │
│  │  Download blank form: [PDF]             │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│                              [Back]  [Continue]             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 5: Payment                                           │
├─────────────────────────────────────────────────────────────┤
│  Step 4 of 5: Payment                                       │
│  ████████████████░░░░ 80%                                   │
│                                                             │
│  Individual Membership                                      │
│    Initiation fee             $200.00                       │
│    Annual dues (9 mo prorated) $112.50                      │
│    ─────────────────────────────────                        │
│    Total                      $312.50                       │
│                                                             │
│  Card Number:  [________________________]                   │
│  Expiry:       [MM/YY]     CVC: [___]                       │
│                                                             │
│  ☐ Save card for future renewals                            │
│                                                             │
│                              [Back]  [Pay $312.50]          │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 6: Schedule Orientation                              │
├─────────────────────────────────────────────────────────────┤
│  Step 5 of 5: Schedule Your Visits                          │
│  ████████████████████ 100%                                  │
│                                                             │
│  ✓ Payment received!                                        │
│                                                             │
│  1. Safety Evaluation (required before orientation)         │
│     Available dates:                                        │
│     ○ Sat, Jan 18 at 9:00 AM  (12 spots left)              │
│     ○ Sat, Jan 25 at 9:00 AM  (8 spots left)               │
│     ○ Sat, Feb 1 at 9:00 AM   (15 spots left)              │
│                                                             │
│  2. New Member Orientation (~2 hours)                       │
│     Available after safety eval:                            │
│     ○ Sat, Feb 8 at 9:00 AM                                │
│     ○ Sat, Feb 15 at 9:00 AM                               │
│                                                             │
│                              [Skip for now]  [Confirm]      │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 7: Confirmation                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ Application Submitted!                                   │
│                                                             │
│  What happens next:                                         │
│                                                             │
│  1. ✓ Documents uploaded                                    │
│  2. ✓ Payment received                                      │
│  3. ◯ Safety Evaluation - Sat, Jan 18 at 9:00 AM           │
│  4. ◯ Orientation - Sat, Feb 8 at 9:00 AM                  │
│  5. ◯ Board approval (next monthly meeting)                 │
│  6. ◯ Welcome to Austin Rifle Club!                         │
│                                                             │
│  We've sent a confirmation email to john@example.com        │
│                                                             │
│                    [Go to Dashboard]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8.2 Guest Sign-In Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: Member Dashboard (Quick Actions)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Welcome back, John!                     [🔔] [Profile]     │
│                                                             │
│  Quick Actions                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Sign In  │  │  Range   │  │  Events  │                  │
│  │  Guest   │  │  Status  │  │ Calendar │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Guest Information                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sign In a Guest                              [X Close]     │
│                                                             │
│  Guest Name:   [_______________________] (required)         │
│  Email:        [_______________________] (for waiver copy)  │
│  Phone:        [_______________________] (optional)         │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  Saved Guests (tap to autofill)                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Mike Johnson    mike@email.com    2 prior visits│        │
│  │ Sarah Williams  (no email)        1 prior visit │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
│                                        [Continue →]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 3: Waiver                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Guest Waiver                                 [X Close]     │
│                                                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │ RELEASE AND WAIVER OF LIABILITY                 │        │
│  │                                                 │        │
│  │ I, the undersigned, acknowledge that I am      │        │
│  │ voluntarily participating in shooting sports   │        │
│  │ activities at Austin Rifle Club...             │        │
│  │                                                 │ ▼       │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
│  Hand device to guest to sign below:                        │
│  ┌─────────────────────────────────────────────────┐        │
│  │                                                 │        │
│  │         [Sign here with finger]                 │        │
│  │                                                 │        │
│  └─────────────────────────────────────────────────┘        │
│                             [Clear]                         │
│                                                             │
│  ☐ I have read and agree to the waiver terms               │
│                                                             │
│                          [← Back]  [Complete Sign-In]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 4: Confirmation                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ✓ Guest Signed In                              │
│                                                             │
│  Mike Johnson is signed in for today.                       │
│  Visit #2 of 3 allowed per year.                            │
│                                                             │
│  ⚠️ Reminder: Guest must stay with you at all times.        │
│                                                             │
│  Waiver confirmation sent to mike@email.com                 │
│                                                             │
│       [Sign In Another Guest]    [Done]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8.3 Event Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: Event Details                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ← Back to Calendar                                         │
│                                                             │
│  USPSA Pistol Match                                         │
│  Saturday, January 25, 2025 • 8:00 AM - 1:00 PM            │
│  Range H-K (Action Bays)                                    │
│                                                             │
│  Registration: $25                    18/30 spots filled    │
│  ████████████░░░░░░░░                                       │
│                                                             │
│  Match Director: Bob Smith                                  │
│                                                             │
│  6 stages, approximately 150 rounds. Bring ear/eye         │
│  protection, belt, holster, and 4+ magazines.              │
│                                                             │
│  Divisions: Open, Limited, Carry Optics, Production        │
│                                                             │
│                              [Register - $25]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Registration Options                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USPSA Pistol Match - Register                              │
│                                                             │
│  Division:  [Production           ▼]                        │
│                                                             │
│  Classification (optional):                                 │
│  ○ Unclassified  ○ D  ○ C  ○ B  ○ A  ○ M  ○ GM            │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  Payment                                                    │
│                                                             │
│  Registration fee                    $25.00                 │
│                                                             │
│  ☐ Apply volunteer credits           -$25.00               │
│    Available balance: $75.00                                │
│                                                             │
│  Total due:                          $0.00                  │
│                                                             │
│                          [Cancel]  [Complete Registration]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 3: Confirmation                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ✓ You're Registered!                           │
│                                                             │
│  USPSA Pistol Match                                         │
│  Saturday, January 25, 2025 • 8:00 AM                       │
│  Division: Production                                       │
│                                                             │
│  [Add to Calendar ↓]                                        │
│   • Apple Calendar                                          │
│   • Google Calendar                                         │
│   • Download .ics                                           │
│                                                             │
│  Confirmation email sent to john@example.com                │
│                                                             │
│                    [View My Registrations]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8.4 Shop Checkout Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: Cart                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Your Cart (2 items)                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │ [IMG] ARC Logo Hat - Navy           $25.00     │        │
│  │       Size: One Size    Qty: [1 ▼]   [Remove]  │        │
│  ├─────────────────────────────────────────────────┤        │
│  │ [IMG] ARC T-Shirt - Gray            $20.00     │        │
│  │       Size: Large       Qty: [2 ▼]   [Remove]  │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
│                              Subtotal:  $65.00              │
│                                                             │
│  [Continue Shopping]              [Proceed to Checkout]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Checkout                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Checkout                                                   │
│                                                             │
│  Fulfillment:                                               │
│  ● Pickup at range house (free)                            │
│  ○ Ship to address (+$7.99)                                │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  Apply Credits:                                             │
│  ☐ Use volunteer credits (available: $50.00)               │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  Order Summary                                              │
│    Subtotal                          $65.00                 │
│    Shipping                          $0.00                  │
│    Tax                               $5.37                  │
│    ────────────────────────────────────────                 │
│    Total                             $70.37                 │
│                                                             │
│  Card Number:  [________________________]                   │
│  Expiry:       [MM/YY]     CVC: [___]                       │
│                                                             │
│                              [← Back]  [Place Order]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 3: Confirmation                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ✓ Order Placed!                                │
│                                                             │
│  Order #ARC-2025-0142                                       │
│                                                             │
│  We'll notify you when your order is ready for pickup       │
│  at the range house.                                        │
│                                                             │
│  Items:                                                     │
│    1x ARC Logo Hat - Navy                                   │
│    2x ARC T-Shirt - Gray (Large)                           │
│                                                             │
│  Total paid: $70.37                                         │
│                                                             │
│  Receipt sent to john@example.com                           │
│                                                             │
│                    [View Order Status]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8.5 Dues Renewal Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: Dashboard Banner (30 days before)                 │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Your membership expires on March 31, 2025.               │
│    [Renew Now - $150]                              [Dismiss]│
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Renewal Page                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Renew Your Membership                                      │
│                                                             │
│  Current: Individual Membership                             │
│  Expires: March 31, 2025                                    │
│  Member since: 2019 (6 years)                               │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  Renewal Options                                            │
│                                                             │
│  ● Renew as Individual            $150.00/year              │
│  ○ Upgrade to Family              $200.00/year              │
│    Add spouse and children under 21                         │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  Apply Credits                                              │
│  ☐ Use volunteer credits          -$75.00                  │
│    Available: $75.00                                        │
│                                                             │
│  Total due:                       $75.00                    │
│                                                             │
│  Card on file: Visa ****4242      [Change]                  │
│                                                             │
│                              [Renew for $75.00]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ Screen 3: Confirmation                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ✓ Membership Renewed!                          │
│                                                             │
│  Your membership is now valid through March 31, 2026.       │
│                                                             │
│  19 years until Life Member eligibility! 🎯                 │
│                                                             │
│  Receipt sent to john@example.com                           │
│                                                             │
│  Your digital member card has been updated.                 │
│  [Update Apple Wallet]  [Update Google Wallet]              │
│                                                             │
│                    [Return to Dashboard]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 9. Error States & Edge Cases

What happens when things go wrong.

## 9.1 Payment Errors

### Card Declined

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Payment Failed                                          │
│                                                             │
│  Your card was declined. This can happen if:               │
│  • Insufficient funds                                       │
│  • Card expired                                             │
│  • Incorrect card details                                   │
│  • Bank blocked the transaction                             │
│                                                             │
│  [Try Again]  [Use Different Card]                          │
└─────────────────────────────────────────────────────────────┘
```

| Stripe Error Code | User Message | Action |
|-------------------|--------------|--------|
| `card_declined` | "Your card was declined" | Retry or use different card |
| `insufficient_funds` | "Insufficient funds" | Retry or use different card |
| `expired_card` | "Card has expired" | Use different card |
| `incorrect_cvc` | "Incorrect security code" | Re-enter CVC |
| `processing_error` | "Processing error, please try again" | Retry after 30 seconds |

### Payment Processing Timeout

```
┌─────────────────────────────────────────────────────────────┐
│  ⏳ Payment Processing                                      │
│                                                             │
│  This is taking longer than expected.                       │
│  Please don't close this page.                              │
│                                                             │
│  If this persists, check your email for a receipt.          │
│  You will not be double-charged.                            │
│                                                             │
│  [Check Payment Status]                                     │
└─────────────────────────────────────────────────────────────┘
```

**System behavior:**
- Timeout after 30 seconds
- Check Stripe for payment status before allowing retry
- If payment succeeded but confirmation failed, show success and email receipt

## 9.2 File Upload Errors

| Error | User Message | System Action |
|-------|--------------|---------------|
| File too large | "File must be under 10MB. Your file is 15MB." | Block upload |
| Wrong file type | "Please upload a JPG, PNG, or PDF file." | Block upload |
| Upload failed | "Upload failed. Please try again." | Retry up to 3x |
| Virus detected | "This file cannot be uploaded." | Block, log for admin |
| File corrupted | "File appears to be corrupted. Please try a different file." | Block upload |

```
┌─────────────────────────────────────────────────────────────┐
│  Government ID                                              │
│  ┌─────────────────────────────────────────┐                │
│  │  ❌ Upload Failed                        │                │
│  │                                          │                │
│  │  File must be under 10MB.                │                │
│  │  Your file: 15.2MB                       │                │
│  │                                          │                │
│  │  Tips:                                   │                │
│  │  • Take a photo with lower resolution    │                │
│  │  • Use a PDF instead of image            │                │
│  │  • Compress the image first              │                │
│  │                                          │                │
│  │  [Try Again]                             │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## 9.3 Guest Sign-In Errors

### Guest at Visit Limit

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Guest Cannot Be Signed In                               │
│                                                             │
│  Mike Johnson has already visited 3 times this year         │
│  (Jan 5, Mar 12, Jun 8).                                    │
│                                                             │
│  Per club rules, guests are limited to 3 visits per         │
│  calendar year before they must apply for membership.       │
│                                                             │
│  [Send Membership Info to Guest]  [Cancel]                  │
└─────────────────────────────────────────────────────────────┘
```

### Guest is Banned

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Guest Cannot Be Signed In                               │
│                                                             │
│  This person is not permitted on club property.             │
│                                                             │
│  If you believe this is an error, please contact            │
│  the club administrator.                                    │
│                                                             │
│  [Contact Admin]  [Cancel]                                  │
└─────────────────────────────────────────────────────────────┘
```

### Too Many Guests

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Guest Limit Reached                                     │
│                                                             │
│  You've already signed in 3 guests today:                   │
│  • Mike Johnson                                             │
│  • Sarah Williams                                           │
│  • Tom Brown                                                │
│                                                             │
│  Members may bring up to 3 guests per visit.                │
│                                                             │
│  [OK]                                                       │
└─────────────────────────────────────────────────────────────┘
```

## 9.4 Event Registration Errors

### Event Full (Waitlist Available)

```
┌─────────────────────────────────────────────────────────────┐
│  Event Full                                                 │
│                                                             │
│  USPSA Pistol Match is at capacity (30/30).                │
│                                                             │
│  ○ Join waitlist (currently 3 people waiting)              │
│    You'll be notified if a spot opens.                      │
│                                                             │
│  [Join Waitlist]  [View Other Events]                       │
└─────────────────────────────────────────────────────────────┘
```

### Waitlist Spot Expired

```
┌─────────────────────────────────────────────────────────────┐
│  ⏱️ Spot No Longer Available                                │
│                                                             │
│  The spot you were offered has expired.                     │
│  (Offers are valid for 24 hours)                            │
│                                                             │
│  You've been moved back to the waitlist.                    │
│  Current position: #2                                       │
│                                                             │
│  [OK]                                                       │
└─────────────────────────────────────────────────────────────┘
```

### Missing Prerequisites

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Prerequisites Required                                  │
│                                                             │
│  RSO Certification Course requires:                         │
│                                                             │
│  ✓ Active membership                                        │
│  ✓ Safety Evaluation                                        │
│  ✗ Basic Firearms Safety (not completed)                   │
│                                                             │
│  [View Basic Firearms Safety]  [Cancel]                     │
└─────────────────────────────────────────────────────────────┘
```

## 9.5 Membership Errors

### Expired Membership Actions

| Action Attempted | Response |
|------------------|----------|
| Register for event | "Your membership has expired. [Renew Now]" |
| Sign in guest | "Your membership has expired. [Renew Now]" |
| Purchase from shop | "Your membership has expired. [Renew Now]" |
| Access member content | Redirect to renewal page |
| View dashboard | Allow, but show renewal banner |

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 Membership Expired                                      │
│                                                             │
│  Your membership expired on March 31, 2025.                 │
│                                                             │
│  To register for events, you'll need to renew.              │
│                                                             │
│  [Renew Now - $150]                                         │
│                                                             │
│  ⚠️ After April 30, you'll need to reapply as a new member. │
└─────────────────────────────────────────────────────────────┘
```

### Application Timeout

```
┌─────────────────────────────────────────────────────────────┐
│  ⏱️ Application Expired                                     │
│                                                             │
│  Your application has expired because the orientation       │
│  was not completed within 90 days.                          │
│                                                             │
│  Application submitted: October 1, 2024                     │
│  Expired: December 30, 2024                                 │
│                                                             │
│  A refund of $175.00 ($200 minus $25 processing fee)        │
│  has been issued to your card ending in 4242.               │
│                                                             │
│  [Start New Application]  [Contact Us]                      │
└─────────────────────────────────────────────────────────────┘
```

## 9.6 Shop Errors

### Item Out of Stock at Checkout

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Item No Longer Available                                │
│                                                             │
│  Sorry, the following item sold out while you were          │
│  shopping:                                                  │
│                                                             │
│  ✗ ARC T-Shirt - Gray (Large) - Qty 2                      │
│    Only 1 remaining in stock                                │
│                                                             │
│  [Update to 1]  [Remove Item]  [Continue Shopping]          │
└─────────────────────────────────────────────────────────────┘
```

### Order Pickup Expired

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Order Not Picked Up                                     │
│                                                             │
│  Order #ARC-2025-0142 was not picked up within 30 days.     │
│                                                             │
│  Items have been returned to inventory.                     │
│  A refund of $63.33 (90% of $70.37) has been issued.       │
│  10% restocking fee: $7.04                                  │
│                                                             │
│  [View Refund Details]  [Contact Us]                        │
└─────────────────────────────────────────────────────────────┘
```

## 9.7 Network & System Errors

### Offline Mode

```
┌─────────────────────────────────────────────────────────────┐
│  📶 You're Offline                                          │
│                                                             │
│  Some features are unavailable without internet:            │
│  • Event registration                                       │
│  • Shop purchases                                           │
│  • Guest sign-in                                            │
│                                                             │
│  Available offline:                                         │
│  ✓ Member card                                              │
│  ✓ Cached calendar                                          │
│  ✓ Downloaded documents                                     │
│                                                             │
│  [Retry Connection]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Server Error

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Something Went Wrong                                    │
│                                                             │
│  We're having trouble processing your request.              │
│  This has been reported to our team.                        │
│                                                             │
│  Error reference: ERR-2025-01-15-A3F2                       │
│                                                             │
│  [Try Again]  [Go Home]  [Contact Support]                  │
└─────────────────────────────────────────────────────────────┘
```

## 9.8 Form Validation Errors

### Inline Validation

| Field | Error | Display |
|-------|-------|---------|
| Email | Invalid format | "Please enter a valid email address" |
| Email | Already registered | "An account with this email already exists. [Log in]" |
| Phone | Invalid | "Please enter a valid 10-digit phone number" |
| Password | Too short | "Password must be at least 8 characters" |
| Password | Too common | "This password is too common. Please choose another." |
| Zip | Invalid | "Please enter a valid ZIP code" |
| Date | In past | "Please select a future date" |
| Required field | Empty | "This field is required" |

```
┌─────────────────────────────────────────────────────────────┐
│  Email:        [john@example]                               │
│                ❌ Please enter a valid email address        │
│                                                             │
│  Phone:        [512-555-123]                                │
│                ❌ Please enter a valid 10-digit phone       │
│                                                             │
│  Password:     [••••••]                                     │
│                ❌ Password must be at least 8 characters    │
└─────────────────────────────────────────────────────────────┘
```
