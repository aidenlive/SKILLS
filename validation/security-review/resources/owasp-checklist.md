# OWASP Top 10 Security Checklist

**Version:** 2021
**Last Updated:** October 2025
**Compliance Level:** Production-ready security standards

---

## How to Use This Checklist

1. **Pre-deployment:** Review all items before production release
2. **Regular audits:** Check quarterly for compliance
3. **Issue tracking:** Document findings and remediation
4. **Team training:** Share with all developers

**Priority Levels:**
- 🔴 **Critical:** Must fix before production
- 🟡 **High:** Fix within 30 days
- 🟢 **Medium:** Address in next sprint

---

## 1. Broken Access Control (A01:2021)

**Risk:** Users can access resources they shouldn't, modify data, or perform unauthorized actions.

### Checklist

- [ ] **Authentication required** for all protected routes
- [ ] **Authorization checks** verify user permissions
- [ ] **Resource ownership** validated before modification
- [ ] **Direct object references** use UUIDs, not sequential IDs
- [ ] **Admin routes** protected with role checks
- [ ] **API endpoints** enforce access control
- [ ] **File uploads** restrict paths and permissions
- [ ] **CORS configuration** limits allowed origins

### Code Examples

**❌ Vulnerable:**
```javascript
// Anyone can delete any post
app.delete('/api/posts/:id', async (req, res) => {
  await db.posts.delete(req.params.id);
  res.json({ success: true });
});
```

**✅ Secure:**
```javascript
// Verify ownership or admin role
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  const post = await db.posts.findById(req.params.id);

  if (!post) return res.status(404).json({ error: 'Not found' });

  // Check authorization
  if (post.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await db.posts.delete(req.params.id);
  res.json({ success: true });
});
```

### Testing

```bash
# Test unauthorized access
curl -X DELETE https://api.example.com/posts/123
# Expected: 401 Unauthorized

# Test accessing other users' data
curl -H "Authorization: Bearer USER_A_TOKEN" \
  https://api.example.com/users/USER_B_ID
# Expected: 403 Forbidden
```

---

## 2. Cryptographic Failures (A02:2021)

**Risk:** Sensitive data exposed through weak encryption, plain text storage, or insecure transmission.

### Checklist

- [ ] **HTTPS enforced** on all pages (no HTTP)
- [ ] **Passwords hashed** with bcrypt/Argon2 (≥12 rounds)
- [ ] **Sensitive data encrypted** at rest (database)
- [ ] **TLS 1.2+** configured (disable TLS 1.0/1.1)
- [ ] **Secrets rotated** regularly (API keys, tokens)
- [ ] **No secrets in code** (use environment variables)
- [ ] **PII encrypted** in database (credit cards, SSN)
- [ ] **Secure key storage** (AWS KMS, HashiCorp Vault)

### Code Examples

**❌ Vulnerable:**
```javascript
// Plain text password storage
const user = {
  email: 'user@example.com',
  password: 'password123', // NEVER DO THIS
};
```

**✅ Secure:**
```javascript
import bcrypt from 'bcrypt';

// Hash password before storing
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

const user = {
  email: 'user@example.com',
  password: hashedPassword,
};

// Verify password on login
const isValid = await bcrypt.compare(inputPassword, user.password);
```

### HTTPS Enforcement

```javascript
// Express.js - Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 3. Injection (A03:2021)

**Risk:** Malicious data sent to interpreters (SQL, NoSQL, OS commands, LDAP).

### Checklist

- [ ] **Parameterized queries** for all database operations
- [ ] **ORMs used** (Prisma, Sequelize, SQLAlchemy)
- [ ] **Input validation** on all user data
- [ ] **NoSQL injection** prevented (MongoDB, Redis)
- [ ] **Command injection** prevented (no shell commands from user input)
- [ ] **LDAP injection** prevented
- [ ] **XML injection** prevented
- [ ] **Template injection** prevented

### SQL Injection Prevention

**❌ Vulnerable:**
```javascript
// String concatenation - NEVER DO THIS
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);

// Attacker sends: ' OR '1'='1
// Resulting query: SELECT * FROM users WHERE email = '' OR '1'='1'
// Returns ALL users!
```

**✅ Secure:**
```javascript
// Parameterized query
const email = req.body.email;
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// Or use an ORM
const user = await db.users.findOne({ where: { email } });
```

### NoSQL Injection Prevention

**❌ Vulnerable:**
```javascript
// MongoDB - vulnerable to injection
const user = await User.findOne({ email: req.body.email });
// Attacker sends: { email: { $gt: "" } }
// Returns first user!
```

**✅ Secure:**
```javascript
// Validate and sanitize input
const emailSchema = z.string().email();
const email = emailSchema.parse(req.body.email);
const user = await User.findOne({ email });
```

---

## 4. Insecure Design (A04:2021)

**Risk:** Fundamental flaws in system architecture and design.

### Checklist

- [ ] **Threat modeling** completed for application
- [ ] **Security requirements** defined in design phase
- [ ] **Defense in depth** implemented (multiple security layers)
- [ ] **Fail securely** (errors don't expose data)
- [ ] **Least privilege** principle applied
- [ ] **Secure defaults** configured
- [ ] **Rate limiting** on sensitive operations
- [ ] **Business logic** validated server-side

### Design Patterns

**Security by Design:**
```javascript
// Multi-layered security approach
class UserService {
  async updateProfile(userId, data) {
    // Layer 1: Authentication (handled by middleware)
    // Layer 2: Authorization
    if (userId !== req.user.id && req.user.role !== 'admin') {
      throw new UnauthorizedError();
    }

    // Layer 3: Input validation
    const validated = updateProfileSchema.parse(data);

    // Layer 4: Business logic validation
    if (validated.email) {
      const existing = await this.findByEmail(validated.email);
      if (existing && existing.id !== userId) {
        throw new ConflictError('Email already in use');
      }
    }

    // Layer 5: Database constraints
    return await db.users.update(userId, validated);
  }
}
```

---

## 5. Security Misconfiguration (A05:2021)

**Risk:** Default configurations, unnecessary features, verbose errors expose vulnerabilities.

### Checklist

- [ ] **Security headers** configured (CSP, HSTS, X-Frame-Options)
- [ ] **Error messages** generic in production
- [ ] **Debug mode** disabled in production
- [ ] **Default credentials** changed
- [ ] **Unused features** disabled
- [ ] **Directory listing** disabled
- [ ] **Admin interfaces** protected
- [ ] **Cloud storage** permissions configured

### Security Headers

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

### Error Handling

**❌ Verbose errors (production):**
```javascript
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // NEVER expose stack traces
    query: req.query, // NEVER expose request details
  });
});
```

**✅ Secure error handling:**
```javascript
app.use((err, req, res, next) => {
  // Log full error server-side
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    userId: req.user?.id,
  });

  // Generic message to client
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});
```

---

## 6. Vulnerable and Outdated Components (A06:2021)

**Risk:** Using libraries with known vulnerabilities.

### Checklist

- [ ] **Dependencies audited** weekly (`npm audit`)
- [ ] **Automated updates** configured (Dependabot/Renovate)
- [ ] **Unused dependencies** removed
- [ ] **Version pinning** in package.json
- [ ] **Security advisories** monitored
- [ ] **Supply chain** verified (package signatures)
- [ ] **Deprecated packages** replaced
- [ ] **License compliance** checked

### Automation

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

```bash
# Run security audit
npm audit

# Fix automatically (careful in production)
npm audit fix

# Check outdated packages
npm outdated

# Remove unused dependencies
npm prune
```

---

## 7. Identification and Authentication Failures (A07:2021)

**Risk:** Broken authentication allows attackers to impersonate users.

### Checklist

- [ ] **Multi-factor authentication** available
- [ ] **Password complexity** enforced (min 8 chars, complexity)
- [ ] **Brute force protection** implemented
- [ ] **Session management** secure (httpOnly, secure cookies)
- [ ] **Password reset** secure (token-based, expiring)
- [ ] **Account enumeration** prevented
- [ ] **Weak password list** checked against
- [ ] **Session timeout** configured

### Secure Authentication Flow

```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Rate limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.post('/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Find user (use same timing for found/not found to prevent enumeration)
  const user = await db.users.findByEmail(email);

  if (!user) {
    // Use same bcrypt compare to prevent timing attacks
    await bcrypt.compare(password, '$2b$12$dummyhashfortimingattacks');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    // Log failed attempt
    logger.warn({ email, ip: req.ip }, 'Failed login attempt');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(423).json({
      error: 'Account locked. Try again later.'
    });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store refresh token
  await db.refreshTokens.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Set secure cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});
```

---

## 8. Software and Data Integrity Failures (A08:2021)

**Risk:** Code or infrastructure relies on plugins, libraries, or modules from untrusted sources.

### Checklist

- [ ] **Package lock files** committed (package-lock.json)
- [ ] **Subresource Integrity** (SRI) for CDN resources
- [ ] **Code signing** for deployments
- [ ] **CI/CD pipeline** secured
- [ ] **Update process** verified
- [ ] **Serialization** secure (avoid deserializing untrusted data)
- [ ] **Digital signatures** verified

### Subresource Integrity

```html
<!-- CDN resources with SRI -->
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxX8W/lj..."
  crossorigin="anonymous">
</script>
```

### Secure Serialization

**❌ Vulnerable:**
```javascript
// Never deserialize untrusted data
const data = JSON.parse(userInput); // Could be malicious
eval(userInput); // NEVER DO THIS
```

**✅ Secure:**
```javascript
import { z } from 'zod';

// Validate deserialized data
const schema = z.object({
  id: z.number(),
  name: z.string(),
});

try {
  const data = JSON.parse(userInput);
  const validated = schema.parse(data);
  // Use validated data
} catch (error) {
  // Invalid data
}
```

---

## 9. Security Logging and Monitoring Failures (A09:2021)

**Risk:** Without logging and monitoring, breaches cannot be detected.

### Checklist

- [ ] **All authentication** events logged
- [ ] **Authorization failures** logged
- [ ] **Input validation failures** logged
- [ ] **Logs centralized** (CloudWatch, DataDog, Sentry)
- [ ] **Sensitive data** redacted from logs
- [ ] **Alerts configured** for suspicious activity
- [ ] **Log retention** policy defined
- [ ] **Audit trail** for sensitive operations

### Structured Logging

```javascript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'accessToken',
      'refreshToken',
    ],
    remove: true,
  },
});

// Log security events
logger.info({
  event: 'user_login',
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
}, 'User logged in');

logger.warn({
  event: 'failed_login',
  email: req.body.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
}, 'Failed login attempt');

logger.error({
  event: 'unauthorized_access',
  userId: req.user?.id,
  resource: req.path,
  ip: req.ip,
}, 'Unauthorized access attempt');

// Log admin actions
logger.warn({
  event: 'admin_action',
  adminId: req.user.id,
  action: 'delete_user',
  targetUserId: req.params.id,
}, 'Admin deleted user');
```

---

## 10. Server-Side Request Forgery (SSRF) (A10:2021)

**Risk:** Application fetches remote resources without validating user-supplied URLs.

### Checklist

- [ ] **URL validation** before fetching
- [ ] **Allowlist** of permitted domains
- [ ] **Private IP ranges** blocked (localhost, 192.168.x.x, 10.x.x.x)
- [ ] **URL redirects** disabled or validated
- [ ] **Network segmentation** implemented
- [ ] **Metadata endpoints** blocked (169.254.169.254)

### SSRF Prevention

**❌ Vulnerable:**
```javascript
// User controls URL - DANGEROUS
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url); // SSRF vulnerability
  res.send(await response.text());
});

// Attacker sends: ?url=http://localhost:6379/
// Or: ?url=http://169.254.169.254/latest/meta-data/
```

**✅ Secure:**
```javascript
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];

app.get('/fetch', async (req, res) => {
  const url = req.query.url;

  // Parse and validate URL
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Check protocol
  if (parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only HTTPS allowed' });
  }

  // Check domain allowlist
  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    return res.status(400).json({ error: 'Domain not allowed' });
  }

  // Block private IP ranges
  const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|169\.254\.)/;
  if (privateIpRegex.test(parsed.hostname)) {
    return res.status(400).json({ error: 'Private IPs not allowed' });
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'error', // Don't follow redirects
    });
    clearTimeout(timeout);
    res.send(await response.text());
  } catch (error) {
    clearTimeout(timeout);
    res.status(500).json({ error: 'Fetch failed' });
  }
});
```

---

## Quick Reference

### Security Headers Checklist

```
✓ Content-Security-Policy
✓ Strict-Transport-Security
✓ X-Content-Type-Options: nosniff
✓ X-Frame-Options: DENY
✓ X-XSS-Protection: 1; mode=block
✓ Referrer-Policy: strict-origin-when-cross-origin
✓ Permissions-Policy
```

### Authentication Checklist

```
✓ Passwords hashed with bcrypt (≥12 rounds)
✓ JWT tokens with expiration (≤15 minutes for access)
✓ Refresh tokens stored securely
✓ Rate limiting on auth endpoints
✓ Account lockout after failed attempts
✓ Secure password reset flow
```

### Input Validation Checklist

```
✓ All user input validated with schemas (Zod/Pydantic)
✓ SQL queries parameterized
✓ NoSQL queries sanitized
✓ File uploads validated (type, size, name)
✓ URLs validated before fetching
✓ HTML output escaped
```

---

## Incident Response

### When a vulnerability is found:

1. **Assess severity** (use CVSS scoring)
2. **Contain the threat** (disable affected features)
3. **Notify stakeholders** (security team, management)
4. **Develop fix** (patch vulnerability)
5. **Test thoroughly** (verify fix doesn't break functionality)
6. **Deploy fix** (follow change management process)
7. **Monitor** (watch for continued exploitation attempts)
8. **Document** (post-mortem, lessons learned)

### Severity Levels

- **Critical (9.0-10.0):** Fix immediately (within hours)
- **High (7.0-8.9):** Fix within 24-48 hours
- **Medium (4.0-6.9):** Fix within 1-2 weeks
- **Low (0.1-3.9):** Fix in next release

---

## Additional Resources

- **OWASP Foundation:** https://owasp.org
- **OWASP Top 10 (2021):** https://owasp.org/Top10/
- **OWASP Cheat Sheet Series:** https://cheatsheetseries.owasp.org/
- **OWASP ZAP (Security Testing):** https://www.zaproxy.org/
- **CWE Database:** https://cwe.mitre.org/

---

**Remember:** Security is a continuous process, not a one-time checklist. Review regularly and stay updated on emerging threats.
