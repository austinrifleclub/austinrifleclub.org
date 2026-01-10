# Administration & Governance

Admin dashboard, notifications, bylaws compliance, and operational procedures.

---

## Table of Contents

1. [Admin Dashboard](#1-admin-dashboard)
2. [Notifications System](#2-notifications-system)
3. [Governance & Bylaws](#3-governance--bylaws)
4. [Operations Runbook](#4-operations-runbook)

---

# 1. Admin Dashboard

Administrative features for club officers and board members.

## 1.1 Reports

| Report | Description |
|--------|-------------|
| Membership summary | Total active, new, expired, by type |
| Revenue | Dues, shop, donations, by month |
| Event attendance | By event, by month, trends |
| Volunteer hours | Total, by member, by activity |
| Shop sales | By product, by month |
| Guest visits | Total, frequent guests |
| Range usage | Visits by day/time |
| Certifications | Expiring soon |

### Membership Reports

- Total active members
- New members this month/year
- Breakdown by membership type
- Retention/churn rates
- Average member tenure

### Financial Reports

| Source | MTD | YTD |
|--------|-----|-----|
| Dues | $X | $X |
| Initiation fees | $X | $X |
| Shop sales | $X | $X |
| Event fees | $X | $X |
| Donations | $X | $X |
| Rentals | $X | $X |

### Event Reports

- Attendance by event type
- Popular events (highest attendance/waitlist)
- No-show rates

## 1.2 Admin Actions

| Action | Who Can Do It |
|--------|---------------|
| Approve applications | Admin |
| Issue refunds | Admin |
| Ban member | Admin (with board approval) |
| Create events | Admin, Match Director |
| Post announcements | Admin |
| Manage shop | Admin |
| Update range status | Admin, RSO |
| Enter match scores | Match Director, Volunteer |
| Assign roles | Admin |
| View audit log | Admin |

## 1.3 Application Management

### Queue

| Applicant | Status | Submitted | Next Step |
|-----------|--------|-----------|-----------|
| John Doe | Documents Pending | Jan 1 | Upload docs |
| Jane Smith | Safety Eval Scheduled | Jan 5 | Jan 15 eval |

### Actions

- View full application
- Download/approve/reject documents
- Schedule safety eval, log result
- Schedule orientation, mark complete
- Issue badge number
- Record BOD vote (3/4 majority required)
- Approve or reject with reason

## 1.4 Member Management

### Search & Filter

- Search by name, email, badge number
- Filter by status, type, join date
- Bulk actions (export, email)

### Member Actions

- View/edit profile
- View payment history
- Add/remove family members
- Change membership type
- Issue credit
- Suspend/terminate membership
- Reset password, add notes
- View audit history

## 1.5 Shop Management

- Add/edit products, variants, pricing
- Manage inventory levels
- View/filter orders by status
- Mark orders ready/shipped/complete
- Issue refunds
- Low stock alerts

## 1.6 Content Management

- Create/schedule announcements
- Upload documents (set access level)
- Edit CMS pages
- Track downloads

## 1.7 System Settings

| Category | Settings |
|----------|----------|
| General | Club name, address, hours, holidays |
| Membership | Pricing, initiation fee, proration, grace period |
| Notifications | Email templates, SMS settings, triggers |
| Payment | Stripe config, tax, refund policy |

## 1.8 Audit Log

All admin actions logged with:
- Timestamp
- Admin who performed action
- What was done
- Who/what affected
- Before/after values
- IP address

---

# 2. Notifications System

Comprehensive notification system for member communication.

## 2.1 Channels

| Channel | Use Cases |
|---------|-----------|
| Email | All notifications |
| SMS | Urgent/time-sensitive |
| Push | Mobile app users |
| In-app | Dashboard banners |

## 2.2 Notification Matrix

| Event | Email | SMS | Push |
|-------|-------|-----|------|
| Application status | ✓ | — | — |
| Dues reminder (60/30 days) | ✓ | — | — |
| Dues reminder (7 days) | ✓ | ✓ | — |
| Dues expired | ✓ | ✓ | — |
| Event registration | ✓ | — | — |
| Event reminder (1 week) | ✓ | — | — |
| Event reminder (1 day) | ✓ | ✓ (opt-in) | ✓ |
| Event cancelled | ✓ | ✓ | ✓ |
| Range closure | ✓ | ✓ | ✓ |
| Safety alert | ✓ | ✓ | ✓ |
| Order confirmation | ✓ | — | — |
| Order ready for pickup | ✓ | ✓ | ✓ |
| Waitlist spot opened | ✓ | ✓ | ✓ |

## 2.3 Member Preferences

### Required (Cannot Opt Out)

- Safety alerts (email + SMS)
- Dues reminders at 7 days (email + SMS)
- Account security (email)
- Order confirmations (email)

### Configurable

| Category | Options |
|----------|---------|
| General announcements | Email, none |
| Event reminders | Email, SMS, both, none |
| Range status | Email, SMS, both, none |
| Newsletter | Email, none |
| Match results | Email, none |

## 2.4 Email Templates

### Transactional

Welcome, email verification, password reset, application received/approved/rejected, dues receipt, event registration, order confirmation, shipping notification.

### Reminders

Dues reminder (60/30/7 days, expired), event reminder (1 week/1 day), certification expiring (30/60/90 days).

## 2.5 SMS Templates

Short and actionable:

```
ARC: Your membership expires in 7 days. Renew at austinrifleclub.com/renew
```

```
ARC: Range C closed today for maintenance. Check status: austinrifleclub.com/status
```

```
ARC SAFETY ALERT: [message]. Details: austinrifleclub.com/alerts
```

## 2.6 Push & In-App

### Push Notifications

- Request permission on first login
- Respect quiet hours (10pm-7am)
- Actions: Opens relevant screen

### Dashboard Banners

| Type | Style | Dismissible |
|------|-------|-------------|
| Dues expiring | Yellow warning | No |
| Dues expired | Red alert | No |
| Action required | Blue info | Yes |
| Success | Green | Yes |

### Notification Center

Bell icon with unread count, list of recent notifications, mark as read.

## 2.7 Delivery & Tracking

### Processing

- Queue for batch processing
- Send immediately for urgent (safety alerts)
- Respect rate limits
- Retry failed sends
- Log all attempts

### Metrics

- Sent, delivered, opened, clicked, bounced, failed counts
- Delivery/open/click rates by template
- Unsubscribe rates

---

# 3. Governance & Bylaws

Official governance structure and bylaws-driven requirements.

## 3.1 Club Information

| Field | Value |
|-------|-------|
| Legal Name | Austin Rifle Club, Inc. |
| Incorporated | December 8, 1928 |
| Charter # | 52790 |
| Type | Texas Non-Profit Corporation |
| Fiscal Year | April 1 – March 31 |
| Location | 16312 Littig Rd, Manor, TX 78653 |

### Official Purpose (from Charter)

> "To educate the youth of our Country in the art of rifle shooting in times of peace so that in the event of a National Emergency they may be qualified to act as instructors of the armed forces of our Country; and, to teach safe handling of firearms and to promote the skill of United States participants in shooting sports."

## 3.2 Board of Directors (10 Positions)

> **Current Board (Jan 2026):** See member area → Board Members for contact info

| Position | Email Alias | Primary Responsibilities |
|----------|-------------|-------------------------|
| President | president@ | Executive authority, final approval |
| Vice President | vp@ | Backup to President |
| Secretary | secretary@ | Minutes, notices, records |
| Treasurer | treasurer@ | Finances, dues, reporting |
| Dir. of Range Safety | safety@ | Safety rules, RSO program, incidents |
| Dir. of Facilities | facilities@ | Range maintenance, work days (de facto: Dir. Range Maintenance) |
| Dir. of Membership | membership@ | Applications, renewals, badges |
| Dir. of Business Operations | operations@ | Shop, sponsors, contracts |
| Dir. of Technology | admin@ | Website, systems, badges (de facto: Dir. Range Construction) |
| Dir. of Education | education@ | Classes, certifications, orientation, loaner firearms |

### Election Schedule

- **Even years:** President, Treasurer, Dir. Range Safety, Dir. Membership, Dir. Business Operations
- **Odd years:** Vice President, Secretary, Dir. Facilities, Dir. Education, Dir. Technology

### Eligibility

- 36 months continuous membership
- No two family members on BOD at same time
- No compensation (expense reimbursement allowed)

### Website Admin Roles

| BOD Position | Website Permissions |
|--------------|---------------------|
| President | Full admin |
| Vice President | Full admin (backup) |
| Secretary | Minutes, announcements, directory |
| Treasurer | Financial reports, dues, shop, refunds |
| Dir. Range Safety | Range status, incidents, RSO management |
| Dir. Site Construction | Projects, reservations, facility calendar |
| Dir. Education | Classes, certifications, orientation |
| Dir. Memberships | Applications, renewals, profiles, guests |
| Dir. Business Operations | Shop, sponsors, event fees |
| Dir. Maintenance | Work days, maintenance logs, equipment |

## 3.3 Application & Approval

| Step | System Support |
|------|----------------|
| Prospect submits | Online form |
| Documents uploaded | ID, background consent |
| Payment received | Stripe |
| Safety eval completed | Scheduled, logged |
| Orientation completed | Attendance tracked |
| **BOD reviews** | Presented at meeting |
| **BOD votes** | **3/4 majority required** |
| Approved → badge issued | Auto-notification |

**Cannot auto-approve—BOD vote required.**

## 3.4 Member Discipline

| Step | Requirement |
|------|-------------|
| Written charges filed | Admin creates case |
| Member notified | **Certified mail** |
| **7 days minimum** before hearing | System enforces |
| Member may present defense | Upload statement or attend |
| **Executive Session** | Unless member requests public |
| BOD votes | **2/3 of full BOD** to expel |
| Member may appeal | Heard at membership meeting, **2/3 vote** to restore |

### Status Values

Active → Under Review → Suspended → Expelled (or Appeal Pending → Restored)

## 3.5 Dues Changes

1. BOD proposes change
2. Published **30 days before** Annual Meeting
3. Ratified by **majority vote** at Annual Meeting
4. Effective **April 1st**

## 3.6 Meetings

| Type | Called By | Notice |
|------|-----------|--------|
| Annual Meeting | BOD | Set by BOD |
| BOD Meeting | President or 3 Directors | Per schedule |
| Special Meeting | President, 3 Directors, OR **2.5% of members** petition | 30 days after petition |

**Quorum**: Members present = quorum (no minimum).

**Electronic voting**: Allowed with positive user ID authentication.

## 3.7 Expenditure Approval

| Amount | Approval |
|--------|----------|
| Under $25,000 | BOD approval |
| $25,000–$50,000 | Majority at membership meeting (25 days notice) |
| Over $50,000 | 2/3 vote (same as bylaw amendment) |

## 3.8 Bylaw Amendments

**Proposed by**: 2/3 of directors OR 10% of voting members petition

1. Proposal submitted
2. Published **20 days before** vote (email or USPS)
3. Vote held
4. **2/3 of voting members** to ratify

## 3.9 Elections

- Even years: President, Treasurer, Dir. Range Safety, Dir. Memberships, Dir. Business Operations
- Odd years: Vice President, Secretary, Dir. Site Construction, Dir. Education, Dir. Maintenance

### System Requirements

| Feature | Description |
|---------|-------------|
| Eligibility check | Verify 36 months continuous |
| Family check | Prevent two family members on BOD |
| Nomination form | Online with bio and statement |
| Online voting | Authenticated, one vote per member |
| Term tracking | Which positions up each year |

## 3.10 5-Year Operations Plan

Required by bylaws. Track projects with: name, description, timeline, budget, funding source, status, BOD sponsor.

## 3.11 Document Retention

| Document | Retention | Access |
|----------|-----------|--------|
| Bylaws | Permanent | Public (current), Members (historical) |
| Meeting minutes | Permanent | Members (exec session: BOD only) |
| Financial records | 7 years | Treasurer + President |
| Membership applications | Duration + 3 years | Dir. Memberships |
| Incident reports | 7 years | Dir. Range Safety + President |

---

# 4. Operations Runbook

Step-by-step procedures for volunteer board members.

## 4.1 Member Management

### Look Up a Member

1. Go to **Admin → Members**
2. Search by name, email, or badge number
3. Click member name to view profile

### Update Member Information

1. Look up member
2. Click **Edit Profile**
3. Update fields, click **Save**
4. System logs the change automatically

### Add Family Member

1. Look up primary member
2. Click **Family Members** tab → **Add Family Member**
3. Enter: Name, relationship, email, date of birth
4. Select type: Spouse ($25/yr) or Junior ($10/yr, under 21)
5. System calculates prorated amount if mid-year

### Convert to Life Member

**Requirements**: 25 years continuous OR 19 years + 6 years prepaid

1. Verify membership start date
2. Click **Change Membership Type** → **Life Member**
3. If post-2011, set dues to 50% or request exemption
4. Add note, save

### Terminate Membership

**Requirements**: 2/3 BOD vote for expulsion, follow discipline process

1. Click **Terminate Membership**
2. Select reason: Voluntary, Non-payment, Expelled, Deceased
3. Confirm—system revokes access immediately

## 4.2 Applications

### Review Pending Applications

1. **Admin → Applications** → Filter: **Pending Review**
2. Check documents (ID readable, consent signed)
3. Mark **Documents Verified** or **Request New Documents**

### Log Safety Eval/Orientation

1. Open application → **Safety Eval** or **Orientation** tab
2. Enter date, evaluator/instructor, result
3. Save

### Record BOD Vote

**Requirement**: 3/4 majority to approve

1. Open application → **Record Vote**
2. Enter meeting date, votes for/against/abstain
3. If approved: Assign badge number, member gets welcome email
4. If denied: Enter reason, applicant notified

## 4.3 Dues & Payments

### Process Manual Payment

1. Look up member → **Payments** → **Record Manual Payment**
2. Enter amount, method (check/cash), check number
3. System extends expiration date

### Issue Refund

1. **Admin → Payments** → Find payment → **Refund**
2. Enter amount (full or partial) and reason
3. Stripe refunds processed automatically

### Handle Overdue Member

- 30 days overdue: Final notice sent automatically
- 60 days overdue: **Grant extension** or **Terminate**

## 4.4 Events

### Create New Event

1. **Admin → Events → Create Event**
2. Fill in: Title, type, date/time, location, description, capacity, cost, director
3. Set visibility (Public/Members Only)
4. **Save as Draft** or **Publish**

### Cancel Event

1. Open event → **Cancel Event**
2. Enter reason
3. Choose: Notify registrants, auto-refund
4. Event marked cancelled (not deleted)

### Check In Attendees

1. Open event → **Check-In** tab
2. Click **Check In** for each attendee (or scan QR)
3. No-shows marked automatically after event

### Enter Match Scores

**Manual**: Open match → **Scores** → Add results per shooter → **Publish**

**Practiscore Import**: **Scores** → **Import from Practiscore** → Enter match ID → Review → Import

## 4.5 Shop Orders

### Fulfill Pickup Order

1. **Admin → Shop → Orders** → Filter: **Paid**
2. Gather items → **Mark Ready for Pickup**
3. When picked up → **Complete Order**

### Ship Order

1. Open order → Pack and ship
2. **Mark Shipped** → Enter tracking number
3. Auto-completes when delivered

## 4.6 Announcements

1. **Admin → Announcements → New Announcement**
2. Fill in: Title, body, type, publish/expiration date
3. Delivery options: Website, email, SMS (safety only), pin to top
4. **Publish** or **Schedule**

## 4.7 Range Status

1. **Admin → Range Status**
2. Select range (A–L)
3. Set status: Open, Closed, Reserved, Maintenance
4. Add notes
5. Option to send SMS for closures

## 4.8 Elections

### Set Up Annual Election

1. **Admin → Elections → Create Election**
2. System auto-populates positions (even/odd year)
3. Set dates: Nominations open/close, voting open/close

### Verify Candidate Eligibility

- System shows membership duration
- Flags family member conflicts
- Mark **Eligible** or **Ineligible**

### Publish Results

1. After voting closes → **Results** tab
2. Review vote counts → **Certify Results**
3. Winners announced, board records updated

## 4.9 Discipline

### File Charges

1. **Admin → Discipline → File Charges**
2. Select member, enter written charges, attach evidence
3. Case assigned to President

### Process

1. **Send Notice** → Print, send certified mail, enter tracking
2. System calculates earliest hearing date (7+ days)
3. **Schedule Hearing** → Member can upload statement
4. **Record Decision** → Enter votes, decision
5. If expelled → Member terminated automatically

## 4.10 Board Transitions

### Transfer Admin Access

1. **Admin → Users**
2. Remove outgoing member's role
3. Assign incoming member's role
4. Log change with effective date

### Handoff Checklist

- [ ] Admin system access granted
- [ ] Walkthrough of relevant functions
- [ ] List of ongoing issues/projects
- [ ] Key contacts (vendors, volunteers)
- [ ] Upcoming deadlines

## 4.11 Emergency Procedures

### Website Down

1. Check status.cloudflare.com
2. If our issue: contact tech support
3. Use backup email list for urgent communication

### Payment System Down

1. Check status.stripe.com
2. Accept checks at range, log manual payments later
3. Don't turn away members for "unpaid" status

### Data Breach Suspected

1. Notify President immediately
2. Don't delete or modify anything
3. Reset all admin passwords if confirmed
4. Notify affected members within 72 hours

### Safety Incident

1. Ensure scene is safe, provide first aid
2. Call 911 if emergency
3. File incident report: **Admin → Incidents → New Incident**
4. Notify Dir. Range Safety → President

## 4.12 Vendor Management

| Vendor | Purpose | Account Owner |
|--------|---------|---------------|
| Cloudflare | Hosting | [Name] |
| Stripe | Payments | Treasurer |
| Resend | Email | [Name] |
| Twilio | SMS | [Name] |
| Domain | Domain | [Name] |

### Costs (Estimated Monthly)

| Service | Cost |
|---------|------|
| Cloudflare | $5–25 |
| Stripe | 2.9% + $0.30/txn |
| Resend | $0–20 |
| Twilio | $0.0079/SMS |
| Domain | ~$15/year |
