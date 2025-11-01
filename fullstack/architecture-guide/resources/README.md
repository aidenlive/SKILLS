# Full-Stack Architecture Resources

This directory contains configuration files, type definitions, and deployment scripts for full-stack applications.

## Files

### `docker-compose.yml`
Complete Docker Compose configuration for local development with:
- Frontend service (React/Vite or Static)
- Backend service (Node.js/FastAPI)
- PostgreSQL database
- Redis cache (optional)

**Usage:**
```bash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Database: localhost:5432
```

### `api-types.ts`
Shared TypeScript type definitions for API contracts. Use in both frontend and backend for type safety.

**Usage:**
```typescript
import type { User, ApiResponse, ApiError } from '@/shared/types/api';

// Frontend
const response: ApiResponse<User[]> = await api.get('/users');

// Backend
app.get('/users', async (req, res): Promise<ApiResponse<User[]>> => {
  const users = await userService.getUsers();
  return res.json({ data: users });
});
```

### `deployment-scripts/`

#### `deploy-coolify.sh`
Automated deployment script for Coolify platform.

**Usage:**
```bash
# Basic deployment
./deployment-scripts/deploy-coolify.sh

# With tests
RUN_TESTS=true ./deployment-scripts/deploy-coolify.sh

# With local build
BUILD_LOCALLY=true ./deployment-scripts/deploy-coolify.sh

# Custom configuration
PROJECT_NAME=my-app \
GIT_BRANCH=production \
COOLIFY_SERVER=coolify.myserver.com \
./deployment-scripts/deploy-coolify.sh
```

#### `build-production.sh`
Production build script for frontend and backend.

**Usage:**
```bash
# Basic build
./deployment-scripts/build-production.sh

# With image optimization
OPTIMIZE_IMAGES=true ./deployment-scripts/build-production.sh
```

## Quick Start

### 1. Local Development with Docker

```bash
# Copy environment files
cp .env.example .env

# Start all services
docker-compose up

# Run migrations
docker-compose exec backend npm run db:migrate

# View logs
docker-compose logs -f
```

### 2. Share Types Between Frontend and Backend

```typescript
// In shared package or symlink
// frontend/src/types/api.ts -> ../../shared/api-types.ts
// backend/src/types/api.ts -> ../../shared/api-types.ts

import type { User, UserCreate } from '@/shared/types/api';
```

### 3. Deploy to Production

```bash
# Test locally first
docker-compose up --build

# Run production build
./deployment-scripts/build-production.sh

# Deploy to Coolify
./deployment-scripts/deploy-coolify.sh
```

## Project Structure

```
/project
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── shared/
│   ├── tokens.json           # Design tokens
│   └── api-types.ts          # Type definitions
├── docker-compose.yml
└── .env
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key-min-32-characters
ALLOWED_ORIGINS=http://localhost:5173
PORT=3000
```

## Related Files

- `/shared/tokens.json` - Shared design tokens
- `../SKILL.md` - Main architecture guide documentation
- `../../integration-patterns/` - Frontend-backend integration patterns
