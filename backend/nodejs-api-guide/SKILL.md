---
name: nodejs-api-guide
description: Node.js REST APIs with TypeScript, Zod validation, and modular routing. Use when building Node.js APIs, Express/Fastify applications, or TypeScript backends.
version: 1.0.0
---

# Node.js REST API Guide

## Purpose

Define structure and rules for Node.js REST APIs with TypeScript, modular routing, and strict validation. Typed, secure, performant APIs with clear structure and minimal dependencies.

## When to Use This Skill

- Building Node.js REST APIs or microservices
- Creating Express.js or Fastify applications
- Implementing TypeScript backends
- Developing with Zod validation schemas
- Working with modular routing patterns

## Stack & Conventions

- Node.js ≥ 18 with ES Modules
- Express.js or Fastify for routing
- TypeScript with strict mode enabled
- Validation via Zod schemas
- PostgreSQL with Drizzle ORM
- Logging: Pino (structured JSON logs)
- Testing: Vitest or Jest
- UTF-8 encoding, LF endings, 2-space indent

## Project Structure

```
/src
 ├─ /routes (users.ts, auth.ts, health.ts)
 ├─ /controllers (thin handlers; delegate to services)
 ├─ /services (business logic, domain operations)
 ├─ /models (DB schemas, Drizzle tables)
 ├─ /middlewares (auth, validation, error-handling)
 ├─ /utils (formatters, validators, helpers)
 ├─ server.ts, app.ts
/tests
/docs (OpenAPI spec, deployment guide)
```

## Authoring Rules

- **Thin Controllers:** All business logic in service layer
- **Zod Validation:** Validate all inputs; structured JSON responses only
- **Environment Variables:** Via `dotenv` or native Node.js support
- **Health Endpoint:** Add `/health` returning `{ "status": "ok", "timestamp": ISO8601 }`
- **Security:** Helmet, CORS, rate limiting, input sanitization
- **HTTP Status Codes:** Proper codes (200, 201, 400, 401, 404, 500)
- **Error Logging:** Log all errors with context; never expose stack traces to clients

## Express.js Patterns

### Application Setup
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);

// Error handler
app.use(errorHandler);

export default app;
```

### Router Pattern
```typescript
import { Router } from 'express';
import { validateRequest } from '../middlewares/validate';
import { userSchema } from '../schemas/user';
import * as userController from '../controllers/user';

const router = Router();

router.get(
  '/',
  userController.list
);

router.post(
  '/',
  validateRequest(userSchema.create),
  userController.create
);

export default router;
```

### Controller Pattern
```typescript
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
```

## Zod Validation

```typescript
import { z } from 'zod';

export const userSchema = {
  create: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(50),
    password: z.string().min(8),
  }),

  update: z.object({
    email: z.string().email().optional(),
    username: z.string().min(3).max(50).optional(),
  }),

  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

// Middleware
export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}
```

## Error Handling

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.error({ err, req }, 'Operational error');
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  logger.error({ err, req }, 'Unexpected error');
  res.status(500).json({
    error: 'Internal server error',
  });
}
```

## Structured Logging

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Usage
logger.info({ userId: 123 }, 'User created');
logger.error({ err, userId: 123 }, 'Failed to create user');
```

## Database Operations (Drizzle)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users } from './schema';

const db = drizzle(process.env.DATABASE_URL);

export async function getUserByEmail(email: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
}

export async function createUser(data: NewUser) {
  return await db
    .insert(users)
    .values(data)
    .returning();
}
```

## Development Commands

```bash
npm install
npm run dev               # Start with hot reload

# Database migrations
npm run db:migrate
npm run db:seed
```

## Validation Checklist

```bash
npm run lint              # ESLint
npm run format            # Prettier
npm run test              # Vitest/Jest
npm run test:coverage     # Coverage report
npm run type-check        # TypeScript validation
```

## Deployment

```bash
npm run build
npm start
```

Requirements:
- `/health` endpoint for healthcheck
- Environment variables via secrets
- Enable gzip compression
- Configure CORS for allowed origins

## Best Practices

- **Separation of Concerns:** Controllers → Services → Database
- **Type Safety:** Use TypeScript strict mode
- **Validation:** Validate at the edge with Zod
- **Error Handling:** Centralized error handler
- **Logging:** Structured logs with context
- **Security:** Helmet, rate limiting, input sanitization
- **Testing:** Integration tests for all endpoints

## Philosophy

**Clear separation of concerns, minimal surface area, production-ready always.**

Modular, typed, and secure by default. Simple by design, robust through validation, scalable through structure.

## Additional Resources

See `resources/` directory for:
- Zod schema examples
- Error handling patterns
- Authentication strategies
- Database query patterns
- OpenAPI documentation setup
