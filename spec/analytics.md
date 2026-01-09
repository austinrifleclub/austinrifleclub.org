# Analytics, SEO & Marketing

Web analytics, search optimization, and member acquisition tracking.

---

## Analytics Platform

### Primary: Cloudflare Web Analytics

| Feature | Benefit |
|---------|---------|
| Privacy-focused | No cookies, GDPR compliant |
| Free | Included with Cloudflare |
| Core Web Vitals | Performance tracking |
| Real-time | Live visitor data |

### Supplemental: Plausible or Fathom (Optional)

| Feature | Benefit |
|---------|---------|
| Simple dashboard | Easy for board members |
| Privacy-first | No cookie banner needed |
| Goals/conversions | Track key actions |
| ~$9/month | Budget-friendly |

### Internal Analytics

Track in our own database for deeper analysis:

| Event | Data Captured |
|-------|---------------|
| Page views | Path, referrer, user agent |
| Application started | Source, UTM params |
| Application completed | Time to complete, drop-off step |
| Event registration | Event type, source |
| Shop purchase | Products, value, source |
| Guest sign-in | Host member, time |

---

## Conversion Tracking

### Key Conversions

| Conversion | Trigger | Value |
|------------|---------|-------|
| Application started | Form opened | — |
| Application submitted | Payment received | $200 |
| Membership approved | Badge issued | — |
| Event registration | Signup completed | Event fee |
| Shop purchase | Order completed | Order value |
| Donation | Payment completed | Amount |

### Funnel Tracking

**Membership Funnel:**
```
Visit homepage
    ↓ (track %)
View membership page
    ↓ (track %)
Start application
    ↓ (track %)
Complete step 1 (info)
    ↓ (track %)
Complete step 2 (documents)
    ↓ (track %)
Complete step 3 (payment)
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

---

## Attribution Tracking

### UTM Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| utm_source | Where traffic came from | google, facebook, newsletter |
| utm_medium | Type of channel | cpc, social, email |
| utm_campaign | Specific campaign | spring-recruitment-2025 |
| utm_content | Ad variant (A/B test) | ad-variant-a |
| utm_term | Keyword (paid search) | shooting-club-austin |

### Source Tracking

Store with every:
- Application
- Event registration
- Shop order
- Contact form submission

### Attribution Models

| Model | Use For |
|-------|---------|
| First touch | Which source discovered us |
| Last touch | What triggered the action |
| Linear | Credit all touchpoints |

**Recommendation:** Track both first and last touch for applications.

---

## SEO Optimization

### Technical SEO

| Element | Implementation |
|---------|----------------|
| SSL/HTTPS | Cloudflare (automatic) |
| Mobile-friendly | Responsive design |
| Page speed | Target < 2s load time |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| XML sitemap | Auto-generated, submitted to Google |
| robots.txt | Allow public pages, block member portal |
| Canonical URLs | Prevent duplicate content |

### On-Page SEO

| Page | Target Keywords |
|------|-----------------|
| Homepage | austin rifle club, shooting range austin, gun club austin tx |
| Ranges | outdoor shooting range austin, rifle range near austin, pistol range manor tx |
| Membership | join shooting club austin, gun club membership texas |
| Events | uspsa matches austin, shooting competitions texas, firearms training austin |
| About | private gun club austin, shooting sports austin |

### Meta Tags

| Tag | Requirement |
|-----|-------------|
| Title | Unique per page, 50-60 chars, keyword first |
| Description | Unique per page, 150-160 chars, include CTA |
| OG:title | Same as title |
| OG:description | Same as description |
| OG:image | Club logo or relevant photo |

### Local SEO

| Platform | Action |
|----------|--------|
| Google Business Profile | Claim, verify, keep updated |
| Bing Places | Claim and verify |
| Apple Maps | Submit via Apple Business Connect |
| Yelp | Claim listing |

### Google Business Profile

Keep updated:
- Hours (especially holidays)
- Photos (range, events)
- Posts (upcoming events, news)
- Reviews (respond to all)
- Q&A (answer promptly)

### Schema Markup

| Type | Use For |
|------|---------|
| Organization | Homepage |
| LocalBusiness | Contact page |
| Event | Calendar events |
| Product | Shop items |
| FAQPage | FAQ sections |
| BreadcrumbList | Navigation |

---

## Google Ads (Optional)

### Campaign Structure

| Campaign | Goal | Budget |
|----------|------|--------|
| Brand | Capture "austin rifle club" searches | Low |
| Membership | Drive applications | Primary |
| Events | Fill match registrations | Seasonal |

### Target Keywords

**High Intent (Membership):**
- join gun club austin
- shooting club membership austin
- private range austin tx
- gun club near me (geo-targeted)

**Events:**
- uspsa match austin
- idpa match texas
- shooting competition near me

### Negative Keywords

Exclude to avoid wasted spend:
- free
- cheap
- rental (unless we offer)
- indoor (if outdoor only)
- jobs
- employment

### Landing Pages

| Ad Campaign | Landing Page |
|-------------|--------------|
| Membership | /membership (dedicated, no distractions) |
| Events | /calendar?type=match |
| Training | /calendar?type=class |

### Conversion Setup

Track in Google Ads:
- Application started (micro-conversion)
- Application submitted (primary conversion)
- Event registration (conversion)

---

## Facebook/Meta Ads (Optional)

### Audience Targeting

| Audience | Targeting |
|----------|-----------|
| Core | Austin metro, interests: shooting sports, hunting, firearms, NRA |
| Lookalike | Based on current member emails |
| Retargeting | Website visitors who didn't apply |

### Ad Types

| Type | Use For |
|------|---------|
| Image | General awareness |
| Video | Range tours, event highlights |
| Carousel | Show multiple ranges |
| Lead form | Quick interest capture |

### Creative Guidelines

- Show real members (with permission)
- Highlight community, not just shooting
- Include clear CTA
- Test multiple images/copy

---

## Email Marketing Metrics

### Acquisition Emails

| Metric | Target |
|--------|--------|
| Welcome email open rate | > 50% |
| Application reminder click rate | > 20% |
| Orientation reminder open rate | > 70% |

### Retention Emails

| Metric | Target |
|--------|--------|
| Newsletter open rate | > 30% |
| Renewal reminder open rate | > 50% |
| Event announcement click rate | > 15% |

### A/B Testing

Test regularly:
- Subject lines
- Send times
- CTA button text
- Email length

---

## Referral Tracking

### How It Works

1. Member gets unique referral link: `austinrifleclub.org/?ref=ABC123`
2. Prospect clicks link, cookie stored (30 days)
3. Application tracks referral source
4. Credit applied when prospect becomes member

### Referral Dashboard

Member sees:
- Unique referral link
- Click count
- Applications started
- Applications approved
- Credits earned

---

## Reporting Dashboards

### Marketing Dashboard (Admin)

| Metric | Timeframe |
|--------|-----------|
| Website visitors | Daily/Weekly/Monthly |
| Traffic sources | Pie chart |
| Top pages | Table |
| Application funnel | Visual funnel |
| Conversion rate | Trend line |
| Cost per acquisition | If running ads |

### Board Report (Monthly)

| Section | Content |
|---------|---------|
| Traffic summary | Visitors, trend vs last month |
| Application pipeline | Started, completed, approved |
| Top sources | Where members come from |
| Ad performance | If applicable, ROAS |
| Recommendations | What to improve |

---

## Privacy Compliance

### What We Track

| Data | Purpose | Retention |
|------|---------|-----------|
| Page views | Analytics | 2 years |
| Referrer | Attribution | With application |
| UTM params | Campaign tracking | With application |
| IP address | Fraud prevention | 30 days |

### What We Don't Track

- Cross-site tracking
- Third-party cookies
- Fingerprinting
- Personal browsing history

### Cookie Policy

| Cookie | Purpose | Duration |
|--------|---------|----------|
| Session | Login state | Session |
| Referral | Track who referred | 30 days |
| Preferences | UI settings | 1 year |

No tracking cookies = no cookie banner needed (for most jurisdictions).

---

## Tools & Integrations

| Tool | Purpose | Cost |
|------|---------|------|
| Cloudflare Analytics | Web analytics | Free |
| Google Search Console | SEO monitoring | Free |
| Google Ads | Paid search | Variable |
| Meta Ads | Social advertising | Variable |
| Resend | Email with analytics | Included |
| Plausible (optional) | Simple analytics | ~$9/mo |

### Google Search Console Setup

1. Verify domain via Cloudflare DNS
2. Submit sitemap
3. Monitor:
   - Search queries
   - Click-through rates
   - Index coverage
   - Core Web Vitals

---

## Quick Wins Checklist

- [ ] Set up Cloudflare Analytics
- [ ] Verify Google Search Console
- [ ] Claim Google Business Profile
- [ ] Add schema markup to pages
- [ ] Create XML sitemap
- [ ] Set up conversion tracking in database
- [ ] Create UTM links for all marketing
- [ ] Implement referral tracking system
- [ ] Add meta tags to all pages
- [ ] Test page speed, fix issues
