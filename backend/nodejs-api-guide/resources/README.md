# Node.js API Guide Resources

Production-ready validation schemas and middleware for building type-safe, secure Node.js REST APIs.

---

## Contents

1. **validation-schemas.ts** - Comprehensive Zod validation schemas
2. **middleware-examples.ts** - Express middleware collection
3. **README.md** - This file

---

## Quick Start

### 1. Install Dependencies

```bash
npm install express typescript zod jsonwebtoken express-rate-limit helmet cors compression pino
npm install -D @types/express @types/jsonwebtoken @types/cors @types/compression
```

### 2. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 3. Environment Variables

```bash
# .env
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_REFRESH_SECRET=different-secret-for-refresh-tokens

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info

# Maintenance (optional)
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=We'll be back soon!
```

---

## File Details

### validation-schemas.ts

**Lines:** ~700
**Type:** TypeScript with Zod
**Coverage:** Complete API validation patterns

**Included Schemas:**

#### Common Helpers
- `uuidSchema` - UUID v4 validation
- `emailSchema` - Email with normalization
- `passwordSchema` - Strong password requirements
- `usernameSchema` - Alphanumeric usernames
- `urlSchema` - URL validation
- `phoneSchema` - International phone numbers
- `slugSchema` - URL-friendly slugs

#### Pagination & Filtering
- `paginationSchema` - Page, limit, sort params
- `searchSchema` - Search and filter params

#### User Management
- `userRegistrationSchema` - User registration with password confirmation
- `userLoginSchema` - Login credentials
- `userProfileUpdateSchema` - Profile updates
- `passwordChangeSchema` - Password change with validation
- `passwordResetSchema` - Password reset flow
- `emailVerificationSchema` - Email verification

#### Content Management
- `postCreateSchema` - Create posts/articles
- `postUpdateSchema` - Update posts
- `postQuerySchema` - Query and filter posts
- `commentCreateSchema` - Create comments
- `categoryCreateSchema` - Create categories

#### File Uploads
- `fileUploadSchema` - General file uploads
- `imageUploadSchema` - Image-specific validation

#### Settings
- `userSettingsSchema` - User preferences
- `apiKeyCreateSchema` - API key generation
- `webhookCreateSchema` - Webhook configuration

#### Moderation
- `userRoleUpdateSchema` - Change user roles
- `contentModerationSchema` - Content moderation actions
- `userBanSchema` - Ban users

**Helper Functions:**
- `validateBody()` - Validate request body
- `validateQuery()` - Validate query parameters
- `validateParams()` - Validate route parameters
- `parseQueryParams()` - Parse and validate query strings
- `booleanQueryParam` - Parse boolean from query
- `arrayQueryParam` - Parse array from query

---

### middleware-examples.ts

**Lines:** ~650
**Type:** TypeScript with Express
**Coverage:** Complete middleware patterns

**Included Middleware:**

#### Authentication & Authorization
- `authenticate` - Verify JWT token (required)
- `optionalAuth` - Verify JWT token (optional)
- `authorize()` - Role-based access control
- `authorizeOwnership` - Resource ownership verification
- `authorizeAdminOrOwner()` - Admin or owner check

#### Error Handling
- `AppError` - Custom error class
- `errorHandler` - Global error handler
- `notFoundHandler` - 404 handler
- `asyncHandler()` - Wrap async route handlers

#### Request Processing
- `requestId` - Add unique request ID
- `requestLogger` - Log all requests
- `parsePagination` - Parse pagination params
- `responseHelpers` - Add response helper methods

#### Security
- `securityHeaders` - Helmet configuration
- `corsMiddleware` - CORS with allowlist
- `requireContentType()` - Validate content type
- `requireJSON` - Require JSON content type

#### Rate Limiting
- `generalLimiter` - General API rate limit (100/15min)
- `authLimiter` - Auth endpoints (5/15min)
- `apiKeyLimiter` - API key rate limit (60/min)
- `uploadLimiter` - File uploads (10/hour)

#### Performance
- `compressionMiddleware` - Gzip compression

#### Utilities
- `apiVersion()` - API versioning
- `maintenanceMode` - Maintenance mode check
- `logger` - Pino logger instance

---

## Usage Examples

### Example 1: Basic Express Setup

```typescript
import express from 'express';
import * as middleware from './resources/middleware-examples';
import * as schemas from './resources/validation-schemas';

const app = express();

// Security & compression
app.use(middleware.securityHeaders);
app.use(middleware.corsMiddleware);
app.use(middleware.compressionMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request tracking
app.use(middleware.requestId);
app.use(middleware.requestLogger);

// Response helpers
app.use(middleware.responseHelpers);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Apply rate limiting to API routes
app.use('/api/', middleware.generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Error handlers (must be last)
app.use(middleware.notFoundHandler);
app.use(middleware.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  middleware.logger.info(`Server running on port ${PORT}`);
});
```

### Example 2: User Registration Route

```typescript
import { Router } from 'express';
import * as middleware from './resources/middleware-examples';
import { validateBody, userRegistrationSchema } from './resources/validation-schemas';
import * as userController from './controllers/user';

const router = Router();

router.post('/register',
  middleware.authLimiter,
  middleware.requireJSON,
  validateBody(userRegistrationSchema),
  middleware.asyncHandler(async (req, res) => {
    const user = await userController.register(req.body);
    (res as any).success(user, 'Registration successful');
  })
);

export default router;
```

### Example 3: Protected Routes with Authorization

```typescript
import { Router } from 'express';
import * as middleware from './resources/middleware-examples';
import { validateBody, validateQuery, postCreateSchema, postQuerySchema } from './resources/validation-schemas';

const router = Router();

// Public: List posts with pagination
router.get('/',
  validateQuery(postQuerySchema),
  middleware.parsePagination,
  middleware.asyncHandler(async (req, res) => {
    const posts = await postService.list(req.query, (req as any).pagination);
    (res as any).paginated(
      posts.data,
      posts.total,
      (req as any).pagination.page,
      (req as any).pagination.limit
    );
  })
);

// Protected: Create post
router.post('/',
  middleware.authenticate,
  middleware.requireJSON,
  validateBody(postCreateSchema),
  middleware.asyncHandler(async (req, res) => {
    const post = await postService.create(req.body, (req as any).user.userId);
    res.status(201).json(post);
  })
);

// Protected: Update own post or admin
router.patch('/:id',
  middleware.authenticate,
  middleware.asyncHandler(async (req, res) => {
    const post = await postService.findById(req.params.id);

    if (!post) {
      throw new middleware.AppError(404, 'Post not found');
    }

    // Check ownership or admin
    if (post.authorId !== (req as any).user.userId && (req as any).user.role !== 'admin') {
      throw new middleware.AppError(403, 'You do not have permission to edit this post');
    }

    const updated = await postService.update(req.params.id, req.body);
    (res as any).success(updated, 'Post updated successfully');
  })
);

// Admin only: Delete any post
router.delete('/:id',
  middleware.authenticate,
  middleware.authorize('admin'),
  middleware.asyncHandler(async (req, res) => {
    await postService.delete(req.params.id);
    res.status(204).send();
  })
);

export default router;
```

### Example 4: File Upload Route

```typescript
import { Router } from 'express';
import multer from 'multer';
import * as middleware from './resources/middleware-examples';
import { imageUploadSchema } from './resources/validation-schemas';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const router = Router();

router.post('/upload',
  middleware.authenticate,
  middleware.uploadLimiter,
  upload.single('image'),
  middleware.asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new middleware.AppError(400, 'No file uploaded');
    }

    // Validate file metadata
    const validation = imageUploadSchema.safeParse({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    if (!validation.success) {
      throw new middleware.AppError(400, 'Invalid file', true, validation.error.errors);
    }

    // Process upload
    const url = await uploadService.upload(req.file);

    (res as any).success({ url }, 'File uploaded successfully');
  })
);

export default router;
```

### Example 5: Custom Error Handling

```typescript
import * as middleware from './resources/middleware-examples';

// Create custom errors
throw new middleware.AppError(400, 'Invalid email format', true, {
  field: 'email',
  code: 'INVALID_EMAIL',
});

throw new middleware.AppError(404, 'User not found', true, {
  userId: req.params.id,
});

throw new middleware.AppError(409, 'Email already exists', true, {
  email: req.body.email,
});

// Use in controller
async function createUser(req: Request, res: Response) {
  const existingUser = await db.users.findByEmail(req.body.email);

  if (existingUser) {
    throw new middleware.AppError(409, 'Email already registered');
  }

  const user = await db.users.create(req.body);
  res.status(201).json(user);
}
```

---

## Testing

### Test Authentication Middleware

```typescript
import request from 'supertest';
import app from './app';
import jwt from 'jsonwebtoken';

describe('Authentication Middleware', () => {
  it('should reject requests without token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .expect(401);

    expect(res.body.error).toBe('Authentication required');
  });

  it('should accept requests with valid token', async () => {
    const token = jwt.sign(
      { userId: '123', email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
  });

  it('should reject expired tokens', async () => {
    const token = jwt.sign(
      { userId: '123', email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '-1h' } // Expired
    );

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(res.body.details.code).toBe('TOKEN_EXPIRED');
  });
});
```

### Test Validation Schemas

```typescript
import { userRegistrationSchema } from './resources/validation-schemas';

describe('User Registration Schema', () => {
  it('should validate correct data', () => {
    const validData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true,
    };

    const result = userRegistrationSchema.parse(validData);
    expect(result.email).toBe('test@example.com');
  });

  it('should reject weak passwords', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'weak',
      confirmPassword: 'weak',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true,
    };

    expect(() => userRegistrationSchema.parse(invalidData)).toThrow();
  });

  it('should reject mismatched passwords', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
      confirmPassword: 'Different123!@#',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true,
    };

    expect(() => userRegistrationSchema.parse(invalidData)).toThrow();
  });
});
```

---

## Project Structure

```
src/
├── resources/
│   ├── validation-schemas.ts    ✅ This file
│   ├── middleware-examples.ts   ✅ This file
│   └── README.md                ✅ This file
├── routes/
│   ├── auth.ts
│   ├── users.ts
│   └── posts.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── post.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── post.service.ts
├── models/
│   └── schema.ts (Drizzle ORM)
├── utils/
│   ├── email.ts
│   └── jwt.ts
├── app.ts
└── server.ts
```

---

## Best Practices

### 1. Always Validate Input

```typescript
// ❌ Don't trust raw input
app.post('/users', async (req, res) => {
  const user = await db.users.create(req.body); // UNSAFE
});

// ✅ Always validate
app.post('/users',
  validateBody(userRegistrationSchema),
  async (req, res) => {
    const user = await db.users.create(req.body); // Safe, validated
  }
);
```

### 2. Use Async Handler

```typescript
// ❌ Manual try-catch in every route
app.get('/users', async (req, res, next) => {
  try {
    const users = await db.users.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// ✅ Use asyncHandler
app.get('/users',
  middleware.asyncHandler(async (req, res) => {
    const users = await db.users.findAll();
    res.json(users);
  })
);
```

### 3. Proper Error Handling

```typescript
// ❌ Generic errors
throw new Error('Something went wrong');

// ✅ Specific errors with context
throw new middleware.AppError(404, 'User not found', true, {
  userId: req.params.id,
});
```

### 4. Always Use Authentication

```typescript
// ❌ Unprotected sensitive routes
app.delete('/users/:id', deleteUser);

// ✅ Protected with authentication and authorization
app.delete('/users/:id',
  middleware.authenticate,
  middleware.authorize('admin'),
  deleteUser
);
```

### 5. Rate Limit Sensitive Endpoints

```typescript
// ✅ Apply rate limiting
app.post('/auth/login', middleware.authLimiter, login);
app.post('/auth/register', middleware.registerLimiter, register);
app.post('/upload', middleware.uploadLimiter, upload);
```

---

## Troubleshooting

### Issue: JWT verification fails

**Solution:**
- Check JWT_SECRET environment variable is set
- Verify token hasn't expired
- Ensure token format is `Bearer TOKEN`

### Issue: CORS errors

**Solution:**
```typescript
// Add your frontend URL to ALLOWED_ORIGINS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Issue: Validation errors not clear

**Solution:**
```typescript
// Validation errors include detailed field information
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Issue: Rate limiting too strict

**Solution:**
```typescript
// Adjust rate limiter configuration
export const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increase limit
  skipSuccessfulRequests: true, // Don't count successful requests
});
```

---

## Additional Resources

- **Express.js:** https://expressjs.com/
- **Zod:** https://zod.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Pino Logger:** https://getpino.io/
- **Helmet.js:** https://helmetjs.github.io/
- **JWT:** https://jwt.io/

---

## Support

For questions or issues:
1. Check examples in this README
2. Review inline code documentation
3. Consult main SKILL.md in parent directory
4. Check TypeScript types for available options

---

**Remember: Always validate, always authenticate, always log.**
