# Cermont Monorepo

pnpm + Turborepo workspace with Angular frontend and NestJS backend.

## Quick Start

```bash
# Install dependencies
pnpm install

# Development (parallel)
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Format code
pnpm format
```

## Package Structure

```
├── frontend/   # Angular 17 app (@cermont/frontend)
├── backend/    # NestJS API (@cermont/backend)
├── turbo.json  # Task pipeline config
└── package.json # Root scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both apps in watch mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm lint:fix` | Lint and fix |
| `pnpm typecheck` | Type check all |
| `pnpm clean` | Remove build artifacts |
| `pnpm format` | Format all files |

## Turborepo Caching

Tasks are cached based on inputs (source files, configs). Run twice to see cache hits.
