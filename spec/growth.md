# Growth & Metrics

Analytics, SEO, marketing, KPIs, and content strategy.

---

## Table of Contents

1. [Analytics & Tracking](#1-analytics--tracking)
2. [SEO & Marketing](#2-seo--marketing)
3. [Success Metrics](#3-success-metrics)
4. [Content Strategy](#4-content-strategy)

---

# 1. Analytics & Tracking

## 1.1 Analytics Platforms

### Primary: Cloudflare Web Analytics

| Feature | Benefit |
|---------|---------|
| Privacy-focused | No cookies, GDPR compliant |
| Free | Included with Cloudflare |
| Core Web Vitals | Performance tracking |
| Real-time | Live visitor data |

### Supplemental: Plausible/Fathom (Optional, ~$9/mo)

Simple dashboard, privacy-first, goal tracking, no cookie banner needed.

### Internal Analytics

Track in database for deeper analysis:
- Page views (path, referrer, user agent)
- Application started/completed (source, UTM, drop-off step)
- Event registration (type, source)
- Shop purchase (products, value, source)
- Guest sign-in (host, time)

## 1.2 Conversion Tracking

| Conversion | Trigger | Value |
|------------|---------|-------|
| Application started | Form opened | — |
| Application submitted | Payment received | $200 |
| Membership approved | Badge issued | — |
| Event registration | Signup completed | Fee |
| Shop purchase | Order completed | Order value |
| Donation | Payment completed | Amount |

### Membership Funnel

```
Visit homepage
    ↓ (track %)
View membership page
    ↓ (track %)
Start application
    ↓ (track %)
Complete info step
    ↓ (track %)
Complete documents step
    ↓ (track %)
Complete payment
    ↓ (track %)
Attend orientation
    ↓ (track %)
Approved member
```

### Drop-off Analysis

| Step | If High Drop-off |
|------|------------------|
| Homepage → Membership | Improve visibility, add CTA |
| Membership → Application | Clarify requirements, pricing |
| Application step 1 → 2 | Form too long, unclear fields |
| Documents upload | Technical issues, unclear requirements |
| Payment | Price shock, payment issues |

## 1.3 Attribution Tracking

### UTM Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| utm_source | Where from | google, facebook, newsletter |
| utm_medium | Channel type | cpc, social, email |
| utm_campaign | Specific campaign | spring-recruitment-2025 |
| utm_content | Ad variant | ad-variant-a |
| utm_term | Keyword | shooting-club-austin |

Store with: Applications, event registrations, shop orders, contact forms.

Track both **first touch** (discovered us) and **last touch** (triggered action).

## 1.4 Referral Tracking

1. Member gets unique link: `austinrifleclub.org/?ref=ABC123`
2. Prospect clicks, cookie stored (30 days)
3. Application tracks referral source
4. Credit applied when approved

**Dashboard shows:** Referral link, click count, applications started/approved, credits earned.

---

# 2. SEO & Marketing

## 2.1 Technical SEO

| Element | Implementation |
|---------|----------------|
| SSL/HTTPS | Cloudflare (automatic) |
| Mobile-friendly | Responsive design |
| Page speed | < 2s load time |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| XML sitemap | Auto-generated |
| robots.txt | Allow public, block member portal |
| Canonical URLs | Prevent duplicates |

## 2.2 On-Page SEO

| Page | Target Keywords |
|------|-----------------|
| Homepage | austin rifle club, shooting range austin, gun club austin tx |
| Ranges | outdoor shooting range austin, rifle range near austin |
| Membership | join shooting club austin, gun club membership texas |
| Events | uspsa matches austin, shooting competitions texas |
| About | private gun club austin, shooting sports austin |

### Meta Tags

| Tag | Requirement |
|-----|-------------|
| Title | Unique per page, 50-60 chars, keyword first |
| Description | 150-160 chars, include CTA |
| OG:image | Club logo or relevant photo |

### Schema Markup

| Type | Use For |
|------|---------|
| Organization | Homepage |
| LocalBusiness | Contact page |
| Event | Calendar events |
| Product | Shop items |
| FAQPage | FAQ sections |

## 2.3 Local SEO

| Platform | Action |
|----------|--------|
| Google Business Profile | Claim, verify, keep updated |
| Bing Places | Claim and verify |
| Apple Maps | Submit via Apple Business Connect |
| Yelp | Claim listing |

**Google Business Profile:** Update hours, photos, posts, respond to reviews, answer Q&A.

## 2.4 Google Ads (Optional)

### Campaigns

| Campaign | Goal | Budget |
|----------|------|--------|
| Brand | Capture "austin rifle club" | Low |
| Membership | Drive applications | Primary |
| Events | Fill registrations | Seasonal |

### Keywords

**Membership:** join gun club austin, shooting club membership, private range austin tx

**Events:** uspsa match austin, idpa match texas, shooting competition near me

**Negative:** free, cheap, jobs, indoor (exclude irrelevant)

### Landing Pages

| Campaign | Page |
|----------|------|
| Membership | /membership |
| Events | /calendar?type=match |
| Training | /calendar?type=class |

## 2.5 Facebook/Meta Ads (Optional)

### Audiences

| Audience | Targeting |
|----------|-----------|
| Core | Austin metro, interests: shooting sports, hunting, NRA |
| Lookalike | Based on member emails |
| Retargeting | Visitors who didn't apply |

### Creative

- Show real members (with permission)
- Highlight community, not just shooting
- Clear CTA, test multiple images/copy

## 2.6 Email Marketing

### Target Metrics

| Email Type | Open Rate | Click Rate |
|------------|-----------|------------|
| Welcome | > 50% | > 30% |
| Application reminder | — | > 20% |
| Newsletter | > 30% | > 10% |
| Renewal reminder | > 50% | > 25% |

A/B test: Subject lines, send times, CTA text, length.

## 2.7 Privacy Compliance

**What we track:** Page views (2yr), referrer, UTM params, IP (30 days)

**What we don't:** Cross-site tracking, third-party cookies, fingerprinting

**Cookies:** Session (login), referral (30 days), preferences (1 year) — no banner needed.

---

# 3. Success Metrics

## 3.1 Primary KPIs

| Metric | Target |
|--------|--------|
| Online dues payments | 80% |
| Online event registration | 90% |
| Member login rate (monthly) | 50% |
| Chatbot deflection | 60% |
| Guest sign-in compliance | 100% |
| New member conversion | 80% |

## 3.2 Membership Metrics

### Acquisition

| Metric | Target |
|--------|--------|
| Monthly applications | Track trend |
| Conversion rate (app → member) | 80% |
| Time to approval | < 30 days |

### Retention

| Metric | Target |
|--------|--------|
| Renewal rate | > 90% |
| Churn rate | < 10% |
| Member tenure | Track trend |

### Engagement

| Metric | Target |
|--------|--------|
| Monthly active users | 50% of members |
| Event participation | > 30% |
| Match participation | > 20% |
| Volunteer rate | > 10% |

## 3.3 Website Metrics

### Traffic

| Metric | Target |
|--------|--------|
| Bounce rate | < 40% |
| Session duration | > 3 min |

### Performance

| Metric | Target |
|--------|--------|
| Page load time | < 2 sec |
| Core Web Vitals | Pass |
| Uptime | 99.9% |
| Error rate | < 0.1% |

## 3.4 Event Metrics

| Metric | Target |
|--------|--------|
| Registration rate | > 75% of capacity |
| Attendance rate | > 90% of registered |
| No-show rate | < 10% |
| Post-event satisfaction | > 4/5 |

## 3.5 Shop Metrics

| Metric | Target |
|--------|--------|
| Time to ready | < 3 days |
| Shipping time | < 7 days |
| Return rate | < 2% |
| Out of stock rate | < 5% |

## 3.6 Communication Metrics

### Email

| Metric | Target |
|--------|--------|
| Delivery rate | > 98% |
| Open rate | > 30% |
| Click rate | > 10% |
| Unsubscribe rate | < 1% |

### SMS

| Metric | Target |
|--------|--------|
| Delivery rate | > 98% |
| Opt-out rate | < 1% |

### Chatbot

| Metric | Target |
|--------|--------|
| Deflection rate | > 60% |
| Satisfaction | > 4/5 |
| Escalation rate | < 20% |

## 3.7 Financial Metrics

### Revenue Sources

Dues, initiation fees, event fees, shop sales, donations, rentals — track all monthly/annually.

### Collections

| Metric | Target |
|--------|--------|
| Online payment rate | > 80% |
| On-time renewal | > 70% |
| Late payment rate | < 20% |
| Failed payment rate | < 2% |

## 3.8 Reporting Schedule

| Frequency | Reports |
|-----------|---------|
| Daily | Error alerts, security events, payment failures |
| Weekly | Traffic, registrations, orders, chatbot |
| Monthly | Full dashboard, membership trends, financial summary |
| Quarterly | Board report, YoY comparison, goal progress |
| Annually | Full review, goal setting, budget planning |

## 3.9 Dashboards

| Dashboard | Key Metrics |
|-----------|-------------|
| Executive | Total members, revenue, event attendance, alerts |
| Membership | Applications, renewals due, expired, new members |
| Events | Upcoming, registration status, attendance trends |
| Financial | Revenue by source, outstanding payments, refunds |
| Operations | Range status, guests, orders, volunteer hours |

---

# 4. Content Strategy

## 4.1 Range Guides

Each range (A-L) needs a dedicated page:

| Section | Content |
|---------|---------|
| Overview | What it's for, photos |
| Specifications | Distances, positions, target types |
| Allowed/Prohibited | What's OK, what's not |
| Target Rules | Height, placement, holders |
| Shooting Positions | Bench, prone, standing |
| Special Rules | Range-specific safety |
| Equipment | What's provided, what to bring |
| Tips | Best practices, etiquette |

### Range Summary

| Range | Type | Key Info |
|-------|------|----------|
| A | Pistol (25/50 yd) | Primarily pistol, .22 OK, no centerfire rifles except pos 41 |
| B | Plinking (7-15 yd) | Rimfire/centerfire pistol, no rifles |
| C | Benchrest/High Power | 100/200 yd, centerfire 2000+ FPS, no rimfire |
| D | .22 Silhouette | .22 LR only, 40-100m |
| E | Pistol Silhouette/Black Powder | All firearms, shotgun patterning |
| F | Air Gun (Indoor) | Air rifles/pistols only, 10m |
| G | CHL/Education | Reserved for classes |
| H-K | IDPA/IPSC Bays | Handguns, static positions |
| L | IDPA/IPSC Bay | Rifles/shotguns only |

## 4.2 Getting Started Guides

### For New Members

| Guide | Content |
|-------|---------|
| Your First Visit | What to expect, parking, checking in |
| Range Etiquette | Unwritten rules, being a good neighbor |
| Commands & Procedures | Cease fire, range hot, going downrange |
| What to Bring | Guns, ammo, eyes, ears, targets |
| Weather | Heat, cold, rain, flooding |
| Facilities | Restrooms, range house, education building |

### For Prospects

| Guide | Content |
|-------|---------|
| Is ARC Right for You? | Club expectations |
| Membership Process | Step-by-step with timeline |
| Safety Eval | What's evaluated, how to prepare |
| Orientation | Duration, what to bring |
| FAQ | Common questions |

## 4.3 Discipline Guides

| Discipline | Content |
|------------|---------|
| USPSA | Divisions, classification, getting started |
| IDPA | Divisions, equipment requirements |
| Steel Challenge | Format, stages, beginner tips |
| 3-Gun | Equipment needs, match format |
| High Power | CMP matches, scoring |
| Smallbore | .22 rifle, positions |
| Silhouette | Pistol/rifle, targets, distances |
| Benchrest | Classes, equipment |
| Black Powder | Muzzleloader safety |
| Air Gun | 10m Olympic-style |

For each: Equipment needed, first steps, club contacts, upcoming beginner matches.

## 4.4 Safety Content

### Core Safety

| Topic | Content |
|-------|---------|
| The 4 Rules | Universal firearms safety |
| Range-Specific | ARC's rules explained |
| Emergency | What to do if injured |
| First Aid | Kit location, basic response |
| Weather | Lightning, heat, flooding |
| Wildlife | Snakes, insects |

### Equipment Safety

Eye protection, ear protection, clothing, transporting firearms, ammo storage.

## 4.5 Practical How-To's

### At the Range

Setting up targets, scoring, using shot timer, chronographing, bringing guests, reporting problems.

### Administrative

Paying dues online, updating info, adding family, registering for events, getting digital card.

## 4.6 Content Management

### Ownership

| Content | Owner |
|---------|-------|
| Range guides | Dir. Range Safety |
| Competition guides | Match Directors |
| Safety content | Dir. Range Safety |
| How-to guides | Admin/Volunteers |
| News | Board/Admin |

### Review Schedule

| Content | Frequency |
|---------|-----------|
| Range rules | Annually or when changed |
| Range/safety guides | Annually |
| Competition guides | Before each season |
| Pricing/fees | When changed |

### CMS Structure

```
content/
├── pages/ (about, contact, membership)
├── ranges/ (range-a.md through range-l.md)
├── guides/
│   ├── getting-started/
│   ├── disciplines/
│   └── safety/
└── announcements/
```

## 4.7 Accessibility

- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images
- Sufficient color contrast
- Readable at 200% zoom
- Screen reader compatible

## 4.8 Community Contributions

Allow members to suggest/contribute:
- Range tips
- Equipment reviews
- Match reports
- Photos
- Corrections

All moderated by admin before publishing.
