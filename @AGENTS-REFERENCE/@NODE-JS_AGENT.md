# AGENTS.md — Node.js REST API

## Purpose

Defines structure and rules for Node.js REST APIs with TypeScript, modular routing, and strict validation.

**Goal:** typed, secure, performant APIs with clear structure and minimal dependencies.

## Stack & Conventions

- Node.js ≥ 18 with ES Modules
- Express.js or Fastify for routing
- TypeScript with strict mode enabled
- Validation via Zod schemas
- PostgreSQL with Drizzle ORM
- Logging: Pino (structured JSON logs)
- Testing: Vitest or Jest
- UTF-8 encoding, LF endings, 2-space indent

## Structure

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

- Keep controllers thin; all business logic in service layer
- Validate all inputs with Zod; structured JSON responses only
- Use environment variables via `dotenv` or native support
- Add `/health` endpoint returning `{ "status": "ok", "timestamp": ISO8601 }`
- Enforce security: Helmet, CORS, rate limiting, input sanitization
- Return proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Log all errors with context; never expose stack traces to clients

## Agent Behavior

- Scoped edits only; preserve routing and middleware conventions
- Avoid dependency bloat; prefer native Node.js APIs where possible
- Keep database queries efficient; use indexes and prepared statements
- Update OpenAPI docs and tests with every API change
- Comment intent behind complex query logic or business rules

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000` with hot reload.

Database migrations:

```bash
npm run db:migrate
npm run db:seed
```

## Validation

```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Vitest/Jest
npm run test:coverage # Coverage report
npm run type-check    # TypeScript validation
```

## Deployment

Build and run:

```bash
npm run build
npm start
```

Coolify: Use Nixpacks or Dockerfile. Expose `PORT=3000`.

Required:

- `/health` endpoint for healthcheck
- Environment variables via secrets
- Enable gzip compression
- Configure CORS for allowed origins

## Version Control

- **Branches:** main / feature/* / fix/* / docs/*
- **Commits:** imperative, one logical change per commit
- Include security audit and test validation before PR merge

## Philosophy

Modular, typed, and secure by default.

**Clear separation of concerns, minimal surface area, production-ready always.**

Simple by design, robust through validation, scalable through structure.