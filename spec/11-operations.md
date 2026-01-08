# Operations Runbook

Step-by-step procedures for common administrative tasks. Written for volunteer board members who may not be technical.

---

## Table of Contents

1. [Member Management](#member-management)
2. [Applications](#applications)
3. [Dues & Payments](#dues--payments)
4. [Events](#events)
5. [Shop Orders](#shop-orders)
6. [Announcements](#announcements)
7. [Range Status](#range-status)
8. [Elections](#elections)
9. [Discipline](#discipline)
10. [Board Transitions](#board-transitions)
11. [Emergency Procedures](#emergency-procedures)
12. [Vendor Management](#vendor-management)

---

## Member Management

### Look Up a Member

1. Go to **Admin → Members**
2. Search by name, email, or badge number
3. Click member name to view profile

### Update Member Information

**Who can do this**: Dir. Memberships, Secretary, Admin

1. Look up member (see above)
2. Click **Edit Profile**
3. Update fields as needed
4. Click **Save**
5. System logs the change automatically

### Add Family Member

**Who can do this**: Dir. Memberships, or member themselves

1. Look up primary member
2. Click **Family Members** tab
3. Click **Add Family Member**
4. Enter: Name, relationship, email (optional), date of birth
5. Select type: Spouse ($25/yr) or Junior ($10/yr, under 21)
6. Click **Add**
7. If adding mid-year, system calculates prorated amount

### Convert to Life Member

**Who can do this**: Dir. Memberships

**Requirements**: 25 years continuous membership OR 19 years + 6 years prepaid

1. Look up member
2. Verify membership start date (must be 25+ years ago)
3. Click **Change Membership Type**
4. Select **Life Member**
5. If post-2011 join date, set dues to 50% or request exemption
6. Add note explaining conversion
7. Click **Save**
8. Member receives notification email

### Terminate Membership

**Who can do this**: Admin only (after BOD vote)

**Requirements**: 2/3 BOD vote, follow discipline process if involuntary

1. Ensure discipline process completed (if applicable)
2. Look up member
3. Click **Terminate Membership**
4. Select reason: Voluntary, Non-payment (60+ days), Expelled, Deceased
5. Enter notes
6. Click **Confirm Termination**
7. System revokes access immediately
8. Badge number retained in records

---

## Applications

### Review Pending Applications

**Who can do this**: Dir. Memberships

1. Go to **Admin → Applications**
2. Filter by status: **Pending Review**
3. Applications are sorted by submission date

### Check Application Documents

1. Open application
2. Click **Documents** tab
3. Verify:
   - Government ID is readable and matches name
   - Background check consent is signed
4. If documents OK, click **Mark Documents Verified**
5. If documents need resubmission, click **Request New Documents** and enter reason

### Log Safety Evaluation Result

**Who can do this**: Dir. Range Safety, RSO volunteers

1. Open application
2. Click **Safety Eval** tab
3. Enter:
   - Date completed
   - Evaluator name
   - Result: Pass / Fail
   - Notes (required if fail)
4. Click **Save**
5. If passed, applicant can now schedule orientation

### Log Orientation Completion

**Who can do this**: Dir. Education, Orientation instructors

1. Open application
2. Click **Orientation** tab
3. Enter:
   - Date completed
   - Instructor name
4. Click **Mark Complete**
5. Application now ready for BOD vote

### Present Applications at BOD Meeting

**Who can do this**: Dir. Memberships

1. Go to **Admin → Applications**
2. Filter by status: **Ready for Vote**
3. Click **Generate BOD Report**
4. Print or share report for meeting
5. At meeting, present each applicant

### Record BOD Vote on Application

**Who can do this**: Dir. Memberships, Secretary

**Requirement**: 3/4 majority of BOD to approve

1. Open application
2. Click **Record Vote**
3. Enter:
   - Meeting date
   - Votes For / Against / Abstain
4. System calculates if 3/4 threshold met
5. If approved:
   - Click **Approve Application**
   - Assign badge number (auto-suggested or manual)
   - Member receives welcome email with login instructions
6. If denied:
   - Click **Deny Application**
   - Enter reason (required)
   - Applicant receives notification (generic, no specific reason given)

---

## Dues & Payments

### Process Manual Payment

**Who can do this**: Treasurer

Use when member pays by check or cash at the range.

1. Look up member
2. Click **Payments** tab
3. Click **Record Manual Payment**
4. Enter:
   - Amount
   - Payment method: Check / Cash
   - Check number (if applicable)
   - Notes
5. Click **Record Payment**
6. System extends membership expiration date

### Issue Refund

**Who can do this**: Treasurer

1. Go to **Admin → Payments**
2. Find the payment to refund
3. Click **Refund**
4. Enter:
   - Refund amount (full or partial)
   - Reason
5. Click **Process Refund**
6. If Stripe payment: refund processed automatically
7. If manual payment: note added, issue refund outside system

### Generate Dues Reminder Report

**Who can do this**: Treasurer, Dir. Memberships

1. Go to **Admin → Reports → Dues**
2. Select timeframe:
   - Expiring in 60 days
   - Expiring in 30 days
   - Currently expired
   - 30+ days overdue
3. Click **Generate Report**
4. Export to CSV if needed

### Handle Overdue Member

**Timeline**:
- 30 days overdue: Final notice sent automatically
- 60 days overdue: Must terminate or grant exception

1. Look up overdue member
2. Review payment history
3. Decision:
   - **Grant extension**: Click **Extend Grace Period**, enter new date and reason
   - **Terminate**: Follow termination procedure above

---

## Events

### Create New Event

**Who can do this**: Admin, Match Directors (for matches), Dir. Education (for classes)

1. Go to **Admin → Events**
2. Click **Create Event**
3. Fill in:
   - Title
   - Type (Match, Class, Orientation, Work Day, etc.)
   - Date and time (start/end)
   - Location (select range)
   - Description
   - Max participants (0 = unlimited)
   - Registration deadline
   - Cost (0 = free)
   - Required certifications (if any)
   - Director/instructor
   - Contact email
4. Set visibility: Public or Members Only
5. Click **Save as Draft** or **Publish**

### Cancel Event

**Who can do this**: Event creator, Admin

1. Open event
2. Click **Cancel Event**
3. Enter cancellation reason
4. Choose:
   - Notify registrants by email (recommended)
   - Auto-refund paid registrations
5. Click **Confirm Cancellation**
6. Event marked as cancelled (not deleted)

### Check In Attendees

**Who can do this**: Event director, volunteers

1. Open event
2. Click **Check-In** tab
3. For each attendee:
   - Find name in list
   - Click **Check In**
   - Or scan member QR code
4. No-shows remain unchecked
5. After event, no-shows marked automatically

### Enter Match Scores

**Who can do this**: Match Director, designated scorers

**Option A: Manual Entry**
1. Open match event
2. Click **Scores** tab
3. Click **Add Results**
4. For each shooter:
   - Select member
   - Enter division, classification
   - Enter time/score/penalties by stage
5. Click **Save**
6. Click **Publish Results** when complete

**Option B: Import from Practiscore**
1. Open match event
2. Click **Scores** tab
3. Click **Import from Practiscore**
4. Enter Practiscore match ID
5. Review member matching
6. Click **Import**
7. Verify and publish

---

## Shop Orders

### View Pending Orders

**Who can do this**: Dir. Business Operations

1. Go to **Admin → Shop → Orders**
2. Filter by status: **Paid** (awaiting fulfillment)
3. Orders sorted by date

### Fulfill Pickup Order

1. Open order
2. Review items
3. Gather items from inventory
4. Click **Mark Ready for Pickup**
5. Customer receives notification email/SMS
6. When customer picks up:
   - Click **Complete Order**
   - Note who picked up

### Ship Order

1. Open order
2. Review items and shipping address
3. Pack and ship items
4. Click **Mark Shipped**
5. Enter tracking number
6. Customer receives shipping notification
7. Order auto-completes when delivered (or manually complete)

### Issue Order Refund

1. Open order
2. Click **Refund**
3. Select items to refund (or full order)
4. Enter reason
5. Click **Process Refund**
6. Inventory adjusted automatically

### Update Inventory

1. Go to **Admin → Shop → Products**
2. Select product
3. Click **Edit**
4. Update inventory count
5. Save

---

## Announcements

### Post Announcement

**Who can do this**: Admin, Secretary

1. Go to **Admin → Announcements**
2. Click **New Announcement**
3. Fill in:
   - Title
   - Body (rich text editor)
   - Type: General, Safety Alert, Board Update, etc.
   - Publish date (now or scheduled)
   - Expiration date (optional)
4. Delivery options:
   - Post to website (always)
   - Send email to members
   - Send SMS (safety alerts only)
   - Pin to top of announcements
5. Click **Publish** or **Schedule**

### Edit/Remove Announcement

1. Go to **Admin → Announcements**
2. Find announcement
3. Click **Edit** or **Delete**
4. If editing, make changes and save
5. If deleting, confirm deletion

---

## Range Status

### Update Range Status

**Who can do this**: Dir. Range Safety, RSOs, Admin

1. Go to **Admin → Range Status** (or use mobile shortcut)
2. Select range (A through L)
3. Set status:
   - **Open**: Normal operation
   - **Closed**: No shooting allowed
   - **Reserved**: In use for event
4. Add notes (e.g., "Maintenance until 3pm")
5. Click **Update**
6. If closure, option to send SMS to opted-in members

### Schedule Range Closure

For planned maintenance or events:

1. Create event with type **Range Closure**
2. Select affected range(s)
3. Set date/time
4. Status updates automatically when event starts/ends

---

## Elections

### Set Up Annual Election

**Who can do this**: Secretary, Admin

1. Go to **Admin → Elections**
2. Click **Create Election**
3. Enter election year
4. System auto-populates positions up for election (based on even/odd year)
5. Set dates:
   - Nominations open
   - Nominations close
   - Voting opens
   - Voting closes
6. Click **Create**

### Verify Candidate Eligibility

**Requirements**: 36 months continuous membership, no family member currently on BOD

1. Go to **Admin → Elections → [Year]**
2. Click **Candidates** tab
3. For each nominee:
   - System shows membership start date
   - System flags family member conflicts
   - Review and mark **Eligible** or **Ineligible**
4. Ineligible candidates notified with reason

### Publish Election Results

1. After voting closes, go to **Elections → [Year]**
2. Click **Results** tab
3. Review vote counts
4. Click **Certify Results**
5. Winners announced to membership
6. Board member records updated automatically

---

## Discipline

### File Disciplinary Charges

**Who can do this**: Any BOD member

1. Go to **Admin → Discipline**
2. Click **File Charges**
3. Select member
4. Enter written charges (be specific)
5. Attach evidence if any
6. Click **Submit**
7. Case assigned to President for processing

### Send Certified Mail Notice

**Requirement**: Member must receive notice 7+ days before hearing

1. Open discipline case
2. Click **Send Notice**
3. System generates formal notice letter
4. Print and send via USPS Certified Mail
5. Enter tracking number
6. System calculates earliest hearing date (7 days out)

### Schedule Hearing

1. Open discipline case
2. Click **Schedule Hearing**
3. Select BOD meeting date (must be 7+ days after mail sent)
4. System sends hearing notice to member
5. Member can upload written statement before hearing

### Record Hearing Outcome

**Requirement**: 2/3 of full BOD to expel

1. Open discipline case
2. Click **Record Decision**
3. Enter:
   - Date
   - Member attended: Yes / No / Submitted statement
   - Votes: For / Against / Abstain
   - Decision: Expelled / Suspended / Warning / Dismissed
4. Click **Save**
5. If expelled, member terminated automatically
6. Member receives notification with appeal rights

### Process Appeal

1. If member requests appeal (in writing)
2. Open discipline case
3. Click **Schedule Appeal**
4. Create Special Meeting for appeal
5. At meeting, membership votes (2/3 to restore)
6. Record appeal result

---

## Board Transitions

### When Term Ends

**Outgoing board member should**:

1. Document any ongoing issues in their area
2. Export relevant reports for successor
3. Update any saved passwords/access
4. Schedule handoff meeting with successor

### Transfer Admin Access

**Who can do this**: President, Secretary

1. Go to **Admin → Users**
2. Find outgoing board member
3. Click **Edit Roles**
4. Remove their position role
5. Find incoming board member
6. Click **Edit Roles**
7. Assign their position role
8. Log the change with effective date

### Handoff Checklist

For each position, successor should receive:

- [ ] Admin system access granted
- [ ] Walkthrough of relevant admin functions
- [ ] List of ongoing issues/projects
- [ ] Key contacts (vendors, volunteers)
- [ ] Upcoming deadlines
- [ ] Access to position-specific accounts (if any)

---

## Emergency Procedures

### Website Down

1. Check Cloudflare status: status.cloudflare.com
2. If Cloudflare issue: wait for resolution
3. If our issue: contact tech support
4. For urgent member communication:
   - Use backup email list (Treasurer has export)
   - Post on club Facebook page

### Payment System Down

1. Check Stripe status: status.stripe.com
2. If Stripe issue: wait for resolution
3. Meanwhile:
   - Accept checks at range
   - Log manual payments when system returns
   - Do not turn away members for "unpaid" status

### Data Breach Suspected

1. Immediately notify President
2. Do not delete or modify anything
3. President contacts:
   - Tech support
   - Legal counsel if needed
4. If confirmed:
   - Reset all admin passwords
   - Notify affected members within 72 hours
   - Document incident

### Safety Incident at Range

1. Ensure scene is safe
2. Provide first aid if needed
3. Call 911 if emergency
4. File incident report in system:
   - Go to **Admin → Incidents**
   - Click **New Incident**
   - Fill in all details
5. Notify Dir. Range Safety immediately
6. Dir. Range Safety notifies President

---

## Vendor Management

### Account Owners

| Vendor | Purpose | Account Owner | Backup |
|--------|---------|---------------|--------|
| Cloudflare | Hosting | [Name] | President |
| Stripe | Payments | Treasurer | President |
| Resend | Email | [Name] | Secretary |
| Twilio | SMS | [Name] | Secretary |
| Domain registrar | Domain | [Name] | President |

### Monthly Tasks

| Task | Who | When |
|------|-----|------|
| Review Stripe fees | Treasurer | 1st of month |
| Check SMS balance | Secretary | 1st of month |
| Review error logs | Tech contact | Weekly |
| Backup verification | Tech contact | Monthly |

### Annual Tasks

| Task | Who | When |
|------|-----|------|
| Domain renewal | Account owner | Before expiration |
| SSL certificate | Auto-renewed | N/A |
| Review vendor costs | Treasurer | Budget time |
| Update emergency contacts | Secretary | After elections |

---

## Costs Reference

### Monthly Costs (Estimated)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare (Workers, D1, R2) | $5-25 | Based on usage |
| Stripe | 2.9% + $0.30/txn | On payments only |
| Resend | $0-20 | Based on email volume |
| Twilio | $0.0079/SMS | Safety alerts only |
| Domain | ~$15/year | Annual |

### Where Money Goes

- All payment processing through Stripe
- Funds deposited to club bank account
- Stripe fees deducted automatically
- Monthly statement available in Stripe dashboard
