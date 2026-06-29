# ADR-001: Express 5 Backend (Override NestJS)

**Status:** Accepted
**Date:** 2026-05-29
**Deciders:** Principal Software Architect, Backend Engineer

---

## Context

Cermont S.A.S. originally started development with NestJS, a framework that provides opinionated architecture with decorators, modules, and dependency injection. As the codebase evolved, several pain points emerged:

- **Heavy abstraction overhead**: NestJS decorators, guards, interceptors, and modules added significant boilerplate for a team that needed to iterate quickly on field-operational features.
- **Steep learning curve**: New backend engineers needed weeks to understand NestJS patterns before contributing effectively.
- **Over-engineering for scope**: Cermont's backend is primarily a REST API with business logic services — it doesn't need the full NestJS DI container, microservice abstractions, or WebSocket gateway infrastructure.
- **Dependency churn**: NestJS relies on `reflect-metadata` and `rxjs`, adding transitive dependencies that required frequent updates and caused build fragility.

## Decision

Replace NestJS with **Express 5.2.1** as the backend framework. The new architecture follows a flat, explicit layer structure:

```
routes/      → Endpoint wiring + middleware binding ONLY
middlewares/ → authenticate → authorize → validateBody/validateQuery → next()
controllers/ → Thin HTTP: req parsing → service call → res.json(ApiEnvelope)
services/    → ALL business logic. NEVER accept req, res, or next.
models/      → Mongoose schemas ONLY
utils/       → Pure helper functions
```

Express 5 was chosen specifically because:
- Native async error handling (replaces NestJS exception filters)
- Simpler middleware chaining without decorators
- Smaller dependency footprint
- Direct control over request/response lifecycle
- Broader ecosystem compatibility

## Consequences

### Positive

- **Reduced boilerplate**: Routes are explicit functions, not decorated classes. A new endpoint takes ~5 lines, not ~30.
- **Faster onboarding**: Engineers familiar with Express can contribute immediately.
- **Smaller bundle**: No `@nestjs/*` packages, `reflect-metadata`, or `rxjs`.
- **Direct control**: No framework abstractions hiding middleware order or error handling.

### Negative

- **No built-in DI**: Services must be instantiated manually or via simple factory functions.
- **No built-in validation**: Zod (already a project dependency) fills this gap via middleware.
- **No built-in modularization**: The feature-sliced `backend/src/modules/` directory structure replaces NestJS modules.

### Mitigations

- Zod validation middleware provides type safety equivalent to NestJS pipes.
- Manual service instantiation is simple with a flat import graph.
- The `backend/src/modules/` structure enforces domain boundaries without NestJS modules.

## Alternatives Considered

### A) Keep NestJS
Rejected: Overhead exceeded benefits for this use case. Migrating off NestJS reduced codebase complexity by ~40%.

### B) Fastify
Rejected: Faster than Express, but smaller ecosystem and fewer middleware options. Express 5's async error handling closes the gap.

### C) Hono
Rejected: Too new at migration time; lacked mature ecosystem for MongoDB integration.

## Compliance

- SOLID: Single Responsibility for each layer (route/controller/service/model).
- KISS: Simple function composition over framework abstractions.
- SSOT: All business logic in services, never duplicated in routes or controllers.
