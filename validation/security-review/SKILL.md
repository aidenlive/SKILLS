---
name: security-review
description: Security best practices covering XSS, CSRF, authentication, authorization, and data validation. Use when reviewing security, implementing auth systems, or auditing vulnerabilities.
version: 1.0.0
---

# Security Review Guide

## Purpose

Implement security best practices covering XSS, CSRF, authentication, authorization, and data validation. Secure applications that protect user data and prevent common vulnerabilities.

## When to Use This Skill

- Reviewing application security
- Implementing authentication systems
- Auditing for vulnerabilities
- Securing API endpoints
- Validating user input

## OWASP Top 10 (2021)

1. **Broken Access Control**
2. **Cryptographic Failures**
3. **Injection**
4. **Insecure Design**
5. **Security Misconfiguration**
6. **Vulnerable Components**
7. **Authentication Failures**
8. **Software and Data Integrity Failures**
9. **Security Logging Failures**
10. **Server-Side Request Forgery (SSRF)**

## Cross-Site Scripting (XSS) Prevention

### Types of XSS

1. **Stored XSS:** Malicious script stored in database
2. **Reflected XSS:** Malicious script in URL parameter
3. **DOM-based XSS:** Client-side manipulation of DOM

### Prevention Strategies

**Escape Output:**
```javascript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Safe - escape HTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
element.innerHTML = escapeHtml(userInput);

// ✅ Better - use textContent
element.textContent = userInput;
```

**React (Automatic Escaping):**
```jsx
// ✅ Safe by default
<div>{userInput}</div>

// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Only if you trust and sanitize
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

**Content Security Policy:**
```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
  "
>
```

## SQL Injection Prevention

### Use Parameterized Queries

**Node.js (PostgreSQL):**
```javascript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);

// ✅ Safe - parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
db.query(query, [email]);
```

**Python (FastAPI + SQLAlchemy):**
```python
# ❌ Vulnerable
query = f"SELECT * FROM users WHERE email = '{email}'"
db.execute(query)

# ✅ Safe - ORM
user = db.query(User).filter(User.email == email).first()

# ✅ Safe - parameterized
query = "SELECT * FROM users WHERE email = :email"
db.execute(query, {"email": email})
```

## Cross-Site Request Forgery (CSRF)

### CSRF Token Implementation

**Express.js:**
```javascript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
  // Process form
});
```

**React:**
```jsx
function Form() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch CSRF token from API
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(formData),
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### SameSite Cookie Attribute
```javascript
// Set secure cookies
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict', // or 'lax'
  maxAge: 3600000, // 1 hour
});
```

## Authentication Best Practices

### Password Hashing

**Node.js (bcrypt):**
```javascript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Python (bcrypt):**
```python
import bcrypt

# Hash password
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password.encode(), salt)

# Verify password
is_valid = bcrypt.checkpw(password.encode(), hashed)
```

### JWT Implementation

**Create Token:**
```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

**Verify Token:**
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Use middleware
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ data: 'Protected data', user: req.user });
});
```

### Refresh Tokens
```javascript
// Generate both tokens
const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

// Store refresh token in database
await db.query(
  'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
  [userId, refreshToken]
);

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

  // Check if token exists in database
  const tokenExists = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = $1',
    [refreshToken]
  );

  if (!tokenExists.rows[0]) {
    return res.sendStatus(403);
  }

  // Generate new access token
  const newAccessToken = jwt.sign(
    { userId: decoded.userId },
    SECRET,
    { expiresIn: '15m' }
  );

  res.json({ accessToken: newAccessToken });
});
```

## Authorization Patterns

### Role-Based Access Control (RBAC)
```javascript
function authorize(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.sendStatus(401);
    }

    if (!roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }

    next();
  };
}

// Usage
app.delete('/users/:id',
  authenticateToken,
  authorize(['admin']),
  deleteUser
);
```

### Resource-Based Authorization
```javascript
async function canEditPost(req, res, next) {
  const post = await db.query(
    'SELECT * FROM posts WHERE id = $1',
    [req.params.id]
  );

  if (!post.rows[0]) {
    return res.sendStatus(404);
  }

  // Check ownership or admin role
  if (post.rows[0].author_id !== req.user.id && req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  req.post = post.rows[0];
  next();
}

app.patch('/posts/:id', authenticateToken, canEditPost, updatePost);
```

## Input Validation

### Never Trust User Input

**Zod Validation:**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  age: z.number().int().positive().max(150).optional(),
});

app.post('/register', (req, res) => {
  try {
    const validated = userSchema.parse(req.body);
    // Use validated data
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});
```

**Sanitization:**
```javascript
import validator from 'validator';

// Sanitize input
const email = validator.normalizeEmail(req.body.email);
const username = validator.trim(req.body.username);
const description = validator.escape(req.body.description);
```

## Secure Headers

### Helmet.js (Express)
```javascript
import helmet from 'helmet';

app.use(helmet());

// Custom configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Essential Headers
```
# Prevent clickjacking
X-Frame-Options: DENY

# Prevent MIME sniffing
X-Content-Type-Options: nosniff

# XSS protection
X-XSS-Protection: 1; mode=block

# Force HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer policy
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limiting

### Express Rate Limit
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/auth/', authLimiter);
```

## Environment Variables

### Never Commit Secrets
```bash
# .env (NEVER commit this file)
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your-super-secret-key-min-32-characters
API_KEY=sk_live_xxxxxxxxxxxx

# .env.example (commit this)
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=generate-random-secret-min-32-chars
API_KEY=your_api_key_here
```

### Access Environment Variables
```javascript
// Node.js
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

## Logging and Monitoring

### Security Logging
```javascript
import pino from 'pino';

const logger = pino({
  level: 'info',
  redact: ['req.headers.authorization', 'password', 'token'],
});

// Log security events
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
```

### Monitor for Attacks
```javascript
// Detect brute force attempts
const loginAttempts = new Map();

app.post('/login', (req, res) => {
  const { email } = req.body;
  const attempts = loginAttempts.get(email) || 0;

  if (attempts >= 5) {
    logger.warn({ email, attempts }, 'Potential brute force attack');
    return res.status(429).json({
      error: 'Too many failed attempts. Account locked for 15 minutes.',
    });
  }

  // Attempt login...
  if (!success) {
    loginAttempts.set(email, attempts + 1);
    setTimeout(() => loginAttempts.delete(email), 15 * 60 * 1000);
  } else {
    loginAttempts.delete(email);
  }
});
```

## Dependency Security

### Audit Dependencies
```bash
# npm
npm audit
npm audit fix

# Yarn
yarn audit

# Check for outdated packages
npm outdated
```

### Use Dependabot/Renovate
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## File Upload Security

### Validation
```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  },
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename });
});
```

## Security Checklist

### Authentication
- [ ] Passwords hashed with bcrypt (≥12 rounds)
- [ ] JWT tokens with short expiration
- [ ] Refresh token rotation
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts

### Authorization
- [ ] Role-based access control implemented
- [ ] Resource ownership verified
- [ ] Admin actions properly protected

### Data Protection
- [ ] All user input validated
- [ ] SQL queries parameterized
- [ ] XSS prevention (escape output)
- [ ] CSRF tokens on state-changing requests
- [ ] Sensitive data encrypted at rest

### API Security
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Security headers set
- [ ] API keys not exposed

### Environment
- [ ] Secrets in environment variables
- [ ] .env file in .gitignore
- [ ] Production error messages generic
- [ ] Dependencies regularly updated
- [ ] Security logging enabled

## Common Vulnerabilities

### Insecure Direct Object References
```javascript
// ❌ Vulnerable
app.get('/users/:id', (req, res) => {
  const user = await db.getUser(req.params.id);
  res.json(user);
});

// ✅ Secure
app.get('/users/:id', authenticateToken, async (req, res) => {
  // Only allow users to access their own data
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return res.sendStatus(403);
  }
  const user = await db.getUser(req.params.id);
  res.json(user);
});
```

## Philosophy

**Security is not optional—it's fundamental.**

Validate all input. Escape all output. Authenticate every request. Authorize every action. Log everything. Trust nothing.

## Additional Resources

See `resources/` directory for:
- OWASP Top 10 detailed guide
- Authentication patterns
- Security testing tools
- Incident response procedures
