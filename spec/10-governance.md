# Governance & Bylaws

Official governance structure and bylaws-driven requirements for the Austin Rifle Club website.

---

## Club Information

| Field | Value |
|-------|-------|
| Legal Name | Austin Rifle Club, Inc. |
| Incorporated | December 8, 1928 |
| Charter # | 52790 |
| Type | Texas Non-Profit Corporation |
| Fiscal Year | April 1 – March 31 |
| Location | 16312 Littig Rd, Manor, TX 78653 |

### Official Purpose (from Charter)

> "To educate the youth of our Country in the art of rifle shooting in times of peace so that in the event of a National Emergency they may be qualified to act as instructors of the armed forces of our Country; and, to teach safe handling of firearms and to promote the skill of United States participants in shooting sports."

---

## Board of Directors

### Positions (10 Total)

| Position | Elected | Term | Primary Responsibilities |
|----------|---------|------|-------------------------|
| President | Even years | 2 years | Executive authority, final approval |
| Vice President | Odd years | 2 years | Backup to President |
| Secretary | Odd years | 2 years | Minutes, notices, records |
| Treasurer | Even years | 2 years | Finances, dues, reporting |
| Director of Range Safety | Even years | 2 years | Safety rules, RSO program, incidents |
| Director of Site Construction | Odd years | 2 years | Capital projects, facilities |
| Director of Education | Odd years | 2 years | Classes, certifications, youth programs |
| Director of Memberships | Even years | 2 years | Applications, renewals, member data |
| Director of Business Operations | Even years | 2 years | Shop, sponsors, contracts |
| Director of Maintenance Management | Odd years | 2 years | Work days, equipment, repairs |

### Eligibility Requirements

- Must be member for **36 continuous months**
- No two family members on BOD at same time
- **No compensation** (expense reimbursement allowed)

### Website Admin Roles (Mapped to BOD)

| BOD Position | Website Permissions |
|--------------|---------------------|
| President | Full admin, all features |
| Vice President | Full admin (backup) |
| Secretary | Minutes upload, announcements, member directory |
| Treasurer | Financial reports, dues management, shop admin, refunds |
| Dir. Range Safety | Range status, incident reports, RSO management, safety content |
| Dir. Site Construction | Project tracking, range reservations, facility calendar |
| Dir. Education | Classes, certifications, instructor management, orientation |
| Dir. Memberships | Applications, renewals, member profiles, guest logs |
| Dir. Business Operations | Shop products, sponsors, event fees, contracts |
| Dir. Maintenance | Work day scheduling, maintenance logs, equipment inventory |

---

## Membership Categories

### Voting Members

- Age 18 or older
- Current on dues
- One vote per member

### Life Membership

| Path | Requirements |
|------|--------------|
| Standard | 25 years continuous membership |
| Accelerated | 19 years + 6 years prepaid dues |

**Post-2011 Life Members**: Pay 50% of annual dues (can request exemption with justification).

**Honorary Life**: BOD can grant for exceptional contribution (requires 2/3 vote).

### Non-Voting Categories

BOD may authorize additional categories as needed.

---

## Application & Approval Process

### Application Workflow

| Step | Action | System Support |
|------|--------|----------------|
| 1 | Prospect submits application | Online form |
| 2 | Documents uploaded | ID, background consent |
| 3 | Payment received | Stripe integration |
| 4 | Safety eval completed | Scheduled, results logged |
| 5 | Orientation completed | Attendance tracked |
| 6 | **BOD reviews** | Application presented at meeting |
| 7 | **BOD votes** | Requires **3/4 majority** |
| 8 | If approved → badge issued | Auto-notification |
| 9 | If denied → applicant notified | Reason provided |

### System Requirements

- Track all applications for BOD meeting agenda
- Record vote outcome (approve/deny)
- Store denial reasons
- Cannot auto-approve—BOD vote required

---

## Member Discipline Process

### Removal Workflow

| Step | Requirement | System Support |
|------|-------------|----------------|
| 1 | Written charges filed | Admin creates case |
| 2 | Member notified by **certified mail** | Track mailing, delivery confirmation |
| 3 | **7 days minimum** before hearing | System enforces minimum |
| 4 | Member may present defense | Upload written statement or attend |
| 5 | **Executive Session** (unless member requests public) | Flag on meeting |
| 6 | BOD votes | Requires **2/3 of full BOD** |
| 7 | If expelled → membership terminated | Status updated |
| 8 | Member may appeal | Request form |
| 9 | Appeal heard at called membership meeting | Requires **2/3 vote** to restore |

### Discipline Status Values

- Active (no issues)
- Under Review (charges filed)
- Suspended (pending hearing)
- Expelled (removed by BOD)
- Appeal Pending
- Restored (appeal successful)

---

## Dues Changes

### Process

| Step | Requirement |
|------|-------------|
| 1 | BOD proposes change |
| 2 | Published **30 days before** Annual Meeting |
| 3 | Ratified by **majority vote** at Annual Meeting |
| 4 | Effective **April 1st** of that fiscal year |

### System Requirements

- Announcement system for dues proposals
- Online voting at Annual Meeting
- Automatic effective date (April 1)
- Historical dues schedule

---

## Meetings

### Meeting Types

| Type | Called By | Notice Required |
|------|-----------|-----------------|
| Annual Meeting | BOD | Set by BOD |
| BOD Meeting | President or 3 Directors | Per BOD schedule |
| Membership Meeting | BOD | Newsletter + website |
| Special Meeting | President, 3 Directors, OR **2.5% of members** petition | 30 days after petition received |

### Quorum

Members present = quorum (no minimum number required).

### Electronic Voting

Allowed if BOD implements system with **positive user ID authentication**.

### System Requirements

- Meeting calendar with type labels
- Agenda publishing before meetings
- Minutes upload (within 7 days per bylaws)
- Executive session flag (restricted visibility)
- Attendance tracking
- Motion and vote recording
- Petition system for special meetings (track signatures, auto-trigger at 2.5%)

---

## Expenditure Approval

| Amount | Approval Required |
|--------|-------------------|
| Under $25,000 | BOD approval |
| $25,000 – $50,000 | Majority vote at membership meeting (25 days notice) |
| Over $50,000 | Same as bylaw amendment (2/3 vote) |

### System Requirements

- Track proposed expenditures
- Route to appropriate approval workflow
- Record votes and outcomes
- Link to 5-year plan if applicable

---

## Bylaw Amendments

### Proposal

Can be proposed by:
- **2/3 of directors**, OR
- **10% of voting members** petition

### Process

| Step | Requirement |
|------|-------------|
| 1 | Proposal submitted |
| 2 | Published **20 days before** vote (email or USPS) |
| 3 | Vote held |
| 4 | Requires **2/3 of voting members** to ratify |

### System Requirements

- Petition collection (track signatures toward 10%)
- Amendment publication system
- Online voting with 2/3 threshold
- Version control for bylaws document

---

## Elections

### Schedule

- Even years: President, Treasurer, Dir. Range Safety, Dir. Memberships, Dir. Business Operations
- Odd years: Vice President, Secretary, Dir. Site Construction, Dir. Education, Dir. Maintenance

### System Requirements

| Feature | Description |
|---------|-------------|
| Eligibility check | Verify 36 months continuous membership |
| Family check | Prevent two family members on BOD simultaneously |
| Nomination form | Online submission with bio and statement |
| Candidate profiles | Photo, bio, platform statement |
| Online voting | Authenticated, one vote per voting member |
| Results | Real-time for admin, hidden until polls close |
| Term tracking | Know which positions up each year |
| Transition | Access transfer workflow when terms end |

---

## 5-Year Operations Plan

Required by bylaws—BOD must maintain a rolling 5-year plan.

### Plan Structure

| Field | Description |
|-------|-------------|
| Project name | Short title |
| Description | What will be done |
| Timeline | Start/end years |
| Estimated budget | Total cost |
| Funding source | Dues, donations, grants, reserves |
| Status | Not Started, In Progress, Complete |
| BOD sponsor | Which director owns it |

### System Requirements

- Project list viewable by members
- Status updates by BOD
- Annual report auto-generation
- Member proposal submission
- Voting on major projects at Annual Meeting

---

## Document Retention

### Required Records

| Document | Retention | Access |
|----------|-----------|--------|
| Bylaws (current) | Permanent | Public |
| Bylaws (historical) | Permanent | Members |
| Meeting minutes | Permanent | Members (exec session: BOD only) |
| Financial records | 7 years | Treasurer + President |
| Membership applications | Duration of membership + 3 years | Dir. Memberships |
| Incident reports | 7 years | Dir. Range Safety + President |
| Contracts | Duration + 7 years | Dir. Business Operations |

---

## Compliance Checklist

### Annual Requirements

- [ ] Annual Meeting held
- [ ] Board elections completed (applicable positions)
- [ ] Financial report presented
- [ ] 5-year plan reviewed/updated
- [ ] Dues set for next fiscal year (if changing)
- [ ] Minutes published for all meetings

### Per-Meeting Requirements

- [ ] Agenda published in advance
- [ ] Minutes recorded
- [ ] Minutes reviewed by BOD
- [ ] Minutes published within 7 days
- [ ] Votes recorded accurately

### Ongoing Requirements

- [ ] All applications voted on by BOD (3/4 majority)
- [ ] Discipline cases follow certified mail + 7-day rule
- [ ] Expenditures follow approval thresholds
- [ ] Petitions tracked and acted upon within 30 days
