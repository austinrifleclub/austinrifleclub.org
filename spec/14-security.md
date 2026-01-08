# Security & Privacy

Data protection, access control, and privacy policies.

---

## Authentication

### Password Policy

| Rule | Requirement |
|------|-------------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Complexity | Not required (length-based) |
| Common passwords | Blocked (top 10,000 list) |
| Breach check | Check against HaveIBeenPwned |
| Hashing | Argon2id |
| Reuse prevention | Last 5 passwords blocked |

### Session Management

| Rule | Setting |
|------|---------|
| Session duration | 7 days |
| Refresh window | After 24 hours of activity |
| Concurrent sessions | Allowed (max 5) |
| Session invalidation | On password change |
| Idle timeout | None (use explicit logout) |

### Multi-Factor Authentication

| Status | Requirement |
|--------|-------------|
| Members | Optional |
| Admin | Recommended |
| Available methods | TOTP (authenticator app) |
| Recovery | Backup codes (10 single-use) |

### Login Security

| Protection | Implementation |
|------------|----------------|
| Brute force | 5 attempts per 15 minutes |
| Account lockout | 30 minutes after 10 failures |
| IP blocking | After 50 failures from same IP |
| CAPTCHA | After 3 failed attempts |
| Suspicious login alert | Email on new device/location |

---

## Authorization

### Role-Based Access Control

| Role | Level | Scope |
|------|-------|-------|
| Visitor | 0 | Public content only |
| Prospect | 1 | Own application |
| Member | 2 | Member content, own data |
| Family | 2 | Own profile, limited actions |
| Volunteer | 3 | Assigned functions |
| Instructor | 3 | Class management |
| Director | 4 | Department functions |
| Admin | 5 | Full system access |

### Permission Matrix

| Action | Member | Volunteer | Director | Admin |
|--------|--------|-----------|----------|-------|
| View own profile | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✓ | ✓ | ✓ | ✓ |
| View other members | Limited | ✓ | ✓ | ✓ |
| Edit other members | — | — | Dept only | ✓ |
| Create events | — | Some | Dept only | ✓ |
| Approve applications | — | — | Dir. Memberships | ✓ |
| Process refunds | — | — | Treasurer | ✓ |
| Access reports | — | — | Dept only | ✓ |
| Manage system settings | — | — | — | ✓ |

### Data Visibility

| Data | Member View | Admin View |
|------|-------------|------------|
| Other member name | ✓ | ✓ |
| Other member email | — | ✓ |
| Other member phone | — | ✓ |
| Other member address | — | ✓ |
| Payment history | Own only | All |
| Guest history | Own only | All |
| Discipline records | — | ✓ |

---

## Data Classification

### Public Data

Available to anyone, no authentication required:

- Club name, address, contact info
- Range descriptions (general)
- Public event listings
- Membership pricing
- Range rules
- Shop products (browsing)

### Member Data

Requires authenticated member account:

- Member directory (names only)
- Member-only events
- Forum content
- Classifieds
- Meeting minutes (non-executive)
- Bylaws

### Sensitive Data

Restricted to specific roles:

| Data Type | Access |
|-----------|--------|
| Full member profiles | Admin, Dir. Memberships |
| Payment records | Admin, Treasurer |
| ID documents | Admin, Dir. Memberships |
| Background check consent | Admin, Dir. Memberships |
| Discipline cases | Admin, involved parties |
| Executive session minutes | BOD only |

### Confidential Data

Highest protection level:

| Data Type | Access | Storage |
|-----------|--------|---------|
| Passwords | System only | Hashed (never stored plain) |
| Payment card numbers | Stripe only | Never stored locally |
| SSN | Never collected | N/A |
| Individual votes | System only | Encrypted, anonymized |

---

## Data Privacy

### Personal Identifiable Information (PII)

| Field | PII? | Special Handling |
|-------|------|------------------|
| Name | Yes | — |
| Email | Yes | Hashed for lookup |
| Phone | Yes | — |
| Address | Yes | — |
| Date of birth | Yes | — |
| Government ID | Yes | Encrypted at rest |
| Photo | Yes | — |
| Badge number | No | — |

### Data Minimization

| Principle | Implementation |
|-----------|----------------|
| Collect only needed | No SSN, no unnecessary fields |
| Purpose limitation | Data used only for stated purpose |
| Storage limitation | Delete when no longer needed |

### Member Rights

| Right | How to Exercise |
|-------|-----------------|
| Access | Download own data from dashboard |
| Correction | Edit profile or request admin update |
| Deletion | Request account deletion (see retention) |
| Portability | Export data as JSON/CSV |
| Opt-out | Manage notification preferences |

### Data Subject Requests

| Request Type | Response Time | Process |
|--------------|---------------|---------|
| Access | 30 days | Automated export |
| Correction | 7 days | Self-service or admin |
| Deletion | 30 days | Manual review required |
| Portability | 30 days | Automated export |

---

## Data Retention

### Active Records

| Data Type | Retain While |
|-----------|--------------|
| Member profile | Membership active |
| Payment history | Membership active + 7 years |
| Event attendance | 7 years |
| Guest logs | 7 years |
| Volunteer hours | 7 years |

### After Membership Ends

| Data Type | Retention | Then |
|-----------|-----------|------|
| Contact info | 3 years | Delete |
| Payment history | 7 years | Delete |
| ID documents | 30 days | Delete |
| Match results | Permanent | Anonymize option |
| Forum posts | Permanent | Anonymize option |

### System Records

| Data Type | Retention |
|-----------|-----------|
| Audit logs | 7 years |
| Error logs | 90 days |
| Access logs | 90 days |
| Session records | 30 days after expiry |

### Deletion Process

| Step | Action |
|------|--------|
| Request received | Verify identity |
| Review | Check for legal holds |
| Execute | Soft delete (30 days) |
| Permanent | Hard delete after 30 days |
| Confirm | Notify requester |

---

## Encryption

### Data at Rest

| Data | Encryption |
|------|------------|
| Database | D1 encrypted by Cloudflare |
| File storage (R2) | AES-256 by Cloudflare |
| ID documents | Additional application-level encryption |
| Backups | Encrypted |

### Data in Transit

| Connection | Encryption |
|------------|------------|
| Browser to site | TLS 1.3 |
| API calls | TLS 1.3 |
| Worker to D1 | Internal Cloudflare network |
| Worker to external APIs | TLS 1.2+ |

### Sensitive Field Encryption

| Field | Method |
|-------|--------|
| ID document URL | Signed URLs (time-limited) |
| Background consent | Signed URLs |
| Individual ballot votes | Encrypted, key held by system |

---

## API Security

### Authentication

| Method | Use Case |
|--------|----------|
| Session cookie | Browser clients |
| Bearer token | Mobile app, integrations |

### Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Public | 60/min per IP |
| Authenticated | 100/min per user |
| Admin | 200/min per user |
| Login | 5/15min per IP |
| Sensitive operations | 10/hour per user |

### Input Validation

| Protection | Implementation |
|------------|----------------|
| SQL injection | Parameterized queries (Drizzle) |
| XSS | Output encoding, CSP |
| CSRF | SameSite cookies, CSRF tokens |
| Path traversal | Input sanitization |
| File upload | Type checking, virus scan |

### Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Audit Logging

### What's Logged

| Event | Details Captured |
|-------|------------------|
| Login | User, IP, device, success/fail |
| Logout | User, session duration |
| Password change | User, IP |
| Profile update | User, fields changed, old/new values |
| Payment | User, amount, success/fail |
| Admin action | Admin user, action, target, details |
| Permission change | Who, what role, by whom |
| Data export | User, what data |
| Data deletion | User, what data, by whom |

### Log Protection

| Measure | Implementation |
|---------|----------------|
| Tamper protection | Append-only, checksums |
| Access control | Admin read-only |
| Retention | 7 years |
| Backup | Separate from main data |

### Log Access

| Role | Can View |
|------|----------|
| Member | Own login history |
| Admin | All logs |
| Auditor | Read-only all logs |

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| Critical | Active breach, data exposed | Immediate |
| High | Vulnerability exploited, no data loss | 4 hours |
| Medium | Vulnerability discovered | 24 hours |
| Low | Security improvement needed | 1 week |

### Response Steps

| Phase | Actions |
|-------|---------|
| Identify | Detect and confirm incident |
| Contain | Stop ongoing damage |
| Eradicate | Remove threat |
| Recover | Restore normal operations |
| Learn | Post-incident review |

### Notification Requirements

| Incident Type | Notify |
|---------------|--------|
| Any breach | President immediately |
| Data exposure | Affected members within 72 hours |
| Payment fraud | Affected member + Stripe |
| Account compromise | Account owner immediately |

### Contact Chain

1. Tech contact (first responder)
2. President (decision authority)
3. Legal counsel (if needed)
4. Affected members (if data exposed)
5. Authorities (if legally required)

---

## Third-Party Security

### Vendor Requirements

| Vendor | Security Requirements |
|--------|----------------------|
| Stripe | PCI-DSS compliant |
| Cloudflare | SOC 2, ISO 27001 |
| Resend | SOC 2 |
| Twilio | SOC 2, ISO 27001 |

### Data Shared with Vendors

| Vendor | Data Shared | Purpose |
|--------|-------------|---------|
| Stripe | Email, payment method | Process payments |
| Resend | Email, name | Send emails |
| Twilio | Phone number | Send SMS |
| Sentry | Error context (no PII) | Error tracking |

### Vendor Access Review

| Frequency | Action |
|-----------|--------|
| Quarterly | Review API key usage |
| Annually | Review vendor security posture |
| On incident | Immediate vendor assessment |

---

## Compliance

### Applicable Standards

| Standard | Applicability |
|----------|---------------|
| PCI-DSS | Via Stripe (we don't store cards) |
| Texas Privacy Law | Member data protection |
| CAN-SPAM | Email communications |
| TCPA | SMS communications |

### Non-Profit Considerations

| Requirement | Implementation |
|-------------|----------------|
| 501(c)(3) records | 7-year retention |
| Donor privacy | Donations not publicly disclosed |
| Board records | Meeting minutes retained |

---

## Security Checklist

### Development

- [ ] Dependencies scanned for vulnerabilities
- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] Output encoding for all user data
- [ ] Parameterized database queries
- [ ] Error messages don't leak info

### Deployment

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging enabled
- [ ] Backups configured
- [ ] Monitoring alerts set

### Operations

- [ ] Access reviews quarterly
- [ ] Password rotation for shared accounts
- [ ] Incident response plan tested
- [ ] Vendor security reviewed annually
- [ ] Member data requests processed
- [ ] Audit logs reviewed monthly
