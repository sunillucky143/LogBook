# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in LogBook, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report vulnerabilities by emailing the maintainer or using
[GitHub's private vulnerability reporting](https://github.com/sunillucky143/LogBook/security/advisories/new).

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to expect

- Acknowledgment within 48 hours
- An assessment and plan within 7 days
- A fix released as soon as practical, with credit to the reporter (unless anonymity is preferred)

## Security Best Practices for Contributors

- Never commit secrets (API keys, passwords, tokens) to the repository
- Use environment variables for all sensitive configuration
- Use parameterized queries -- never concatenate user input into SQL
- Validate and sanitize all user input at API boundaries
- Keep dependencies up to date
- Do not expose internal error messages to API consumers

## Known Security Measures

- **Authentication**: All API endpoints require Clerk JWT verification
- **Authorization**: Admin endpoints are restricted by role-based access control
- **Rate Limiting**: IP-based rate limiting on all endpoints, per-user monthly limits on AI features
- **Input Validation**: Request validation at handler level with structured error responses
- **CORS**: Configured to allow only the frontend origin
- **Error Handling**: Internal errors are never exposed to clients
