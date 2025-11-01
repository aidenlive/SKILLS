# Security Review Resources

Production-ready security patterns, checklists, and authentication examples for modern web applications.

---

## Contents

1. **owasp-checklist.md** - Comprehensive OWASP Top 10 security checklist
2. **auth-examples.js** - Complete authentication implementations
3. **README.md** - This file

---

## Quick Start

### 1. OWASP Security Checklist

The `owasp-checklist.md` file provides a comprehensive guide to securing your application against the OWASP Top 10 vulnerabilities (2021 edition).

**Use this when:**
- Preparing for production deployment
- Conducting security audits
- Training development teams
- Responding to security incidents

**What's included:**
- ✅ Detailed explanations for all 10 vulnerabilities
- ✅ Code examples (vulnerable vs. secure)
- ✅ Testing commands and procedures
- ✅ Quick reference checklists
- ✅ Incident response guidelines

**Example usage:**
```bash
# Review before deployment
cat owasp-checklist.md

# Print checklist
grep "^\- \[ \]" owasp-checklist.md

# Track progress in your issue tracker
```

### 2. Authentication Examples

The `auth-examples.js` file contains production-ready authentication patterns including:
- JWT authentication with refresh tokens
- OAuth2 integration (Google)
- Password hashing and validation
- Email verification
- Password reset flow
- Rate limiting
- Role-based authorization

**Copy-paste ready implementations:**

```javascript
import * as auth from './auth-examples.js';

// Use in your Express routes
app.post('/auth/login', auth.loginLimiter, async (req, res) => {
  await auth.login(req, res, db, logger);
});

// Protect routes
app.get('/profile', auth.authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only routes
app.delete('/users/:id',
  auth.authenticateToken,
  auth.authorize(['admin']),
  deleteUser
);
```

---

## File Details

### owasp-checklist.md

**Lines:** ~800
**Format:** Markdown with code examples
**Coverage:** OWASP Top 10 (2021)

**Sections:**
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

**Features:**
- 🔴 Priority levels (Critical, High, Medium)
- ✅ Actionable checklist items
- 🚫 Vulnerable code examples
- ✅ Secure code patterns
- 🧪 Testing commands
- 📝 Incident response procedures

---

### auth-examples.js

**Lines:** ~700
**Format:** JavaScript (ES modules)
**Dependencies:**
- bcrypt
- jsonwebtoken
- express-rate-limit
- crypto (Node.js built-in)

**Exported Functions:**

#### Password Management
```javascript
hashPassword(password)                    // Hash password with bcrypt
verifyPassword(password, hash)            // Verify password
validatePasswordStrength(password)        // Check password requirements
```

#### JWT Tokens
```javascript
generateAccessToken(payload)              // Create short-lived token (15m)
generateRefreshToken(payload)             // Create long-lived token (7d)
verifyAccessToken(token)                  // Verify access token
verifyRefreshToken(token)                 // Verify refresh token
```

#### Middleware
```javascript
authenticateToken(req, res, next)         // Require valid JWT
authorize(['admin'])(req, res, next)      // Require specific roles
optionalAuth(req, res, next)              // Optional authentication
```

#### Authentication Flows
```javascript
register(req, res, db, emailService)      // User registration
login(req, res, db, logger)               // User login
logout(req, res, db)                      // User logout
refreshAccessToken(req, res, db)          // Refresh token endpoint
```

#### Email Verification
```javascript
verifyEmail(req, res, db)                 // Verify email token
resendVerification(req, res, db, emailService) // Resend verification
```

#### Password Reset
```javascript
forgotPassword(req, res, db, emailService, logger) // Request reset
resetPassword(req, res, db, logger)                // Reset with token
```

#### OAuth2
```javascript
googleAuth(req, res)                      // Initiate Google OAuth
googleCallback(req, res, db, logger)      // Handle OAuth callback
```

#### Rate Limiters
```javascript
loginLimiter                              // 5 attempts per 15 min
registerLimiter                           // 3 registrations per hour
passwordResetLimiter                      // 3 resets per hour
```

---

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install bcrypt jsonwebtoken express-rate-limit
```

### Step 2: Configure Environment Variables

```bash
# .env
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=different-secret-for-refresh-tokens
NODE_ENV=production

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

### Step 3: Set Up Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification tokens
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_password_resets_token ON password_resets(token);
```

### Step 4: Implement Database Adapter

```javascript
// db-adapter.js
export const db = {
  users: {
    findByEmail: async (email) => { /* ... */ },
    findById: async (id) => { /* ... */ },
    create: async (data) => { /* ... */ },
    update: async (id, data) => { /* ... */ },
  },
  refreshTokens: {
    create: async (data) => { /* ... */ },
    findByToken: async (token) => { /* ... */ },
    revoke: async (token) => { /* ... */ },
    revokeAllForUser: async (userId) => { /* ... */ },
  },
  verificationTokens: {
    create: async (data) => { /* ... */ },
    findByToken: async (token) => { /* ... */ },
    delete: async (id) => { /* ... */ },
    deleteByUserId: async (userId) => { /* ... */ },
  },
  passwordResets: {
    create: async (data) => { /* ... */ },
    findByToken: async (token) => { /* ... */ },
    delete: async (id) => { /* ... */ },
  },
};
```

### Step 5: Set Up Routes

```javascript
// routes/auth.js
import express from 'express';
import * as auth from '../resources/auth-examples.js';
import { db } from '../db-adapter.js';
import { emailService } from '../email-service.js';
import { logger } from '../logger.js';

const router = express.Router();

// Public routes
router.post('/register', auth.registerLimiter, (req, res) =>
  auth.register(req, res, db, emailService)
);

router.post('/login', auth.loginLimiter, (req, res) =>
  auth.login(req, res, db, logger)
);

router.post('/refresh', (req, res) =>
  auth.refreshAccessToken(req, res, db)
);

router.post('/logout', (req, res) =>
  auth.logout(req, res, db)
);

router.get('/verify-email/:token', (req, res) =>
  auth.verifyEmail(req, res, db)
);

router.post('/resend-verification', (req, res) =>
  auth.resendVerification(req, res, db, emailService)
);

router.post('/forgot-password', auth.passwordResetLimiter, (req, res) =>
  auth.forgotPassword(req, res, db, emailService, logger)
);

router.post('/reset-password', (req, res) =>
  auth.resetPassword(req, res, db, logger)
);

// OAuth routes
router.get('/google', auth.googleAuth);
router.get('/google/callback', (req, res) =>
  auth.googleCallback(req, res, db, logger)
);

// Protected routes
router.get('/me', auth.authenticateToken, async (req, res) => {
  const user = await db.users.findById(req.user.userId);
  res.json(user);
});

export default router;
```

---

## Security Checklist

Before deploying, ensure you've completed:

### Authentication
- [ ] Passwords hashed with bcrypt (≥12 rounds)
- [ ] JWT_SECRET is strong (≥32 characters, random)
- [ ] Access tokens expire quickly (≤15 minutes)
- [ ] Refresh tokens stored in httpOnly cookies
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed attempts
- [ ] Email verification required

### Authorization
- [ ] All protected routes use authenticateToken middleware
- [ ] Role-based access control implemented
- [ ] Resource ownership verified before modifications
- [ ] Admin actions properly protected

### Configuration
- [ ] HTTPS enforced (no HTTP in production)
- [ ] Secure headers configured (use Helmet.js)
- [ ] CORS properly configured
- [ ] Error messages generic in production
- [ ] Environment variables for all secrets

### Database
- [ ] Database schema created with proper indexes
- [ ] Foreign key constraints configured
- [ ] Connection pooling configured
- [ ] Prepared statements used (prevent SQL injection)

### Monitoring
- [ ] Security events logged (login, logout, failures)
- [ ] Failed login attempts tracked
- [ ] Admin actions audited
- [ ] Log aggregation configured

---

## Testing

### Manual Testing

```bash
# Test registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Test protected route
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test token refresh
curl -X POST http://localhost:3000/auth/refresh \
  --cookie "refreshToken=YOUR_REFRESH_TOKEN"
```

### Rate Limiting Test

```bash
# Should block after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}';
  echo "\nAttempt $i";
done
```

---

## Common Issues

### Issue: JWT verification fails

**Solution:** Ensure JWT_SECRET environment variable is set and matches between token generation and verification.

### Issue: Refresh token not found in cookie

**Solution:** Check that:
- Cookie is set with correct domain
- HTTPS is enabled in production
- SameSite attribute is compatible with your setup

### Issue: CORS errors on authentication

**Solution:** Configure CORS to allow credentials:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### Issue: Password reset emails not sending

**Solution:** Implement email service with a provider (SendGrid, AWS SES, etc.)

---

## Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use HTTPS in production** - No exceptions
3. **Rotate secrets regularly** - JWT secrets, API keys
4. **Monitor failed login attempts** - Alert on suspicious activity
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Log security events** - Authentication, authorization failures
7. **Test authentication flows** - Include in CI/CD pipeline
8. **Use strong passwords** - Enforce password requirements
9. **Implement MFA** - Multi-factor authentication for sensitive operations
10. **Regular security audits** - Review OWASP checklist quarterly

---

## Additional Resources

- **OWASP Top 10:** https://owasp.org/Top10/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **OAuth 2.0 Spec:** https://oauth.net/2/
- **bcrypt Guide:** https://github.com/kelektiv/node.bcrypt.js
- **Express Security:** https://expressjs.com/en/advanced/best-practice-security.html

---

## Support

For questions or issues:
1. Review the OWASP checklist for specific vulnerabilities
2. Check code examples in auth-examples.js
3. Consult the main SKILL.md in parent directory
4. Review security best practices documentation

---

**Remember: Security is not a feature, it's a requirement.**
