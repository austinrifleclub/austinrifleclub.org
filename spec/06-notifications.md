# Notifications System

Comprehensive notification system for member communication.

---

## Notification Channels

| Channel | Use Cases |
|---------|-----------|
| Email | All notifications |
| SMS | Urgent/time-sensitive |
| Push | Mobile app users |
| In-app | Dashboard banners |

---

## Notification Summary

| Event | Email | SMS | Push |
|-------|-------|-----|------|
| Application status | ✓ | — | — |
| Dues reminder (60 days) | ✓ | — | — |
| Dues reminder (30 days) | ✓ | — | — |
| Dues reminder (7 days) | ✓ | ✓ | — |
| Dues expired | ✓ | ✓ | — |
| Event registration | ✓ | — | — |
| Event reminder (1 week) | ✓ | — | — |
| Event reminder (1 day) | ✓ | ✓ (opt-in) | ✓ |
| Event cancelled | ✓ | ✓ | ✓ |
| Range closure | ✓ | ✓ | ✓ |
| Safety alert | ✓ | ✓ | ✓ |
| New announcement | ✓ (opt-in) | — | — |
| Order confirmation | ✓ | — | — |
| Order ready for pickup | ✓ | ✓ | ✓ |
| Order shipped | ✓ | — | ✓ |
| Waitlist spot opened | ✓ | ✓ | ✓ |
| Referral completed | ✓ | — | — |
| Badge earned | ✓ | — | ✓ |
| Certification expiring | ✓ | — | — |
| Password reset | ✓ | — | — |
| Account changes | ✓ | — | — |

---

## Member Notification Preferences

### Required (Cannot Opt Out)

- Safety alerts (email + SMS)
- Dues reminders (email + SMS at 7 days)
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
| Forum notifications | Email, none |
| Classifieds responses | Email, none |

---

## Email Templates

### Transactional

| Template | Trigger |
|----------|---------|
| Welcome | Account created |
| Email verification | Signup |
| Password reset | Request |
| Application received | Submit application |
| Application approved | Admin approval |
| Application rejected | Admin rejection |
| Dues receipt | Payment processed |
| Event registration | Sign up for event |
| Order confirmation | Purchase complete |
| Shipping notification | Order shipped |

### Reminders

| Template | Timing |
|----------|--------|
| Dues reminder 60 | 60 days before expiration |
| Dues reminder 30 | 30 days before expiration |
| Dues reminder 7 | 7 days before expiration |
| Dues expired | On expiration |
| Event reminder week | 7 days before event |
| Event reminder day | 1 day before event |
| Certification expiring | 30/60/90 days before |

### Marketing

| Template | Frequency |
|----------|-----------|
| Newsletter | Monthly |
| Match results | After each match |
| New event | When posted |

---

## SMS Templates

SMS messages should be short and actionable.

### Examples

**Dues Reminder**
```
ARC: Your membership expires in 7 days. Renew at austinrifleclub.com/renew to maintain range access.
```

**Range Closure**
```
ARC: Range C closed today for maintenance. Ranges A, B, D-L open. Check status: austinrifleclub.com/status
```

**Safety Alert**
```
ARC SAFETY ALERT: [message]. All members must acknowledge. Details: austinrifleclub.com/alerts
```

**Event Reminder**
```
ARC: Reminder - USPSA Match tomorrow at 8am. Check in at Range H. Good luck!
```

**Waitlist**
```
ARC: A spot opened in USPSA Match (Jan 15). Claim it now: austinrifleclub.com/events/123
```

---

## Push Notifications

### Mobile PWA

| Notification | Action |
|--------------|--------|
| Event reminder | Opens event details |
| Range closure | Opens range status |
| Order ready | Opens order details |
| Badge earned | Opens profile |

### Configuration

- Request permission on first login
- Respect system settings
- Quiet hours (10pm - 7am)
- Batch non-urgent notifications

---

## In-App Notifications

### Dashboard Banners

| Type | Style | Dismissible |
|------|-------|-------------|
| Dues expiring | Yellow warning | No |
| Dues expired | Red alert | No |
| Action required | Blue info | Yes |
| Success | Green | Yes |
| Announcement | Gray | Yes |

### Notification Center

- Bell icon in header
- Unread count badge
- List of recent notifications
- Mark as read
- Mark all as read
- Link to preferences

---

## Notification Queue

### Processing

- Queue notifications for batch processing
- Send immediately for urgent (safety alerts)
- Respect rate limits (Twilio, Resend)
- Retry failed sends
- Log all attempts

### Scheduling

- Send at optimal times (not 3am)
- Respect timezone
- Batch similar notifications
- Deduplicate within window

---

## Unsubscribe Handling

### Email

- One-click unsubscribe link in footer
- Manage preferences link
- Honor unsubscribe within 24 hours
- Cannot unsubscribe from required

### SMS

- Reply STOP to unsubscribe
- Reply HELP for info
- Resubscribe via preferences
- Cannot unsubscribe from safety alerts

---

## Delivery Tracking

### Metrics

- Sent count
- Delivered count
- Opened count (email)
- Clicked count (email)
- Bounced count
- Failed count

### Reports

- Delivery rate by channel
- Open rate by template
- Click rate by template
- Bounce rate over time
- Unsubscribe rate

### Alerts

- High bounce rate
- Delivery failures
- SMS quota warnings
