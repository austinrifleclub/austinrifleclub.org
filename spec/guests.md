# Guest Management

How members sign in guests and track visits.

---

## Guest Sign-In Process

### Flow

1. Member taps "Sign In Guest" on phone
2. Enter guest name, email (optional), phone (optional)
3. Guest signs digital waiver on screen
4. Guest receives copy via email (if provided)
5. Entry logged with timestamp

---

## Guest Rules

| Rule | Limit |
|------|-------|
| Max guests per visit | 3 |
| Same guest per year | 3 visits (then must join) |
| Guest must stay with member | Always |
| Waiver | Required every visit |
| Year definition | Calendar year (Jan-Dec) |

---

## Waiver Requirements

### Digital Signature

| Rule | Requirement |
|------|-------------|
| Signature type | Drawn on screen (not typed) |
| Minimum strokes | Cannot be single line |
| Storage | Base64 image |
| Validity | Single visit only |

### Waiver Content

- Assumption of risk
- Release of liability
- Agreement to follow rules
- Emergency contact
- Acknowledgment of supervision requirement

---

## Guest Data

### Sign-In Fields

| Field | Required | Notes |
|-------|----------|-------|
| guest_name | Yes | Full name, 1-100 chars |
| guest_email | No | For waiver delivery |
| guest_phone | No | Emergency contact |
| waiver_signature | Yes | Digital signature image |
| host_member_id | Yes | Auto-set |
| signed_at | Yes | Auto-set timestamp |

---

## Visit Tracking

### What's Recorded

| Field | Description |
|-------|-------------|
| Guest name | As entered |
| Host member | Who signed them in |
| Date/time | When signed in |
| Waiver | Signature stored |
| Visit number | 1st, 2nd, or 3rd this year |

### After Visit

| Visit # | System Action |
|---------|---------------|
| 1st | Normal sign-in |
| 2nd | Suggest membership in waiver email |
| 3rd | Flag as "should join" |
| 4th+ | Blocked until member |

---

## Member Features

### Quick Sign-In

- Save frequent guests for fast entry
- Pre-fill name, email, phone
- Still requires fresh waiver each time

### Guest History

- View all guests signed in
- See visit counts
- See which guests became members

---

## Who Can Be a Guest

| Allowed | Not Allowed |
|---------|-------------|
| Any adult | Former member expelled |
| Minor with guardian | Person banned from property |
| Out-of-town visitor | Anyone who exceeded visit limit |

---

## Admin Features

### Guest Logs

- View all guest sign-ins
- Filter by date, host member
- Search by guest name
- Export guest data

### Flags

| Flag | Meaning |
|------|---------|
| Exceeded visits | Guest has 3+ visits, cannot return |
| Should join | 2+ visits, prompt to apply |
| Banned | Cannot be signed in |

### Manual Overrides

- Admin can reset visit count (rare cases)
- Admin can ban a guest
- Admin can lift ban

---

## Notifications

| Event | Who | Method |
|-------|-----|--------|
| Guest signed in | Guest (if email) | Email with waiver copy |
| 2nd visit | Guest | Email suggesting membership |
| 3rd visit | Host member | Dashboard notification |

---

## Liability

- Club not responsible for guest actions
- Host member responsible for guest supervision
- Waiver covers standard liability
- Incident report required for any issues
