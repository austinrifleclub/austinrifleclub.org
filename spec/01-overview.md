# Overview & User Roles

## About the Club

The Austin Rifle Club is a private, non-profit shooting club located in Manor, Texas. Founded in 1894, it's one of the oldest shooting clubs in Texas. The club is run entirely by volunteers, and members pay yearly dues for unlimited access to outdoor shooting ranges on a 28-acre facility.

### Quick Facts

| Attribute | Value |
|-----------|-------|
| Location | 16312 Littig Rd, Manor, TX 78653 |
| Established | 1894 |
| Members | ~1,500 |
| Property | 28 acres |
| Ranges | 12 (A through L) |
| Structure | Non-profit, volunteer-run |

### Affiliations

- National Rifle Association (NRA)
- Texas State Rifle Association (TSRA)
- Civilian Marksmanship Program (CMP)
- NRA Junior Division

---

## User Roles

| Role | Who They Are | How They Get Access |
|------|--------------|---------------------|
| **Visitor** | Anyone browsing the site | No login needed |
| **Prospect** | Someone applying to join | Creates account during application |
| **Member** | Paid, active member | Approved after orientation |
| **Family Member** | Spouse/child on a member's account | Added by primary member |
| **Volunteer** | Member with duties (RSO, Match Director) | Assigned by admin |
| **Instructor** | Certified to teach classes | Verified by admin |
| **Admin** | Board member or officer | Assigned by other admin |

---

## Role Permissions

### Visitor
- View public pages
- Browse events and calendar
- Read announcements
- See membership pricing
- Browse shop (view only)
- Start membership application
- Use AI chatbot

### Prospect
- Everything visitors can do
- Complete application form
- Upload documents
- Pay initiation fee
- Sign up for safety eval and orientation
- View application status

### Member
- Everything prospects can do
- Full dashboard access
- Pay dues online
- Register for events
- Purchase from shop
- Sign in guests
- View member-only documents
- Access forums
- Post classifieds
- Update profile

### Family Member
- Limited dashboard (own profile)
- View events
- Cannot sign in guests independently
- Cannot make purchases (primary member must)

### Volunteer
- Everything members can do
- Log volunteer hours
- Access volunteer-specific features
- Update range status (RSO)
- Enter match scores (Match Director)
- Check in event attendees

### Instructor
- Everything volunteers can do
- Create/manage classes
- Mark course completions
- Issue certifications

### Admin
- Full system access
- Approve applications
- Manage members
- Create events and announcements
- Manage shop
- View reports
- Issue refunds
- Assign roles

---

## Role Assignment

| Role | Assigned By | Requirements |
|------|-------------|--------------|
| Visitor | Automatic | None |
| Prospect | Self (starts application) | Valid email |
| Member | Admin (after orientation) | Complete application process |
| Family Member | Primary member | On same household |
| Volunteer | Admin | Active member |
| Instructor | Admin | Instructor certification |
| Admin | Existing admin | Board approval |

---

## Account Lifecycle

```
Visitor
   │
   ▼ (starts application)
Prospect
   │
   ▼ (completes orientation)
Member ◄────────────────────┐
   │                        │
   ├─► Family Member        │
   │                        │
   ├─► Volunteer            │
   │                        │
   ├─► Instructor           │
   │                        │
   └─► Admin                │
                            │
   (expires) ───────────────┘
   │
   ▼
Inactive Member
   │
   ├─► (pays dues) → Member
   │
   └─► (60 days overdue) → Terminated
```
