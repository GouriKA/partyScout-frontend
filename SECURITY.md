# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: scout@partyscout.live

Or use GitHub's private vulnerability reporting:
1. Go to the repository's Security tab
2. Click "Report a vulnerability"
3. Fill out the form with details

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | 48 hours |
| Initial assessment | 1 week |
| Fix development | 2-4 weeks |
| Public disclosure | After fix deployed |

---

## Security Measures

### Data Handling

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Venue search queries | Not stored in browser | None |
| Firebase auth token | Browser memory (not localStorage) | Session only |
| Saved events | Sent to backend (Cloud SQL) | Until user deletes |
| Feedback form | Sent to backend; not stored on frontend | None |

**We do not**:
- Store API keys in frontend code or environment (they are backend-only)
- Use cookies for tracking
- Log personal information in the browser

### Frontend Security

| Measure | Implementation |
|---------|----------------|
| HTTPS | Enforced by load balancer |
| Auth tokens | Firebase ID tokens; not stored in localStorage |
| XSS | React escapes all rendered content by default |
| CORS | Backend enforces origin allowlist |
| Content Security Policy | Set via nginx headers |

### Secrets

Frontend build-time variables (`VITE_FIREBASE_*`) are Firebase project config — these are public by design (Firebase security is enforced by Firebase Security Rules, not by hiding the config).

**Never put** Google Places API keys, Anthropic API keys, SMTP passwords, or database credentials in frontend code or `.env` files committed to git.

---

## Known Limitations

| Gap | Risk | Mitigation |
|-----|------|------------|
| Firebase config in build output | Low (Firebase config is public) | Firebase Security Rules enforce access control |
| No rate limiting on chat SSE | DoS possible | Backend Anthropic API key limits exposure |

---

## Compliance

### GDPR
- No personal data stored in the browser beyond the session
- Saved events stored server-side can be deleted by the user at any time

### COPPA
- Parents are the users, not children
- No data collected directly from children
- No account required for core venue search

---

## Security Contacts

| Role | Contact |
|------|---------|
| Security Lead | scout@partyscout.live |
| Project Owner | gouri.alampalli@gmail.com |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-31 | Updated contact email; added auth token and saved events data handling |
| 2026-01-29 | Initial security policy |
