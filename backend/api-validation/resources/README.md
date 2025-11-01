# API Validation Resources

Production-ready validation schemas and error formatters for type-safe API development with Zod (TypeScript) and Pydantic (Python).

---

## Contents

1. **zod-schemas.ts** - Comprehensive Zod validation schemas for Node.js/TypeScript
2. **pydantic-models.py** - Comprehensive Pydantic models for Python/FastAPI
3. **error-formatters.ts** - Standardized error formatting utilities
4. **README.md** - This file

---

## Quick Start

### Zod (Node.js/TypeScript)

**Installation:**
```bash
npm install zod
```

**Basic Usage:**
```typescript
import { userRegistrationSchema, validateBody } from './zod-schemas';

// In Express route
router.post('/register', validateBody(userRegistrationSchema), async (req, res) => {
  // req.body is now type-safe and validated
  const user = await userService.create(req.body);
  res.json(user);
});
```

### Pydantic (Python/FastAPI)

**Installation:**
```bash
pip install "pydantic[email]"
```

**Basic Usage:**
```python
from pydantic_models import UserRegistration, UserResponse
from fastapi import FastAPI

app = FastAPI()

@app.post('/register', response_model=UserResponse)
async def register(user: UserRegistration):
    # user is automatically validated
    created_user = await user_service.create(user)
    return created_user
```

---

## Zod Schemas (TypeScript)

### Available Schemas

#### User Management
- `userRegistrationSchema` - User registration with password confirmation
- `userLoginSchema` - Login credentials
- `userProfileUpdateSchema` - Profile updates
- `passwordChangeSchema` - Password change with validation
- `passwordResetRequestSchema` - Request password reset
- `passwordResetSchema` - Reset password with token
- `emailVerificationSchema` - Email verification

#### Content Management
- `postCreateSchema` - Create posts/articles
- `postUpdateSchema` - Update posts (partial)
- `postQuerySchema` - Query with pagination and filters
- `commentCreateSchema` - Create comments
- `categoryCreateSchema` - Create categories

#### Pagination & Search
- `paginationSchema` - Page, limit, sort parameters
- `searchSchema` - Search and filter parameters

#### File Uploads
- `fileUploadSchema` - General file uploads
- `imageUploadSchema` - Image-specific validation

#### Settings
- `userSettingsSchema` - User preferences
- `apiKeyCreateSchema` - API key generation
- `webhookCreateSchema` - Webhook configuration

#### Admin
- `userRoleUpdateSchema` - Change user roles
- `contentModerationSchema` - Moderate content
- `userBanSchema` - Ban users

### Common Validation Helpers

```typescript
import {
  emailSchema,      // Email with normalization
  passwordSchema,   // Strong password requirements
  usernameSchema,   // Alphanumeric + underscore
  urlSchema,        // Valid URL
  phoneSchema,      // International phone (E.164)
  slugSchema,       // URL-friendly slug
  uuidSchema,       // UUID v4
  isoDateSchema,    // ISO 8601 date string
  dateSchema,       // Date coercion
} from './zod-schemas';
```

### Usage Examples

**Express Route with Validation:**
```typescript
import express from 'express';
import { validateBody, validateQuery, userRegistrationSchema, paginationSchema } from './resources';

const router = express.Router();

// Validate request body
router.post('/users',
  validateBody(userRegistrationSchema),
  async (req, res) => {
    // req.body is validated and type-safe
    const user = await createUser(req.body);
    res.status(201).json(user);
  }
);

// Validate query parameters
router.get('/users',
  validateQuery(paginationSchema),
  async (req, res) => {
    // req.query is validated with defaults applied
    const users = await listUsers(req.query);
    res.json(users);
  }
);
```

**Manual Validation:**
```typescript
import { validateSafe, userLoginSchema } from './resources';

const result = validateSafe(userLoginSchema, req.body);

if (!result.success) {
  // result.error contains formatted error response
  return res.status(400).json(result.error);
}

// result.data is validated and type-safe
const { email, password } = result.data;
```

**Type Inference:**
```typescript
import { userRegistrationSchema } from './zod-schemas';
import type { z } from 'zod';

// Automatically infer TypeScript type from schema
type UserRegistration = z.infer<typeof userRegistrationSchema>;

// Use in function signatures
async function createUser(data: UserRegistration) {
  // data is fully typed
}
```

**Custom Validation:**
```typescript
import { z } from 'zod';

const customSchema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
}).refine(data => data.age >= 18, {
  message: 'Must be 18 or older',
  path: ['age'],
});
```

**Nested Objects:**
```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{5}$/),
});

const userWithAddressSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: addressSchema,
});
```

**Arrays:**
```typescript
const tagsSchema = z.array(z.string())
  .min(1, 'At least one tag is required')
  .max(10, 'Maximum 10 tags allowed');

const postSchema = z.object({
  title: z.string(),
  tags: tagsSchema,
});
```

**Enums:**
```typescript
const statusSchema = z.enum(['draft', 'published', 'archived']);
// or
const statusSchema = z.union([
  z.literal('draft'),
  z.literal('published'),
  z.literal('archived'),
]);
```

---

## Pydantic Models (Python)

### Available Models

#### User Management
- `UserRegistration` - User registration with password confirmation
- `UserLogin` - Login credentials
- `UserProfileUpdate` - Profile updates
- `PasswordChange` - Password change with validation
- `PasswordResetRequest` - Request password reset
- `PasswordReset` - Reset password with token
- `EmailVerification` - Email verification

#### Response Models
- `UserResponse` - Public user data
- `UserProfile` - Full user profile

#### Content Management
- `PostCreate` - Create posts
- `PostUpdate` - Update posts
- `PostQuery` - Query with pagination
- `CommentCreate` - Create comments
- `CategoryCreate` - Create categories

#### Pagination & Search
- `PaginationParams` - Pagination parameters
- `SearchParams` - Search and filters

#### File Uploads
- `FileUpload` - General file metadata
- `ImageUpload` - Image-specific metadata

#### Settings
- `UserSettings` - User preferences
- `NotificationSettings` - Notification preferences
- `PrivacySettings` - Privacy preferences
- `ApiKeyCreate` - API key generation
- `WebhookCreate` - Webhook configuration

#### Admin
- `UserRoleUpdate` - Change user roles
- `ContentModeration` - Moderate content
- `UserBan` - Ban users

### Usage Examples

**FastAPI Route:**
```python
from fastapi import FastAPI, HTTPException
from pydantic_models import UserRegistration, UserResponse

app = FastAPI()

@app.post('/users/', response_model=UserResponse)
async def create_user(user: UserRegistration):
    # FastAPI automatically validates the request body
    # If validation fails, returns 422 with detailed errors

    try:
        created_user = await user_service.create(user)
        return created_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Manual Validation:**
```python
from pydantic import ValidationError
from pydantic_models import UserRegistration, format_validation_error

try:
    user = UserRegistration(**request_data)
except ValidationError as e:
    error_response = format_validation_error(e)
    return error_response.dict(), 400
```

**Custom Validators:**
```python
from pydantic import BaseModel, validator

class User(BaseModel):
    email: str
    age: int

    @validator('email')
    def email_lowercase(cls, v):
        return v.lower()

    @validator('age')
    def age_must_be_adult(cls, v):
        if v < 18:
            raise ValueError('Must be 18 or older')
        return v
```

**Root Validators:**
```python
from pydantic import BaseModel, root_validator

class PasswordConfirm(BaseModel):
    password: str
    confirm_password: str

    @root_validator
    def passwords_match(cls, values):
        if values.get('password') != values.get('confirm_password'):
            raise ValueError('Passwords do not match')
        return values
```

**Nested Models:**
```python
class Address(BaseModel):
    street: str
    city: str
    zip: str

class User(BaseModel):
    name: str
    email: str
    address: Address
```

---

## Error Formatters

### Standard Error Format

All validation errors follow this consistent format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

### Usage

**Express Middleware:**
```typescript
import { validateBody, errorHandler } from './error-formatters';
import { userSchema } from './zod-schemas';

app.post('/users', validateBody(userSchema), createUser);

// Global error handler (must be last)
app.use(errorHandler);
```

**Manual Error Formatting:**
```typescript
import { formatZodError, createValidationError } from './error-formatters';

try {
  const data = userSchema.parse(req.body);
} catch (error) {
  if (error instanceof ZodError) {
    const formattedError = formatZodError(error, req.path);
    return res.status(400).json(formattedError);
  }
}
```

**Custom Errors:**
```typescript
import { ValidationError, createValidationError } from './error-formatters';

// Throw custom validation error
throw new ValidationError(
  createValidationError('User already exists', [
    { field: 'email', message: 'Email is already registered' }
  ])
);
```

**Response Helpers:**
```typescript
import { sendSuccess, sendError, sendPaginated } from './error-formatters';

// Success response
sendSuccess(res, user, 'User created successfully', 201);

// Error response
sendError(res, 'User not found', 404);

// Paginated response
sendPaginated(res, users, total, page, limit);
```

---

## Integration Guide

### Complete Express Setup

```typescript
import express from 'express';
import { errorHandler, validateBody } from './resources/error-formatters';
import { userRegistrationSchema, paginationSchema } from './resources/zod-schemas';

const app = express();

// Body parsing
app.use(express.json());

// Routes with validation
app.post('/users',
  validateBody(userRegistrationSchema),
  async (req, res, next) => {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

app.get('/users',
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const users = await userService.list(req.query);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
);

// Error handler (must be last)
app.use(errorHandler);

app.listen(3000);
```

### Complete FastAPI Setup

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from pydantic_models import (
    UserRegistration,
    UserResponse,
    format_validation_error,
)

app = FastAPI()

# Validation error handler
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    error_response = format_validation_error(exc)
    return JSONResponse(
        status_code=400,
        content=error_response.dict()
    )

# Routes
@app.post('/users/', response_model=UserResponse)
async def create_user(user: UserRegistration):
    try:
        created_user = await user_service.create(user)
        return created_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/users/', response_model=list[UserResponse])
async def list_users(
    page: int = 1,
    limit: int = 20
):
    users = await user_service.list(page, limit)
    return users
```

---

## Best Practices

### 1. Validate at the Edge

Always validate input at the API boundary before processing:

```typescript
// ✅ Good
app.post('/users', validateBody(userSchema), createUser);

// ❌ Bad
app.post('/users', async (req, res) => {
  // No validation - unsafe
  await createUser(req.body);
});
```

### 2. Use Type Inference

Let validation schemas generate TypeScript types:

```typescript
// ✅ Good
type User = z.infer<typeof userSchema>;

// ❌ Bad - maintaining types separately
interface User {
  email: string;
  password: string;
}
const userSchema = z.object({ ... });
```

### 3. Provide Clear Error Messages

```typescript
// ✅ Good
z.string().min(8, 'Password must be at least 8 characters')

// ❌ Bad
z.string().min(8) // Generic error message
```

### 4. Sanitize Inputs

```typescript
const emailSchema = z.string()
  .email()
  .transform(email => email.toLowerCase().trim());
```

### 5. Use Refinements for Complex Validation

```typescript
const passwordSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

---

## Testing

### Test Zod Schemas

```typescript
import { describe, it, expect } from 'vitest';
import { userRegistrationSchema } from './zod-schemas';

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
});
```

### Test Pydantic Models

```python
import pytest
from pydantic import ValidationError
from pydantic_models import UserRegistration

def test_user_registration_valid():
    data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'Test123!@#',
        'confirm_password': 'Test123!@#',
        'first_name': 'Test',
        'last_name': 'User',
        'accept_terms': True,
    }

    user = UserRegistration(**data)
    assert user.email == 'test@example.com'

def test_user_registration_weak_password():
    data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'weak',
        'confirm_password': 'weak',
        'first_name': 'Test',
        'last_name': 'User',
        'accept_terms': True,
    }

    with pytest.raises(ValidationError):
        UserRegistration(**data)
```

---

## Troubleshooting

### Issue: Validation passes but data is incorrect

**Solution:** Check schema definition and add more specific constraints:

```typescript
// ❌ Too permissive
const ageSchema = z.number();

// ✅ More specific
const ageSchema = z.number().int().positive().min(0).max(150);
```

### Issue: Error messages not clear

**Solution:** Add custom error messages:

```typescript
const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  age: z.number().min(18, 'You must be at least 18 years old'),
});
```

### Issue: Type inference not working

**Solution:** Make sure you're using `z.infer`:

```typescript
// ✅ Correct
type User = z.infer<typeof userSchema>;

// ❌ Wrong
type User = typeof userSchema;
```

### Issue: Nested validation errors not formatted

**Solution:** Use the error formatter's path joining:

```typescript
const formattedError = formatZodError(error);
// error.details[0].field will be "address.street" for nested fields
```

---

## Additional Resources

- **Zod Documentation:** https://zod.dev/
- **Pydantic Documentation:** https://docs.pydantic.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **FastAPI:** https://fastapi.tiangolo.com/
- **Express.js:** https://expressjs.com/

---

## Support

For questions or issues:
1. Review examples in this README
2. Check inline code documentation
3. Consult main SKILL.md in parent directory
4. Review official Zod/Pydantic documentation

---

**Remember: Validate at the edge, fail fast, return clear errors.**

*Type-safe by default, secure through validation, documented through schemas.*
