# Validation Rules

Field-level validation requirements for all forms and data inputs.

---

## General Rules

### Text Fields

| Rule | Default |
|------|---------|
| Trim whitespace | Always |
| Normalize unicode | NFC |
| Max length | 255 chars unless specified |
| Empty string | Treated as null |

### Email

| Rule | Requirement |
|------|-------------|
| Format | RFC 5322 compliant |
| Max length | 254 characters |
| Case | Stored lowercase |
| Unique | Per user account |

### Phone Numbers

| Rule | Requirement |
|------|-------------|
| Format | E.164 or US format accepted |
| Storage | E.164 format (+1XXXXXXXXXX) |
| Required digits | 10 (US) |
| Validation | Luhn check not required |

### URLs

| Rule | Requirement |
|------|-------------|
| Protocol | https:// required (http:// rejected) |
| Max length | 2048 characters |
| Validation | Must be parseable URL |

### Dates

| Rule | Requirement |
|------|-------------|
| Storage | Unix timestamp (INTEGER) |
| Timezone | UTC internally, display in CT |
| Future dates | Allowed for events, deadlines |
| Past dates | Allowed for historical records |

### Currency

| Rule | Requirement |
|------|-------------|
| Storage | Integer cents (e.g., $100.00 = 10000) |
| Display | USD with 2 decimal places |
| Negative | Not allowed except refunds |

---

## User Account

### Registration

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| email | Yes | 5 | 254 | email | Unique |
| password | Yes | 8 | 128 | — | See password rules |
| name | Yes | 1 | 100 | — | Full name |

### Password Rules

| Rule | Requirement |
|------|-------------|
| Min length | 8 characters |
| Max length | 128 characters |
| Required chars | None (length-based security) |
| Banned passwords | Common passwords list |
| Reuse | Cannot reuse last 5 passwords |

---

## Member Profile

### Personal Information

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| first_name | Yes | 1 | 50 | — | — |
| last_name | Yes | 1 | 50 | — | — |
| email | Yes | 5 | 254 | email | Unique |
| phone | Yes | 10 | 15 | phone | — |
| date_of_birth | No | — | — | date | Must be in past |

### Address

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| address_line1 | Yes | 1 | 100 | — | Street address |
| address_line2 | No | 0 | 100 | — | Apt, suite, etc. |
| city | Yes | 1 | 50 | — | — |
| state | Yes | 2 | 2 | — | TX, etc. |
| zip | Yes | 5 | 10 | — | 12345 or 12345-6789 |

### Emergency Contact

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| emergency_name | Yes | 1 | 100 | — | Full name |
| emergency_phone | Yes | 10 | 15 | phone | — |
| emergency_relation | No | 0 | 50 | — | Spouse, parent, etc. |

---

## Membership Application

### Application Form

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| membership_type | Yes | — | — | enum | individual, family, veteran, senior |
| how_heard | No | 0 | 500 | — | Free text |
| government_id | Yes | — | 10MB | file | JPG, PNG, PDF |
| background_consent | Yes | — | 10MB | file | PDF with signature |

### Document Upload

| Rule | Requirement |
|------|-------------|
| File types | JPG, JPEG, PNG, PDF |
| Max size | 10MB per file |
| Min dimensions | 800x600 for images |
| Max dimensions | 4096x4096 |
| Virus scan | Required before storage |

---

## Family Members

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| name | Yes | 1 | 100 | — | Full name |
| relationship | Yes | — | — | enum | spouse, child, grandchild |
| email | No | 5 | 254 | email | For account creation |
| date_of_birth | Juniors | — | — | date | Required if under 21 |

### Junior Rules

| Rule | Requirement |
|------|-------------|
| Max age | Under 21 |
| Age calculation | As of membership year start (April 1) |
| Aging out | Auto-convert prompt when turning 21 |

---

## Events

### Event Creation

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| title | Yes | 1 | 100 | — | — |
| description | No | 0 | 5000 | — | Rich text allowed |
| event_type | Yes | — | — | enum | match, class, orientation, etc. |
| start_time | Yes | — | — | datetime | Must be future |
| end_time | Yes | — | — | datetime | Must be after start |
| location | No | 0 | 100 | — | Range A-L or other |
| max_participants | No | 0 | 9999 | integer | 0 = unlimited |
| cost | No | 0 | 100000 | cents | Max $1000 |
| registration_deadline | No | — | — | datetime | Before start_time |

### Event Rules

| Rule | Requirement |
|------|-------------|
| Duration | Max 7 days |
| Future limit | Max 1 year ahead |
| Past editing | Read-only after end_time + 30 days |

---

## Guest Sign-In

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| guest_name | Yes | 1 | 100 | — | Full name |
| guest_email | No | 5 | 254 | email | For waiver delivery |
| guest_phone | No | 10 | 15 | phone | — |
| waiver_signature | Yes | — | — | base64 | Digital signature image |

### Guest Rules

| Rule | Requirement |
|------|-------------|
| Max per visit | 3 guests per member |
| Same guest/year | 3 visits maximum |
| Waiver | Required every visit |
| Signature | Cannot be blank/single line |

---

## Shop

### Products

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| name | Yes | 1 | 100 | — | — |
| description | No | 0 | 2000 | — | Rich text |
| category | Yes | — | — | enum | apparel, accessories, etc. |
| member_price | Yes | 0 | 10000000 | cents | Max $100,000 |
| inventory_count | Yes | 0 | 99999 | integer | — |

### Product Images

| Rule | Requirement |
|------|-------------|
| File types | JPG, PNG, WebP |
| Max size | 5MB |
| Dimensions | 800x800 minimum, 4096x4096 maximum |
| Aspect ratio | 1:1 recommended |
| Max per product | 10 images |

### Orders

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| items | Yes | 1 | 50 | array | Min 1 item |
| fulfillment_type | Yes | — | — | enum | pickup, shipping |
| shipping_address | If shipping | — | — | object | Full address |

---

## Announcements

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| title | Yes | 1 | 200 | — | — |
| body | Yes | 1 | 50000 | — | Rich text |
| type | Yes | — | — | enum | general, safety, board, etc. |
| publish_at | Yes | — | — | datetime | Can be future |
| expires_at | No | — | — | datetime | Must be after publish |

---

## Elections

### Candidate Nomination

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| position_id | Yes | — | — | uuid | — |
| bio | No | 0 | 2000 | — | Background |
| statement | No | 0 | 5000 | — | Platform |
| photo | No | — | 2MB | file | JPG, PNG |

### Eligibility

| Rule | Requirement |
|------|-------------|
| Membership duration | 36 continuous months |
| Family conflict | No other family member on BOD |
| Standing | Must be in good standing |

---

## Discipline

| Field | Required | Min | Max | Format | Notes |
|-------|----------|-----|-----|--------|-------|
| charges | Yes | 10 | 10000 | — | Detailed charges |
| member_statement | No | 0 | 10000 | — | Defense statement |
| certified_mail_tracking | If sent | — | 50 | — | USPS tracking |

### Timing

| Rule | Requirement |
|------|-------------|
| Notice period | Min 7 days before hearing |
| Hearing date | Must be at BOD meeting |

---

## File Uploads (General)

### Allowed Types by Context

| Context | Allowed Types |
|---------|---------------|
| Profile photo | JPG, PNG |
| Documents | PDF |
| ID verification | JPG, PNG, PDF |
| Product images | JPG, PNG, WebP |
| Announcement images | JPG, PNG, WebP, GIF |
| Meeting minutes | PDF |

### Size Limits

| Context | Max Size |
|---------|----------|
| Profile photo | 2MB |
| ID document | 10MB |
| Product image | 5MB |
| Meeting minutes | 20MB |
| General attachment | 10MB |

### Security

| Rule | Requirement |
|------|-------------|
| Virus scan | All uploads scanned |
| Content validation | Magic bytes checked |
| Filename | Sanitized, max 255 chars |
| Storage path | No user input in path |

---

## Search & Filters

### Text Search

| Rule | Requirement |
|------|-------------|
| Min query length | 2 characters |
| Max query length | 100 characters |
| Special chars | Escaped |
| Case | Insensitive |

### Pagination

| Rule | Default | Max |
|------|---------|-----|
| Page size | 25 | 100 |
| Page number | 1 | — |
| Offset | 0 | 10000 |

---

## API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Password reset | 3 requests | 1 hour |
| Registration | 3 accounts | 1 hour per IP |
| API general | 100 requests | 1 minute |
| File upload | 20 uploads | 1 hour |
| Search | 30 queries | 1 minute |

---

## Error Messages

### User-Facing

| Validation | Message |
|------------|---------|
| Required field | "This field is required" |
| Invalid email | "Please enter a valid email address" |
| Password too short | "Password must be at least 8 characters" |
| File too large | "File must be under {max}MB" |
| Invalid file type | "Please upload a {types} file" |
| Future date required | "Please select a future date" |

### Never Expose

- Database errors
- Stack traces
- Internal IDs in error context
- Other users' data
- System paths
