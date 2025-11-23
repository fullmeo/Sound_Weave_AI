# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@soundweave.dev instead of using the issue tracker.

## Supported Versions

| Version | Supported          |
|---------|------------------|
| 1.x     | ✅ Current        |
| < 1.0   | ❌ Not supported   |

## Security Practices

### API Security
- ✅ API keys server-side only
- ✅ Input validation on all endpoints
- ✅ Rate limiting (10 req/min)
- ✅ Request timeouts (120s)
- ✅ Helmet security headers
- ✅ CORS properly configured

### Code Security
- ✅ No eval() with user input
- ✅ No SQL injection vectors
- ✅ No hardcoded secrets
- ✅ Structured error responses
- ✅ Security headers enabled

### Production Deployment
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS/TLS
- ✅ Keep dependencies updated
- ✅ Monitor logs for suspicious activity
- ✅ Use strong CORS origins

## Vulnerability Disclosure

1. Do not open a public issue
2. Email: security@soundweave.dev
3. Include: description, steps, impact
4. Allow time for us to respond and fix

## Dependency Security

We use npm audit to check dependencies:

```bash
npm audit
npm audit fix
```

Keep dependencies updated:

```bash
npm update
```

## Best Practices

When deploying SoundWeave:

1. **Secrets**: Use environment variables, never commit to git
2. **HTTPS**: Use TLS in production
3. **Monitoring**: Log and monitor API usage
4. **Updates**: Keep Node.js and dependencies current
5. **Backups**: Backup your audio files and metadata

---

Thank you for helping keep SoundWeave secure!
