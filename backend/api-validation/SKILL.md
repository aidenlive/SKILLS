---
name: api-validation
description: Comprehensive API validation patterns using Zod (Node.js) or Pydantic (Python) with structured error responses. Use when implementing input validation, API contracts, or request/response schemas.
version: 1.0.0
---

# API Validation Guide

## Purpose

Implement comprehensive API validation using Zod (Node.js) or Pydantic (Python) with structured error responses. Type-safe validation at the API boundary.

## When to Use This Skill

- Implementing input validation for APIs
- Defining API contracts and schemas
- Creating request/response validation
- Building type-safe validation layers
- Handling validation errors gracefully

## Core Principles

- **Validate at the Edge:** Check all inputs before processing
- **Type Safety:** Use validation libraries that generate TypeScript/Python types
- **Clear Errors:** Return structured, actionable error messages
- **Fail Fast:** Reject invalid requests immediately
- **Document:** Validation schemas serve as API documentation

## Zod Validation (Node.js/TypeScript)

### Basic Schemas
```typescript
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  age: z.number().int().positive().optional(),
});

// Infer TypeScript type
export type User = z.infer<typeof userSchema>;
```

### Advanced Patterns
```typescript
// Nested objects
export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
});

export const userWithAddressSchema = z.object({
  ...userSchema.shape,
  address: addressSchema,
});

// Arrays
export const tagsSchema = z.array(z.string()).min(1).max(10);

// Unions
export const statusSchema = z.union([
  z.literal('draft'),
  z.literal('published'),
  z.literal('archived'),
]);

// Or use enum
export const statusEnumSchema = z.enum(['draft', 'published', 'archived']);

// Discriminated unions
export const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    target: z.string(),
  }),
  z.object({
    type: z.literal('pageview'),
    url: z.string().url(),
  }),
]);
```

### Refinements and Transforms
```typescript
// Custom validation
export const passwordConfirmSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Transforms
export const dateSchema = z.string().transform(str => new Date(str));

export const trimmedStringSchema = z.string().transform(str => str.trim());
```

### Query Parameter Validation
```typescript
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});

// Usage in Express
router.get('/', (req, res) => {
  const query = paginationSchema.parse(req.query);
  // query is now type-safe and validated
});
```

### Middleware Implementation
```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}
```

## Pydantic Validation (Python)

### Basic Models
```python
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_]+$')
    password: str = Field(..., min_length=8)
    age: Optional[int] = Field(None, gt=0, lt=150)

    @validator('password')
    def password_strength(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### Advanced Patterns
```python
from pydantic import BaseModel, root_validator
from typing import Literal, Union
from enum import Enum

# Nested models
class Address(BaseModel):
    street: str
    city: str
    state: str = Field(..., min_length=2, max_length=2)
    zip: str = Field(..., pattern=r'^\d{5}$')

class UserWithAddress(BaseModel):
    email: EmailStr
    username: str
    address: Address

# Enums
class Status(str, Enum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'

# Discriminated unions
class ClickEvent(BaseModel):
    type: Literal['click']
    target: str

class PageviewEvent(BaseModel):
    type: Literal['pageview']
    url: str

Event = Union[ClickEvent, PageviewEvent]
```

### Custom Validators
```python
class PasswordConfirm(BaseModel):
    password: str = Field(..., min_length=8)
    confirm_password: str

    @root_validator
    def passwords_match(cls, values):
        password = values.get('password')
        confirm = values.get('confirm_password')
        if password != confirm:
            raise ValueError('Passwords do not match')
        return values
```

### FastAPI Integration
```python
from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

app = FastAPI()

@app.post('/users/', response_model=UserResponse)
async def create_user(user: UserCreate):
    # user is automatically validated
    # Return 422 with details if validation fails
    return await user_service.create(user)

@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            'error': 'Validation failed',
            'details': exc.errors()
        }
    )
```

## Common Validation Patterns

### Email Validation
```typescript
// Zod
const emailSchema = z.string().email();

// Pydantic
from pydantic import EmailStr
email: EmailStr
```

### URL Validation
```typescript
// Zod
const urlSchema = z.string().url();

// Pydantic
from pydantic import HttpUrl
url: HttpUrl
```

### Date/Time Validation
```typescript
// Zod
const dateSchema = z.coerce.date();
const isoDateSchema = z.string().datetime();

// Pydantic
from datetime import datetime
created_at: datetime
```

### File Upload Validation
```typescript
// Zod
const fileSchema = z.object({
  filename: z.string(),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(5 * 1024 * 1024), // 5MB
});

// Pydantic
from pydantic import Field
class FileUpload(BaseModel):
    filename: str
    mimetype: Literal['image/jpeg', 'image/png', 'image/webp']
    size: int = Field(..., le=5_242_880)  # 5MB
```

### Pagination Validation
```typescript
// Zod
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Pydantic
class Pagination(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
```

## Error Response Format

### Standard Structure
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
  ]
}
```

### Implementation
```typescript
// Zod error formatter
function formatZodError(error: ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

// Pydantic error formatter (FastAPI does this automatically)
```

## Best Practices

- **Validate Early:** Check inputs at the API boundary
- **Specific Messages:** Provide actionable error messages
- **Type Generation:** Use validation schemas to generate types
- **Documentation:** Schemas serve as API documentation
- **Performance:** Validation is fast; don't skip it
- **Sanitization:** Clean inputs after validation
- **Security:** Prevent injection attacks through strict validation

## Philosophy

**Validate at the edge, fail fast, return clear errors.**

Type-safe by default, secure through validation, documented through schemas.

## Additional Resources

See `resources/` directory for:
- Complete validation examples
- Custom validators
- Sanitization strategies
- Security patterns
