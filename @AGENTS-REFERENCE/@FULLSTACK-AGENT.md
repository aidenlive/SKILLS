# AGENTS.md — Full-Stack Application

## Purpose

Defines standards for integrated frontend and backend projects with shared design tokens and consistent conventions.

**Goal:** cohesive full-stack architecture with unified design system and modular structure.

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

## Structure

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

## Authoring Rules

**Frontend:**

- Components small, pure, composable
- Token-first design; never hardcode colors or spacing
- Accessibility mandatory (ARIA, keyboard nav, focus order)
- Lazy-load routes; optimize images (AVIF/WebP)

**Backend:**

- Controllers thin; business logic in services
- Validate all inputs with Zod/Pydantic
- Add `/health` and `/api/docs` endpoints
- Return structured JSON with proper status codes

**Shared:**

- All UI derives from `/shared/tokens.json`
- Maintain single source of truth for API types
- Use environment variables; never commit secrets

## Agent Behavior

- Respect subproject boundaries; check local AGENTS.md first
- Maintain design token consistency across frontend and backend templates
- Update shared types when API contracts change
- Keep dependencies minimal; document justification for new packages
- Comment intent behind cross-stack integrations
- Never replace full files; make scoped, targeted edits

## Development

**Frontend:**

```bash
cd frontend && npm run dev
```

**Backend:**

```bash
cd backend && npm run dev
```

**Full stack (Docker):**

```bash
docker-compose up
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000` or `8000`

## Validation

**Frontend:**

```bash
npm run lint && npm run test && npm run build
```

**Backend:**

```bash
npm run lint && npm run test  # Node
pytest && ruff check .        # Python
composer test && composer lint # PHP
```

**Integration:**

```bash
npm run test:e2e  # Playwright or Cypress
```

## Deployment

**Frontend build:**

```bash
npm run build → /dist
```

**Backend:**

- Node: `npm run build && npm start`
- FastAPI: `uvicorn app.main:app --host 0.0.0.0`
- PHP: Optimize with `composer install --no-dev`

**Coolify deployment:**

- Frontend: Static Build Pack → `/dist`
- Backend: Nixpacks or Dockerfile
- Environment variables via secrets
- Healthcheck required for backend
- CORS configured for frontend origin

## Version Control

- **Branches:** main / feature/* / fix/* / docs/*
- **Commits:** imperative, one logical change per commit
- Include accessibility, security, and performance validation before PR merge

## Philosophy

Unified design system, clear separation of concerns, shared context.

**OKLCH-driven design, modular architecture, production-ready always.**

Cohesive by default, maintainable through structure, scalable through modularity.