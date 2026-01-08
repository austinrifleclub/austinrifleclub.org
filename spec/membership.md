# Membership

Member lifecycle from application through life membership.

---

## Overview

| Stage | Description |
|-------|-------------|
| Prospect | Submitted application, not yet approved |
| Member | Active, dues current |
| Family | Spouse/junior on primary's account |
| Life | 25+ years or qualified prepayment |
| Inactive | Dues expired, within 60-day grace |
| Terminated | Removed or lapsed beyond grace |

---

## Application Process

### Steps

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

- `submitted` - Initial submission
- `documents_pending` - Awaiting document upload
- `documents_received` - Documents uploaded, under review
- `payment_pending` - Awaiting initiation fee
- `payment_received` - Paid, ready for safety eval
- `safety_eval_scheduled` - Date selected
- `safety_eval_completed` - Passed evaluation
- `orientation_scheduled` - Date selected
- `orientation_completed` - Ready for BOD vote
- `approved` - Voted in, badge issued
- `rejected` - BOD denied application

### Timeouts

| Milestone | Deadline |
|-----------|----------|
| Documents | 30 days from submission |
| Safety eval | 60 days from document approval |
| Orientation | 90 days from safety eval |
| Total | 180 days from submission |

**Expired application**: Must restart. Payment refunded minus $25 processing fee.

---

## Member Types & Pricing

### Membership Types

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

New members joining mid-year pay prorated dues:

```
months_remaining = 12 - ((current_month - 4) % 12)
prorated_dues = max(annual_dues * months_remaining / 12, 25)
```

Initiation fee ($200) is never prorated.

---

## Family Membership

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

### Family Membership (both parents full)

With Family type ($200), both parents are full members with:
- Independent range access
- Voting rights
- All juniors included at no extra cost

### Junior Aging Out

| Event | Action |
|-------|--------|
| 60 days before 21st birthday | Reminder email |
| On 21st birthday | Junior status ends |
| 30-day grace | Convert to Individual or lose access |
| Conversion | Initiation fee waived if continuous |

---

## Life Membership

### Qualification

**Path 1: Time-based**
- 25 years continuous membership

**Path 2: Prepayment**
- 19 years continuous + 6 years prepaid

### Continuous Membership

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

Can request full exemption with justification to BOD.

### Honorary Life

BOD can grant for exceptional contribution (2/3 vote).

---

## Dues & Renewals

### Fiscal Year

**April 1 – March 31**

### Renewal Timeline

| When | Action |
|------|--------|
| 90 days before | Early renewal opens |
| 60 days before | First reminder email |
| 30 days before | Second reminder + dashboard banner |
| 7 days before | Urgent reminder (email + SMS) |
| Expiration | Access revoked at 11:59 PM CT |
| 30 days after | Late notice, final warning |
| 60 days after | Membership terminated |

### Expired Member Capabilities

| Can Do | Cannot Do |
|--------|-----------|
| Log in | Access member content |
| View dashboard | Register for events |
| See renewal banner | Shop purchases |
| Pay dues | Sign in guests |
| | Range access |

### Reinstatement

| Days Overdue | Process |
|--------------|---------|
| 0-60 | Pay online, instant reactivation |
| 60+ | Must reapply as new member |

---

## Member Dashboard

### Profile Section

| Field | Editable | Notes |
|-------|----------|-------|
| Name | Yes | Requires admin approval for legal changes |
| Email | Yes | Verification required |
| Phone | Yes | — |
| Address | Yes | — |
| Emergency contact | Yes | Required |
| Photo | Yes | For member card |

### Membership Section

| Display | Description |
|---------|-------------|
| Status | Active, Expired, Life, etc. |
| Type | Individual, Family, etc. |
| Badge number | Assigned at approval |
| Member since | Join date |
| Expiration | Or "Life Member" |
| Renewal button | If within 90 days |

### Family Section (Primary only)

- List family members
- Add/remove dependents
- View their status

### History Section

- Payment history
- Event attendance
- Match results
- Guest sign-ins
- Volunteer hours

### Documents Section

- Download membership card
- Access member-only documents
- View/sign waivers

---

## Digital Member Card

### Card Contents

| Field | Display |
|-------|---------|
| Member name | Full name |
| Badge number | Unique ID |
| Member type | Individual, Family, Life |
| Photo | If uploaded |
| Expiration | Date or "Life Member" |
| QR code | For verification |

### Wallet Integration

- Apple Wallet (.pkpass)
- Google Wallet
- Auto-updates on renewal
- Visual change when expired

### Offline Access

Card works without internet (cached locally).

---

## Member Removal

### Voluntary

1. Member requests termination
2. No refund for remaining period
3. Account marked terminated
4. Can rejoin later (new application)

### Non-Payment

1. 60 days overdue
2. Auto-terminated
3. Must reapply if wants to rejoin

### Expulsion

See [Governance - Discipline](./governance.md#discipline).

---

## Data Retention

| Data | While Active | After Termination |
|------|--------------|-------------------|
| Profile | Retained | 3 years then delete |
| Payment history | Retained | 7 years then delete |
| ID documents | Until approved | 30 days then delete |
| Match results | Retained | Permanent (anonymize option) |
