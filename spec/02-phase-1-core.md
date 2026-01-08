# Phase 1: Core Features (Must Have)

These features are required for launch and basic club operations.

---

## 1.1 Public Website

### Pages

| Page | Content |
|------|---------|
| Home | Welcome message, quick links, next upcoming event, announcements |
| About | Club history, mission, board members, contact info |
| Ranges | Interactive map, description of each range (A through L), photos |
| Calendar | All events, color-coded by type, filterable |
| Membership | Pricing, benefits, how to join, FAQ |
| Rules | Range rules, safety guidelines, guest policy |
| Shop | Browse products (can't buy without login) |
| Contact | Address, email, phone, map |

### Visitor Capabilities

- View all public pages
- Browse events and calendar
- Read announcements
- See membership pricing
- Browse shop (view only)
- Start membership application
- Use AI chatbot for questions

---

## 1.2 Membership Management

### Application Process

| Step | What Happens |
|------|--------------|
| 1. Start application | Enter name, email, create password |
| 2. Complete form | Address, phone, emergency contact, how did you hear about us |
| 3. Upload documents | Government ID, signed background check consent |
| 4. Pay initiation fee | $200 via Stripe |
| 5. Sign up for safety eval | Pick date from calendar |
| 6. Attend safety eval | In person, results logged by volunteer |
| 7. Sign up for orientation | Pick date from calendar |
| 8. Attend orientation | In person, ~2 hours, bring all documents |
| 9. Approved | Receive badge, full member access |

### Application Status (Prospect Can See)

- Submitted
- Documents Received
- Payment Received
- Safety Eval Scheduled / Completed
- Orientation Scheduled / Completed
- Approved / Badge Issued

### Member Dashboard

| Feature | Description |
|---------|-------------|
| Profile | Edit name, address, phone, emergency contact, photo |
| Membership status | Active/expired, renewal date, badge number |
| Family members | Add/remove spouse, kids, view their status |
| Dues payment | Pay online, see payment history |
| Guest history | See past guests signed in |
| Event registrations | Upcoming events, past events |
| Match history | Scores, rankings, personal bests |
| Certifications | List of completed courses, expiration dates |
| Volunteer hours | Log hours, see total |
| Orders | Shop order history |
| Documents | Download forms, waivers |
| Notification settings | Choose email/SMS preferences |

### Dues & Renewals

| Trigger | Action |
|---------|--------|
| 60 days before expiration | Email reminder |
| 30 days before expiration | Email + dashboard banner |
| 7 days before expiration | Email + SMS |
| Expired | Email, account marked inactive, range access revoked |
| 30 days overdue | Final notice |
| 60 days overdue | Membership terminated, must reapply |

### Pricing

| Type | Initiation | Yearly | Notes |
|------|------------|--------|-------|
| Individual | $200 | $150 | One person |
| + Spouse | — | +$25 | Shares primary member's account |
| + Junior | — | +$10 each | Child/grandchild under 21 |
| Family | $200 | $200 | Entire household included |
| Veteran | $200 | $125 | With DD-214 verification |
| Senior (65+) | $200 | $125 | With ID verification |
| Life Member | $2,000 | $0 | One-time payment |

---

## 1.3 Events & Calendar

### Event Types

| Type | Color | Public | Registration |
|------|-------|--------|--------------|
| Match | Blue | Yes (some) | Required |
| Class | Green | Some | Required |
| Orientation | Orange | No | Required |
| Work Day | Yellow | No | Optional |
| Board Meeting | Gray | No | Invite only |
| Private Event | Red | No | By reservation |
| Range Closure | Black | Yes | N/A |

### Event Fields

- Title
- Type
- Date/time (start, end)
- Location (which range)
- Description
- Max participants
- Registration deadline
- Cost (if any)
- Required certifications
- Match director / instructor
- Contact email

### Event Features

| Feature | Description |
|---------|-------------|
| Registration | Sign up online, pay if required |
| Waitlist | Auto-add when full, notify when spot opens |
| Reminders | Email 1 week before, email/SMS 1 day before |
| Check-in | Volunteer marks attendees as present |
| Cancellation | Cancel with refund before deadline |
| Calendar sync | Add to Google/Apple/Outlook calendar |
| Recurring events | Weekly, monthly, etc. |

---

## 1.4 Guest Management

### Guest Sign-In Process

1. Member taps "Sign In Guest" on phone
2. Enter guest name, email, phone
3. Guest signs digital waiver on screen
4. Guest receives copy via email
5. Entry logged with timestamp

### Guest Rules

| Rule | Limit |
|------|-------|
| Max guests per visit | 3 |
| Same guest per year | 3 visits (then must join) |
| Guest must stay with member | Always |
| Guest waiver | Required every visit |

### Guest Features

- Save frequent guests for quick sign-in
- View guest history
- Admin can see all guest logs
- Flag guests who should join

---

## 1.5 Shop

### Product Categories

| Category | Examples |
|----------|----------|
| Apparel | Hats, t-shirts, polos, jackets |
| Accessories | Patches, stickers, decals |
| Targets | Paper targets, target stands |
| Gear | Club-branded bags, ear pro |

### Product Fields

- Name
- Description
- Photos
- Category
- Sizes/variants
- Member price
- Non-member price
- Inventory count
- Active/inactive

### Pricing Tiers

| Buyer | Discount |
|-------|----------|
| Visitor | Cannot buy |
| Member | Member price |
| Life Member | Member price |
| Admin/Volunteer | Member price |

### Checkout

- Stripe payment
- Pickup at range (default)
- Shipping option (flat rate or calculated)
- Order confirmation email
- Admin notified of new orders

### Order Management (Admin)

- View all orders
- Mark as ready for pickup
- Mark as shipped (enter tracking)
- Mark as complete
- Issue refunds

---

## 1.6 Announcements & Communication

### Announcement Types

| Type | Who Sees | How Delivered |
|------|----------|---------------|
| General | All members | Email + website |
| Safety Alert | All members | Email + SMS + website |
| Event Update | Event registrants | Email |
| Board Update | All members | Email + website |
| Prospect Info | Prospects | Email |

### Announcement Fields

- Title
- Body (rich text)
- Type
- Publish date
- Expiration date
- Send email (yes/no)
- Send SMS (yes/no, safety only)
- Pin to top (yes/no)

### Member Notification Preferences

| Category | Options |
|----------|---------|
| General announcements | Email, none |
| Safety alerts | Email + SMS (required) |
| Event reminders | Email, SMS, both, none |
| Dues reminders | Email + SMS (required) |
| Newsletter | Email, none |

---

## 1.7 Range Status

### Status Board

| Range | Status | Notes |
|-------|--------|-------|
| A | Open | — |
| B | Closed | Maintenance until 3pm |
| C | Reserved | High Power Match 8am-2pm |
| ... | ... | ... |

### Features

- Real-time status on website
- Admin can update from phone
- Closure alerts via SMS (opt-in)
- Weather widget (temp, wind, conditions)
- Sunrise/sunset times

---

## 1.8 AI Features

### Chatbot

| Capability | Examples |
|------------|----------|
| Answer FAQs | "What are the range hours?" |
| Event info | "When is the next USPSA match?" |
| Membership help | "How do I join?" |
| Range info | "Which range is for rifles?" |
| Contact routing | "I need to talk to someone about X" |
| Guest policy | "Can I bring a friend?" |

### Smart Search

- Natural language queries
- "Show me all pistol matches in March"
- "What classes are available for beginners?"
- "Who is the match director for 3-gun?"

### Admin Assistance

- Draft announcements from bullet points
- Suggest event descriptions
- Summarize long documents
- Answer admin questions about policies

---

## 1.9 Documents

### Member Documents

| Document | Access |
|----------|--------|
| Range rules | Public |
| Safety guidelines | Public |
| Club bylaws | Members only |
| Meeting minutes | Members only |
| Annual report | Members only |
| Waiver template | Public |
| Background check form | Prospects |

### Forms (Online Submission)

- Membership application
- Guest waiver (digital signature)
- Incident report
- Volunteer hours log
- Equipment rental request
- Range reservation request
