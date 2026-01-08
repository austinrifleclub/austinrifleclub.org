# Content & Communication

Public website, announcements, documents, and AI features.

---

## Public Website Pages

| Page | Content |
|------|---------|
| Home | Welcome message, quick links, next upcoming event, announcements |
| About | Club history, mission, board members, contact info |
| Ranges | Interactive map, description of each range (A-L), photos |
| Calendar | All events, color-coded by type, filterable |
| Membership | Pricing, benefits, how to join, FAQ |
| Rules | Range rules, safety guidelines, guest policy |
| Shop | Browse products (must log in to buy) |
| Contact | Address, email, phone, map |

---

## Visitor Capabilities

Unauthenticated users can:

- View all public pages
- Browse events and calendar
- Read public announcements
- See membership pricing
- Browse shop (view only)
- Start membership application
- Use AI chatbot for questions

---

## Announcements

### Types

| Type | Who Sees | Delivery |
|------|----------|----------|
| General | All members | Email + website |
| Safety Alert | All members | Email + SMS + website |
| Event Update | Event registrants | Email |
| Board Update | All members | Email + website |
| Prospect Info | Prospects | Email |

### Announcement Fields

| Field | Required | Notes |
|-------|----------|-------|
| title | Yes | Max 200 chars |
| body | Yes | Rich text, max 50,000 chars |
| type | Yes | See types above |
| publish_at | Yes | Can be future |
| expires_at | No | After publish date |
| send_email | No | Default false |
| send_sms | No | Safety alerts only |
| pin_to_top | No | Sticky announcement |

### Display

- Pinned announcements at top
- Sorted by date (newest first)
- Expired announcements hidden
- Archive accessible to members

---

## Documents

### Public Documents

| Document | Access |
|----------|--------|
| Range rules | Public |
| Safety guidelines | Public |
| Waiver template | Public |
| Membership application | Public |

### Member Documents

| Document | Access |
|----------|--------|
| Club bylaws | Members only |
| Meeting minutes | Members only |
| Annual report | Members only |
| Financial statements | Members only |
| Background check form | Prospects |

### Document Management

- Upload PDF, DOCX
- Version history
- Publish/unpublish
- Access logging

---

## Online Forms

| Form | Purpose |
|------|---------|
| Membership application | New member signup |
| Guest waiver | Digital signature |
| Incident report | Safety/rule violations |
| Volunteer hours log | Track contributions |
| Equipment rental request | Reserve gear |
| Range reservation request | Book facilities |
| Contact form | General inquiries |

---

## AI Features

### Chatbot

| Capability | Examples |
|------------|----------|
| Answer FAQs | "What are the range hours?" |
| Event info | "When is the next USPSA match?" |
| Membership help | "How do I join?" |
| Range info | "Which range is for rifles?" |
| Contact routing | "I need to talk to someone about X" |
| Guest policy | "Can I bring a friend?" |
| Rules lookup | "What's the maximum caliber for Range C?" |

### Smart Search

- Natural language queries
- "Show me all pistol matches in March"
- "What classes are available for beginners?"
- "Who is the match director for 3-gun?"

### Admin AI Assistance

| Feature | Use Case |
|---------|----------|
| Draft announcements | Convert bullet points to prose |
| Event descriptions | Generate from template |
| Document summary | Summarize long documents |
| Policy lookup | Answer admin questions |
| Email drafts | Standard communications |

### AI Training Data

- Range rules and policies
- FAQ content
- Event history
- Club bylaws
- Safety guidelines

### AI Limitations

- No member data access without auth
- Cannot process payments
- Cannot modify records
- Escalates complex issues to humans

---

## Notification Preferences

### Member Options

| Category | Options |
|----------|---------|
| General announcements | Email, none |
| Safety alerts | Email + SMS (required, cannot disable) |
| Event reminders | Email, SMS, both, none |
| Dues reminders | Email + SMS (required, cannot disable) |
| Newsletter | Email, none |
| Range closures | SMS, none |
| Order updates | Email + push |

### Quiet Hours

| Rule | Default |
|------|---------|
| No SMS | 10 PM - 7 AM Central |
| No push | 10 PM - 7 AM Central |
| Email | Any time |
| Emergency override | Safety alerts ignore quiet hours |

---

## Content Management

### Who Can Edit What

| Role | Can Edit |
|------|----------|
| Admin | All content |
| Director | Department content |
| Volunteer | Assigned content |
| Member | Own profile only |

### Audit Trail

- All edits logged
- Who, when, what changed
- Previous version stored
- Restore capability

---

## SEO & Public Access

### Indexable Pages

- Home
- About
- Ranges (descriptions)
- Calendar (public events)
- Membership info
- Contact

### Not Indexed

- Member portal
- Shop (logged in)
- Forums
- Documents
- Event registration

### Meta Tags

- Title per page
- Description per page
- Open Graph for sharing
- Club logo as default image
