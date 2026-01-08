# Admin Dashboard

Administrative features for club officers and board members.

---

## Reports

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

---

## Membership Reports

### Summary Dashboard

- Total active members
- New members this month/year
- Expired members
- Pending applications
- Breakdown by membership type

### Membership by Type

| Type | Count | Revenue |
|------|-------|---------|
| Individual | X | $X |
| Family | X | $X |
| Life | X | $X |
| Senior | X | $X |
| Veteran | X | $X |

### Trends

- New members per month (chart)
- Retention rate
- Churn rate
- Average member tenure

---

## Financial Reports

### Revenue by Source

| Source | MTD | YTD |
|--------|-----|-----|
| Dues | $X | $X |
| Initiation fees | $X | $X |
| Shop sales | $X | $X |
| Event fees | $X | $X |
| Donations | $X | $X |
| Rentals | $X | $X |

### Payment Methods

- Credit card
- Debit card
- ACH (if enabled)
- Cash (manual entry)

### Refunds

- Total refunds issued
- Refunds by reason
- Pending refund requests

---

## Event Reports

### Attendance Summary

| Event Type | Events | Total Attendees | Avg Attendance |
|------------|--------|-----------------|----------------|
| Matches | X | X | X |
| Classes | X | X | X |
| Orientations | X | X | X |
| Work Days | X | X | X |

### Popular Events

- Highest attendance
- Highest waitlist
- Most frequent registrants

### No-Shows

- No-show rate by event type
- Members with frequent no-shows

---

## Admin Actions

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

---

## Application Management

### Application Queue

| Applicant | Status | Submitted | Next Step |
|-----------|--------|-----------|-----------|
| John Doe | Documents Pending | Jan 1 | Upload docs |
| Jane Smith | Safety Eval Scheduled | Jan 5 | Jan 15 eval |
| ... | ... | ... | ... |

### Application Actions

- View full application
- Download documents
- Approve/reject documents
- Schedule safety eval
- Log safety eval result
- Schedule orientation
- Mark orientation complete
- Issue badge number
- Approve membership
- Reject with reason
- Send message to applicant

---

## Member Management

### Member Search

- Search by name, email, badge number
- Filter by status, type, join date
- Bulk actions (export, email)

### Member Actions

- View profile
- Edit profile
- View payment history
- Add/remove family members
- Change membership type
- Issue credit
- Suspend membership
- Terminate membership
- Reset password
- Add notes
- View audit history

### Bulk Actions

- Export to CSV
- Send bulk email
- Update membership type
- Renew memberships

---

## Shop Management

### Product Management

- Add/edit products
- Manage variants (sizes, colors)
- Set inventory levels
- Upload photos
- Set pricing
- Enable/disable products

### Order Management

- View all orders
- Filter by status
- Mark orders as ready/shipped/complete
- Issue refunds
- Print packing slips
- Export orders

### Inventory Alerts

- Low stock warnings
- Out of stock items
- Reorder suggestions

---

## Content Management

### Announcements

- Create/edit announcements
- Schedule publish date
- Set expiration
- Pin to top
- Send via email/SMS

### Documents

- Upload documents
- Set access level (public, members, admin)
- Organize by category
- Track downloads

### Pages (CMS)

- Edit page content
- Upload images
- Preview changes
- Publish/unpublish

---

## System Settings

### General

- Club name, address, contact info
- Business hours
- Range hours (by day)
- Holiday closures

### Membership Settings

- Pricing by type
- Initiation fee
- Proration rules
- Grace period
- Auto-expire settings

### Notification Settings

- Email templates
- SMS settings
- Notification triggers
- Default preferences

### Payment Settings

- Stripe configuration
- Tax settings
- Refund policy
- Receipt template

---

## Audit Log

All admin actions are logged:

| Field | Description |
|-------|-------------|
| Timestamp | When action occurred |
| Admin | Who performed action |
| Action | What was done |
| Target | Who/what was affected |
| Details | Before/after values |
| IP Address | Where action originated |

### Audit Actions

- Member approved/rejected
- Membership changed
- Payment processed/refunded
- Role assigned/removed
- Event created/modified
- Announcement posted
- Settings changed
