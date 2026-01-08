# Ranges & Facilities

Range status, reservations, rentals, and digital member cards.

---

## Range Inventory

| Range | Type | Distance |
|-------|------|----------|
| A | Pistol | 25 yards |
| B | Pistol | 25 yards |
| C | Rifle | 100 yards |
| D | Rifle | 100 yards |
| E | Rifle | 200 yards |
| F | Rifle/Action | 200 yards |
| G | Multi-use | Variable |
| H | Steel/Action | 50 yards |
| I | Shotgun | Skeet/Trap |
| J | Shotgun | 5-Stand |
| K | Long Range | 600 yards |
| L | Long Range | 1000 yards |

*Note: Verify actual range configuration with club.*

---

## Range Status

### Status Options

| Status | Color | Meaning |
|--------|-------|---------|
| Open | Green | Available for use |
| Closed | Red | Not available |
| Reserved | Orange | Private event/match |
| Maintenance | Yellow | Work in progress |

### Status Board Features

- Real-time status on website
- Admin can update from phone
- Shows current activity/notes
- Weather widget (temp, wind, conditions)
- Sunrise/sunset times

### Closure Alerts

- SMS notification (opt-in)
- Push notification (if enabled)
- Posted on website immediately

---

## Reservations

### What Can Be Reserved

| Facility | Min Duration | Max Duration |
|----------|--------------|--------------|
| Range A-L | 1 hour | 8 hours |
| Education Building | 2 hours | Full day |
| Meeting Room | 1 hour | 4 hours |

### Reservation Request

| Field | Required | Notes |
|-------|----------|-------|
| Facility | Yes | Which range/building |
| Date | Yes | Future date |
| Start time | Yes | During operating hours |
| End time | Yes | Max 8 hours |
| Purpose | Yes | Practice, class, private event |
| Attendees | Yes | Expected count |
| Notes | No | Special requirements |

### Approval Workflow

1. Member submits request
2. Admin reviews (conflicts, capacity)
3. Approved → Added to calendar, range marked reserved
4. Denied → Member notified with reason

### Reservation Pricing

| Facility | Rate | Notes |
|----------|------|-------|
| Standard range | $25/hour | Member rate |
| Long range (K, L) | $50/hour | Member rate |
| Education Building | $100/half day | Includes AV |
| Private event | Negotiated | Contact admin |

---

## Equipment Rentals

### Available Equipment

| Item | Daily Rate | Deposit |
|------|------------|---------|
| Shot timer | $5 | None |
| Steel targets | $20 | $50 |
| Target stands (set of 4) | $10 | None |
| Classroom AV | Included | None |

### Rental Process

1. Book online or at range
2. Pay rental + deposit
3. Pick up at range house
4. Return by end of day
5. Deposit returned after inspection

### Late Returns

| Overdue | Fee |
|---------|-----|
| Same day | None |
| Next day | 1 day rate |
| 2+ days | 1 day rate per day + $25 |
| 7+ days | Full replacement value |

---

## Locker Rentals

### Availability

| Rule | Requirement |
|------|-------------|
| Annual fee | $50 |
| Assignment | First come, first served |
| Lock | Member provides own |
| Contents | Member's responsibility |
| Insurance | Not covered by club |

### Locker Rules

- No ammunition storage
- No hazardous materials
- Subject to inspection with notice
- Renewal required annually
- Non-transferable

---

## Digital Member Card

### Card Information

| Field | Display |
|-------|---------|
| Member name | Full name |
| Badge number | 5-digit number |
| Member type | Individual, Family, Life, etc. |
| Photo | Optional |
| Expiration date | Month/Year |
| QR code | For gate/verification |

### Mobile Wallet Integration

| Platform | Format |
|----------|--------|
| Apple Wallet | .pkpass file |
| Google Wallet | Pass link |

### Wallet Features

- Auto-update on renewal
- Visual change when expired
- Works offline
- Notifications for expiration

### QR Code Usage

- Gate access (if automated)
- Volunteer check-in verification
- Event check-in
- Admin verification scan

---

## Weather Display

### Data Shown

| Metric | Source |
|--------|--------|
| Temperature | Weather API |
| Wind speed/direction | Weather API |
| Conditions | Weather API |
| Sunrise/sunset | Calculated |
| Heat index | Calculated |
| UV index | Weather API |

### Display Location

- Range status page
- Mobile app home
- Public calendar

---

## Notifications

### Range Status Alerts

| Event | Who | Method |
|-------|-----|--------|
| Range closed | Opted-in members | SMS |
| Range reopened | Opted-in members | SMS |
| Weather alert | All members | Email + SMS |

### Reservation Notifications

| Event | Who | Method |
|-------|-----|--------|
| Request submitted | Member | Email |
| Request approved | Member | Email |
| Request denied | Member | Email with reason |
| Reminder | Member | Email 1 day before |

### Rental Notifications

| Event | Who | Method |
|-------|-----|--------|
| Rental confirmed | Member | Email |
| Return reminder | Member | SMS day of return |
| Overdue | Member | Email + SMS |
