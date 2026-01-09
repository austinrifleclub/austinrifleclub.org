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

**Wallet Integration:** Apple Wallet (.pkpass), Google Wallet. Auto-updates on renewal, works offline.

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
**Practiscore Import:** Enter match ID, system matches names to members

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

### Chatbot

| Capability | Examples |
|------------|----------|
| Answer FAQs | "What are the range hours?" |
| Event info | "When is the next USPSA match?" |
| Membership help | "How do I join?" |
| Range info | "Which range is for rifles?" |

### Admin AI Assistance

- Draft announcements from bullet points
- Generate event descriptions
- Summarize documents
- Answer policy questions

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
