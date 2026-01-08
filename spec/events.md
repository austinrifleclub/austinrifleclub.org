# Events & Calendar

Matches, classes, orientations, work days, and all scheduled activities.

---

## Event Types

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

---

## Event Data

### Required Fields

| Field | Type | Notes |
|-------|------|-------|
| title | text | Max 100 chars |
| event_type | enum | See types above |
| start_time | datetime | Must be future |
| end_time | datetime | After start |
| created_by | user | Auto-set |

### Optional Fields

| Field | Type | Notes |
|-------|------|-------|
| description | rich text | Max 5000 chars |
| location | text | Range A-L, Education Bldg, etc. |
| max_participants | integer | 0 = unlimited |
| registration_deadline | datetime | Before start |
| cost | cents | 0 = free |
| required_certifications | array | Cert IDs |
| director_id | member | Match director, instructor |
| contact_email | email | For questions |
| is_public | boolean | Visible to non-members |

### Constraints

| Rule | Limit |
|------|-------|
| Max duration | 7 days |
| Future limit | 1 year ahead |
| Past editing | Read-only after end + 30 days |

---

## Registration

### Who Can Register

| Event Type | Who |
|------------|-----|
| Public match | Any member |
| Members-only class | Active members |
| Orientation | Approved prospects |
| Work day | Any member |

### Registration Flow

1. Member clicks "Register"
2. If paid event → Stripe checkout
3. Confirmation email sent
4. Added to event roster
5. Reminder emails: 7 days, 1 day before

### Capacity & Waitlist

| Scenario | Behavior |
|----------|----------|
| Under capacity | Instant registration |
| At capacity | Added to waitlist |
| Spot opens | First on waitlist notified |
| Claim window | 24 hours to confirm |
| No response | Next person notified |

### Waitlist Notifications

- Email immediately when spot opens
- SMS if opted in
- Push notification if enabled

---

## Cancellation & Refunds

### Member Cancels

| When | Refund |
|------|--------|
| 7+ days before | 100% |
| 2-6 days before | 50% |
| <2 days before | 0% |
| No-show | 0% |

Admin can override refund policy.

### Event Cancelled

| Action | Behavior |
|--------|----------|
| Notification | All registrants emailed |
| Refunds | Automatic full refund |
| Calendar | Event marked cancelled (not deleted) |

---

## Check-In

### At Event

1. Volunteer opens event check-in screen
2. For each attendee:
   - Find name in roster
   - Click "Check In" OR scan QR code
3. Timestamp recorded
4. No-shows remain unchecked

### After Event

- No-shows auto-flagged
- Attendance stats available
- Director can add walk-ins

---

## Recurring Events

### Recurrence Patterns

| Pattern | Example |
|---------|---------|
| Weekly | Every Sunday |
| Bi-weekly | Every other Saturday |
| Monthly by day | First Sunday of month |
| Monthly by date | 15th of each month |

### How It Works

- Parent event created with recurrence rule
- Child events auto-generated 90 days ahead
- Each instance editable independently
- Cancel one vs cancel series

---

## Matches & Scoring

### Match Types

| Match | Scoring System |
|-------|----------------|
| USPSA | Time + points, hit factor |
| IDPA | Time + penalties |
| Steel Challenge | Time only |
| 3-Gun | Combined time |
| High Power | Points |
| Smallbore | Points |
| Benchrest | Group size |

### Score Entry

**Manual Entry**
1. Match director opens event
2. Clicks "Scores" tab
3. For each shooter:
   - Select member
   - Enter division, classification
   - Enter stage results
4. Click "Publish Results"

**Practiscore Import**
1. Click "Import from Practiscore"
2. Enter match ID
3. System matches names to members
4. Review and confirm
5. Auto-publish

### Results Display

| View | Shows |
|------|-------|
| Overall | All shooters ranked |
| By division | Filtered by USPSA/IDPA division |
| By class | Filtered by classification |
| Stage breakdown | Individual stage times/scores |

### Member Statistics

| Stat | Calculation |
|------|-------------|
| Matches attended | Count |
| Win rate | Division wins / matches |
| Average finish | Percentile |
| Personal bests | Best score, best stage |
| Trend | Improvement over time |

### Classification Tracking

- USPSA: D, C, B, A, M, GM
- IDPA: NV, MM, SS, EX, MA
- Displayed on profile (opt-in)
- Historical progression tracked

---

## Classes & Training

### Class Types

| Category | Examples |
|----------|----------|
| Required | Safety Eval, Orientation |
| Safety | First Aid, RSO Certification |
| Skills | Beginner Pistol, Carbine 101 |
| Competition | USPSA Intro, IDPA Basics |
| Instructor | NRA Instructor courses |

### Prerequisites

Classes can require:
- Prior course completion
- Specific certification
- Membership duration
- Age minimum

System enforces at registration.

### Completion & Certificates

1. Instructor marks attendees complete
2. Certification added to member profile
3. PDF certificate auto-generated
4. Expiration tracked (if applicable)

---

## Work Days

### Schedule

- First Saturday of month (default)
- 8 AM - 1 PM (or until complete)
- All ranges closed during work

### Volunteer Hours

- Attendance logged automatically
- Hours credited to member
- See [Volunteer Tracking](#volunteer-tracking)

---

## Volunteer Tracking

### Logging Hours

| Field | Required |
|-------|----------|
| Date | Yes |
| Hours | Yes |
| Activity | Yes (dropdown) |
| Notes | No |

### Activity Types

- Range maintenance
- Match setup/teardown
- RSO duty
- Orientation instructor
- Office work
- Special project
- Other

### Volunteer Credits

| Activity | Credit |
|----------|--------|
| 1 hour | $10 |
| Match director | $25/match |
| RSO full day | $25 |
| Major project | $50 (admin discretion) |

### Credit Usage

- Apply to dues
- Shop purchases
- Event fees
- Expires March 31 (no rollover)

### Verification

- Self-reported hours flagged "pending"
- Admin or event director verifies
- Verified hours count toward credit

---

## Calendar Features

### Views

| View | Shows |
|------|-------|
| Month | Grid view, all events |
| Week | Detailed daily schedule |
| List | Upcoming events list |
| Day | Single day detail |

### Filters

- By event type
- By range
- By registration status
- My events only

### Sync

| Method | Description |
|--------|-------------|
| iCal feed | Subscribe in any calendar app |
| .ics download | Single event to calendar |
| Google Calendar | Direct add button |
| Apple Calendar | Direct add button |

---

## Notifications

### Event Reminders

| When | Method |
|------|--------|
| 7 days before | Email |
| 1 day before | Email + SMS (opt-in) + Push |

### Other Notifications

| Event | Notification |
|-------|--------------|
| Registration confirmed | Email |
| Waitlist spot opened | Email + SMS + Push |
| Event cancelled | Email + SMS |
| Scores posted | Email |
