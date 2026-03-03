# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do NOT open a public issue.**

Send an email to **vetreriamonferrina@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

We will respond within 48 hours.

## Security Measures

This project implements the following security measures:

### Application Security

- **Input sanitization** — All form inputs are sanitized server-side (HTML stripping, email header injection prevention)
- **Server-side validation** — All form data is validated before processing
- **Honeypot field** — Bot detection on the quote form
- **Rate limiting** — 5 requests per minute per IP on the API endpoint
- **CSRF protection** — Origin header verification on API routes
- **No user-generated content** — Static site with no database or user accounts

### Infrastructure Security

- **HTTPS only** — Enforced via Cloudflare and Vercel
- **Security headers** — CSP, HSTS (12 months + preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (configured in `vercel.json`)
- **Cloudflare WAF** — Bot Fight Mode, AI Bot Blocking, Page Shield
- **TLS 1.2 minimum** — TLS 1.3 preferred
- **Email obfuscation** — Cloudflare email address obfuscation
- **Hotlink protection** — Cloudflare hotlink protection on images

### Secrets Management

- All secrets are stored as environment variables (Vercel Environment Variables)
- No secrets are committed to the repository
- API keys are restricted by service and domain in their respective platforms
- `.env.example` contains only placeholder values

### Dependencies

- Dependencies are kept up to date via Dependabot
- Pre-commit hooks run linting and formatting checks
- CI pipeline runs on every push and pull request
