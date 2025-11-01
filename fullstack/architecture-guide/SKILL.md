---
name: architecture-guide
description: Full-stack architecture with shared design tokens, unified conventions, and modular structure. Use when architecting full-stack applications, setting up monorepos, or integrating frontend and backend systems.
version: 1.0.0
---

# Full-Stack Architecture Guide

## Purpose

Define standards for integrated frontend and backend projects with shared design tokens and consistent conventions. Cohesive full-stack architecture with unified design system and modular structure.

## When to Use This Skill

- Architecting full-stack applications
- Setting up monorepo structures
- Integrating frontend and backend systems
- Implementing shared design tokens
- Establishing cross-stack conventions

## Stack & Conventions

**Frontend:**
- React + Vite or Static HTML/CSS/JS
- OKLCH tokens from `/shared/tokens.json`
- Inter + JetBrains Mono fonts; Phosphor icons

**Backend:**
- Node.js + Express/Fastify OR FastAPI OR PHP
- PostgreSQL with typed ORM
- Structured logging and validation

**Shared:**
- Mobile-first design (320–1440px); no flex-wrap
- UTF-8 encoding, LF endings, 2-space indent
- Monochrome palette with purposeful color signals
- 4px base spacing scale

## Project Structure

```
/project
 ├─ /frontend (React/Vite or /frontend-static)
 │   ├─ /src (components, pages, hooks, styles)
 │   └─ /public
 ├─ /backend (Node/FastAPI/PHP)
 │   ├─ /src or /app (routes, controllers, services)
 │   └─ /tests
 ├─ /shared
 │   ├─ tokens.json (OKLCH colors, spacing, typography)
 │   ├─ types (shared TypeScript interfaces)
 │   └─ constants (API endpoints, config)
 ├─ /docs (architecture, API specs, deployment)
 ├─ /scripts (deployment, migrations, utilities)
 └─ docker-compose.yml
```

## Shared Design Tokens

### Token Structure (`/shared/tokens.json`)
```json
{
  "colors": {
    "light": {
      "bg": "oklch(98% 0 0)",
      "surface": "oklch(96% 0 0)",
      "border": "oklch(88% 0 0)",
      "text-primary": "oklch(20% 0 0)",
      "text-secondary": "oklch(45% 0 0)",
      "accent": "oklch(30% 0 0)"
    },
    "dark": {
      "bg": "oklch(15% 0 0)",
      "surface": "oklch(18% 0 0)",
      "border": "oklch(28% 0 0)",
      "text-primary": "oklch(95% 0 0)",
      "text-secondary": "oklch(70% 0 0)",
      "accent": "oklch(85% 0 0)"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px",
    "12": "48px",
    "16": "64px"
  },
  "typography": {
    "xs": "12px",
    "sm": "14px",
    "base": "16px",
    "lg": "18px",
    "xl": "24px",
    "2xl": "32px"
  }
}
```

### Token Distribution

**Frontend (CSS Variables):**
```css
:root {
  --color-bg: oklch(98% 0 0);
  --color-surface: oklch(96% 0 0);
  --space-4: 16px;
  --text-base: 16px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: oklch(15% 0 0);
    --color-surface: oklch(18% 0 0);
  }
}
```

**Backend (Templates/Emails):**
```python
# Load tokens for email templates
import json
with open('../shared/tokens.json') as f:
    tokens = json.load(f)

email_styles = f"""
  background: {tokens['colors']['light']['bg']};
  color: {tokens['colors']['light']['text-primary']};
"""
```

## Shared Types (TypeScript)

### API Contracts (`/shared/types/api.ts`)
```typescript
// User types
export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string; // ISO 8601
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

// Response wrappers
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
```

### Sync with Backend
```python
# Generate Pydantic models from TypeScript types
# or vice versa using code generation tools
```

## Environment Configuration

### Shared Constants (`/shared/constants.ts`)
```typescript
export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.example.com'
    : 'http://localhost:3000';

export const API_ENDPOINTS = {
  users: '/api/users',
  auth: '/api/auth',
  health: '/health',
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;
```

### Environment Files
```
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_PORT=3000
FRONTEND_PORT=5173
ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=your-secret-key
```

## Cross-Stack Patterns

### API Client (Frontend)
```typescript
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants';
import type { User, ApiResponse, ApiError } from '@/shared/types/api';

class ApiClient {
  private baseUrl = API_BASE_URL;

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.users}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error);
    }

    const data: ApiResponse<User[]> = await response.json();
    return data.data;
  }
}

export const api = new ApiClient();
```

### CORS Configuration (Backend)
```typescript
// Node.js/Express
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));
```

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('ALLOWED_ORIGINS', '').split(','),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
```

## Development Workflow

### Docker Compose Setup
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Development Commands
```bash
# Full stack
docker-compose up

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Database migrations
cd backend && npm run db:migrate
```

## Deployment Architecture

### Coolify Deployment

**Frontend (Static):**
- Build: `npm run build`
- Output: `/dist`
- Type: Static Build Pack

**Backend (API):**
- Build: `npm run build` or `uvicorn app.main:app`
- Type: Nixpacks or Dockerfile
- Health: `/health` endpoint

**Database:**
- PostgreSQL service
- Connection via private network

### Environment Variables
```
Frontend:
- VITE_API_URL (production API URL)

Backend:
- DATABASE_URL (connection string)
- JWT_SECRET
- ALLOWED_ORIGINS (frontend URL)
- PORT (default 3000 or 8000)
```

## Best Practices

### Frontend Guidelines
- Use shared types for API responses
- Reference tokens for all styling
- Handle loading/error states consistently
- Implement error boundaries
- Lazy load routes

### Backend Guidelines
- Return consistent JSON structure
- Use shared types for validation
- Implement `/health` endpoint
- Log with structured context
- Handle CORS properly

### Shared Guidelines
- Single source of truth for tokens
- Version API endpoints
- Document breaking changes
- Test integration points
- Use environment variables

## Communication Patterns

### REST API Design
```
GET    /api/users          → List users
POST   /api/users          → Create user
GET    /api/users/:id      → Get user
PATCH  /api/users/:id      → Update user
DELETE /api/users/:id      → Delete user
```

### Response Format
```json
{
  "data": { /* resource */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Format
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

## Testing Strategy

### Frontend Tests
- Component unit tests (Vitest)
- Integration tests (Testing Library)
- E2E tests (Playwright/Cypress)

### Backend Tests
- Unit tests (services, utilities)
- Integration tests (API endpoints)
- Database tests (migrations, queries)

### Full-Stack Tests
- E2E user flows
- API contract tests
- Performance tests

## Philosophy

**OKLCH-driven design, modular architecture, production-ready always.**

Unified design system, clear separation of concerns, shared context. Cohesive by default, maintainable through structure, scalable through modularity.

## Additional Resources

See `resources/` directory for:
- Docker configuration examples
- Deployment scripts
- API documentation templates
- Monorepo setup guides
