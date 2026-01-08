# Business Rules

Explicit rules for edge cases, calculations, and system behavior.

---

## Membership

### Membership Year

| Rule | Definition |
|------|------------|
| Fiscal year | April 1 – March 31 |
| Expiration time | 11:59 PM Central on expiration date |
| Grace period | None (access revoked immediately at expiration) |

### Proration

New members joining mid-year pay prorated dues:

| Join Month | Proration |
|------------|-----------|
| April | 100% (full year) |
| May | 92% (11/12) |
| June | 83% (10/12) |
| July | 75% (9/12) |
| August | 67% (8/12) |
| September | 58% (7/12) |
| October | 50% (6/12) |
| November | 42% (5/12) |
| December | 33% (4/12) |
| January | 25% (3/12) |
| February | 17% (2/12) |
| March | 8% (1/12) |

**Initiation fee**: Never prorated ($200 always).

**Minimum dues**: $25 (if proration calculates lower).

### Renewal Timing

| Event | When |
|-------|------|
| Early renewal opens | 90 days before expiration |
| First reminder | 60 days before |
| Second reminder | 30 days before |
| Urgent reminder | 7 days before |
| Expiration | Midnight on expiration date |
| Late notice | 30 days after expiration |
| Termination | 60 days after expiration |

### What Happens When Membership Expires

| Capability | Expired Member |
|------------|----------------|
| Log in | Yes |
| View dashboard | Yes (with renewal banner) |
| Access member content | No |
| Register for events | No |
| Shop purchases | No |
| Sign in guests | No |
| Range access | No |

### Reinstatement

| Time Overdue | Process |
|--------------|---------|
| 0-60 days | Pay dues online, instant reactivation |
| 60+ days | Must reapply as new member |

---

## Family Membership

### Primary vs Family Members

| Aspect | Primary | Spouse | Junior |
|--------|---------|--------|--------|
| Independent login | Yes | Yes | Yes (if email provided) |
| Pay dues | Yes | No | No |
| Sign in guests | Yes | No | No |
| Shop purchases | Yes | No | No |
| Event registration | Yes | Yes | Yes (with parent approval) |
| Voting rights | Yes | Yes (if Family type) | No |

### Junior Aging Out

| Event | Action |
|-------|--------|
| Junior turns 21 | Email sent 60 days before birthday |
| On 21st birthday | Junior status ends |
| Options | Convert to Individual ($200 initiation waived if continuous) |
| Grace period | 30 days to convert before removal |

### What Happens When Primary Expires

- All family members lose access simultaneously
- Family members cannot renew independently
- Family members notified of expiration

### Family Member Removal

| Who | Can Remove |
|-----|------------|
| Primary member | Any family member |
| Family member | Cannot remove self (must ask primary) |
| Admin | Any family member |

**Refund**: No refund for mid-year family member removal.

---

## Life Membership

### Qualification Paths

**Path 1: Time-Based**
- 25 years continuous membership
- No gaps in membership (expired for any period = reset)

**Path 2: Prepayment**
- 19 years continuous membership
- Pay 6 additional years of dues upfront
- Total = 25 years credit

### Continuous Membership Definition

| Event | Breaks Continuity? |
|-------|-------------------|
| Renewed within 60 days of expiration | No |
| Expired 60+ days | Yes (counter resets) |
| Voluntary resignation | Yes |
| Expulsion | Yes |
| Military deployment (documented) | No (pause, not break) |

### Post-2011 Life Member Dues

| Joined | Life Member Dues |
|--------|------------------|
| Before Feb 1, 2011 | $0 |
| After Feb 1, 2011 | 50% of annual dues |
| Exemption | Must request and justify to BOD |

---

## Applications

### Application Expiration

| Event | Timeline |
|-------|----------|
| Application submitted | Start |
| Documents due | 30 days |
| Safety eval due | 60 days from doc approval |
| Orientation due | 90 days from safety eval |
| Total timeout | 180 days from submission |

**Expired application**: Must start over (payment refunded minus $25 processing fee).

### Rejection

| Rejection Reason | Can Reapply? | When? |
|------------------|--------------|-------|
| Incomplete documents | Yes | Immediately |
| Failed safety eval | Yes | After 30 days |
| BOD denial | Yes | After 1 year |
| Background concern | No | Never |

### BOD Vote Rules

| Rule | Requirement |
|------|-------------|
| Quorum | Majority of BOD present |
| Threshold | 3/4 of present BOD members |
| Absent votes | Cannot vote by proxy |
| Tie | Motion fails |

---

## Events

### Registration Rules

| Rule | Default |
|------|---------|
| Members only | Most events |
| Registration required | Matches, classes |
| Walk-ins allowed | Work days, some matches |
| Family registration | Each person registers separately |

### Waitlist Behavior

| Event | Action |
|-------|--------|
| Event full | Added to waitlist automatically |
| Spot opens | First on waitlist notified |
| Notification | Email + SMS (if opted in) |
| Claim window | 24 hours to confirm |
| No response | Next person notified |

### Cancellation & Refunds

| When Cancelled | Refund |
|----------------|--------|
| 7+ days before | Full refund |
| 2-6 days before | 50% refund |
| <2 days before | No refund |
| No-show | No refund |

**Exception**: Admin can override refund policy.

### Event Capacity

| Event Type | Default Max |
|------------|-------------|
| Orientation | 30 |
| Safety eval | 20 |
| Match | Per match director |
| Class | Per instructor |
| Work day | Unlimited |

---

## Guests

### Visit Limits

| Rule | Limit |
|------|-------|
| Guests per member per visit | 3 |
| Same guest per year | 3 visits |
| Year definition | Calendar year (Jan-Dec) |

### Guest Becomes Member

| Visit Count | Action |
|-------------|--------|
| After 2nd visit | Suggest membership in waiver email |
| After 3rd visit | Cannot sign in again until member |

### Guest Waiver Validity

| Rule | Requirement |
|------|-------------|
| Duration | Single visit only |
| New waiver | Required every visit |
| Digital signature | Required (cannot be typed name) |

### Who Can Be a Guest

| Allowed | Not Allowed |
|---------|-------------|
| Any adult | Former member expelled |
| Minor with guardian | Person banned from property |
| Out-of-town visitor | Anyone who exceeded visit limit |

---

## Shop

### Pricing

| Buyer | Price Level |
|-------|-------------|
| Active member | Member price |
| Expired member | Cannot purchase |
| Life member | Member price |
| Visitor | Cannot purchase |

### Inventory

| Event | Behavior |
|-------|----------|
| Add to cart | Inventory not reserved |
| Checkout | Inventory checked |
| Out of stock at checkout | Item removed, user notified |
| Order cancelled | Inventory restored |
| Order refunded | Inventory restored |

### Order States

```
Created → Paid → Ready → Completed
                  ↓
              Shipped → Completed
         ↓
    Cancelled (before shipped)
         ↓
    Refunded (any time)
```

### Pickup Policy

| Rule | Requirement |
|------|-------------|
| Pickup location | Range house during open hours |
| Ready notification | Email + SMS + push |
| Pickup deadline | 30 days |
| Not picked up | Refunded minus restocking fee (10%) |

---

## Voting

### Who Can Vote

| Vote Type | Eligible Voters |
|-----------|-----------------|
| BOD elections | All voting members |
| Bylaw amendments | All voting members |
| Dues changes | All voting members |
| Large expenditures | All voting members |
| BOD decisions | BOD members only |

### Voting Member Definition

- Age 18+
- Dues current (not expired)
- Not suspended or expelled

### Vote Thresholds

| Decision | Threshold |
|----------|-----------|
| BOD election | Plurality (most votes wins) |
| Application approval | 3/4 of BOD |
| Expulsion | 2/3 of full BOD |
| Bylaw amendment | 2/3 of voting members |
| Dues change | Majority of voting members |
| Expenditure $25-50k | Majority at meeting |
| Expenditure $50k+ | 2/3 of voting members |

### Online Voting

| Rule | Requirement |
|------|-------------|
| Authentication | Must be logged in |
| One vote | One vote per member per ballot |
| Change vote | Not allowed after submission |
| Anonymity | Individual votes not visible (only totals) |
| Audit | System logs vote (admin cannot see who voted how) |

---

## Volunteer Credits

### Earning Credits

| Activity | Credit |
|----------|--------|
| 1 volunteer hour | $10 |
| Match director | $25 per match |
| RSO full day | $25 |
| Major project | $50 (admin discretion) |

### Using Credits

| Use | Allowed |
|-----|---------|
| Apply to dues | Yes |
| Shop purchases | Yes |
| Event fees | Yes |
| Transfer to another member | No |
| Cash out | No |

### Credit Expiration

| Rule | Timing |
|------|--------|
| Credits expire | March 31 (end of fiscal year) |
| Rollover | Not allowed |
| Expired credits | Lost |

---

## Discipline

### Violations

| Severity | Examples | Typical Outcome |
|----------|----------|-----------------|
| Minor | First-time rule violation, minor safety issue | Warning |
| Moderate | Repeated violations, negligent discharge | Suspension |
| Severe | Intentional unsafe act, threatening behavior | Expulsion |

### Suspension

| Rule | Requirement |
|------|-------------|
| Duration | Set by BOD (typically 30-90 days) |
| During suspension | No range access, can log in |
| Dues | Still due (suspension doesn't pause dues) |
| End of suspension | Auto-reinstated if dues current |

### Expulsion

| Rule | Requirement |
|------|-------------|
| Effective | Immediately upon BOD vote |
| Range access | Revoked permanently |
| Website access | Revoked |
| Refund | No dues refund |
| Rejoin | Cannot rejoin unless appeal successful |

---

## Financial

### Payment Processing

| Method | Processing Time |
|--------|-----------------|
| Credit card | Immediate |
| Debit card | Immediate |
| Check (at range) | Manual entry, up to 3 days |

### Refund Processing

| Original Method | Refund Method |
|-----------------|---------------|
| Credit card | Back to card (3-5 days) |
| Debit card | Back to card (5-10 days) |
| Check | Check mailed (manual) |

### Failed Payments

| Event | Action |
|-------|--------|
| Card declined | User notified, can retry |
| Insufficient funds | Same as declined |
| Fraud detected | Payment blocked, admin notified |
| Disputed charge | Funds held, admin investigates |

---

## Notifications

### Mandatory (Cannot Opt Out)

- Safety alerts
- Dues expiration (7 days)
- Account security (password change, suspicious login)
- Order confirmations
- Discipline notices

### Quiet Hours

| Rule | Default |
|------|---------|
| No SMS | 10 PM - 7 AM Central |
| No push | 10 PM - 7 AM Central |
| Email | Any time |
| Emergency override | Safety alerts ignore quiet hours |

---

## Data Calculations

### Membership Duration

```
duration_years = (today - join_date) / 365.25
continuous = no_gaps_over_60_days(payment_history)
```

### Age Calculation

```
age = floor((today - birth_date) / 365.25)
is_junior = age < 21
```

### Proration Calculation

```
months_remaining = 12 - (current_month - 4) % 12
prorated_dues = max(annual_dues * months_remaining / 12, 25)
```

### Voting Threshold

```
// 2/3 majority
required = ceil(total_voters * 2 / 3)
passed = votes_for >= required

// 3/4 majority
required = ceil(total_voters * 3 / 4)
passed = votes_for >= required
```
