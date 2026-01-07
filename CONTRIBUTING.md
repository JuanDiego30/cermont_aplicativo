# 🤝 Contributing to Cermont

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- PostgreSQL 15+ (or Docker)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# Install dependencies
pnpm install

# Copy environment file
cp apps/api/.env.example apps/api/.env
# Edit .env with your database credentials

# Run database migrations
cd apps/api && npx prisma migrate dev

# Start development servers
pnpm run dev:api   # Backend on :4000
pnpm run dev:web   # Frontend on :4200
```

---

## Code Standards

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (Angular) | `kebab-case.type.ts` | `ordenes-list.component.ts` |
| Files (NestJS) | `kebab-case.type.ts` | `create-orden.use-case.ts` |
| Classes | `PascalCase` | `OrdenesController` |
| Interfaces | `PascalCase` | `CreateOrdenDto` |
| Enums | `PascalCase` | `OrdenEstado` |
| Enum values | `SCREAMING_SNAKE` or `lowercase` | `PENDIENTE` or `pendiente` |
| Functions | `camelCase` | `getOrdenById()` |
| Variables | `camelCase` | `ordenesActivas` |
| Constants | `SCREAMING_SNAKE` | `MAX_FILE_SIZE` |

### TypeScript Rules

```typescript
// ✅ DO: Use explicit types
function getUser(id: string): Promise<User> { ... }

// ❌ DON'T: Use `any`
function getUser(id: any): any { ... }

// ✅ DO: Use readonly for immutables
readonly logger = new Logger(MyService.name);

// ❌ DON'T: Use console.log
console.log('data'); // Use Logger instead
```

### Backend Module Structure

```
modules/<name>/
├── application/
│   ├── dto/
│   │   ├── create-<name>.dto.ts
│   │   ├── update-<name>.dto.ts
│   │   └── index.ts
│   └── use-cases/
│       ├── create-<name>.use-case.ts
│       ├── list-<name>.use-case.ts
│       └── index.ts
├── domain/
│   ├── entities/
│   ├── enums/
│   └── interfaces/
├── infrastructure/
│   ├── controllers/
│   │   └── <name>.controller.ts
│   └── repositories/
│       └── prisma-<name>.repository.ts
├── <name>.module.ts
└── index.ts
```

### Frontend API Client Pattern

```typescript
// All API clients MUST extend ApiBaseService
@Injectable({ providedIn: 'root' })
export class MyApi extends ApiBaseService {
    private readonly basePath = '/my-resource';

    list(params?: MyQueryParams): Observable<PaginatedMy> {
        return this.get<PaginatedMy>(this.basePath, params);
    }

    getById(id: string): Observable<MyItem> {
        return this.get<MyItem>(`${this.basePath}/${id}`);
    }

    create(dto: CreateMyDto): Observable<MyItem> {
        return this.post<MyItem>(this.basePath, dto);
    }
}
```

---

## Git Workflow

### Branch Naming

```
feature/<ticket>-<description>   # New features
fix/<ticket>-<description>       # Bug fixes
refactor/<area>-<description>    # Refactoring
docs/<area>-<description>        # Documentation
chore/<description>              # Maintenance
```

Examples:
- `feature/ORD-123-add-evidence-upload`
- `fix/AUTH-456-refresh-token-loop`
- `refactor/api-layer-standardization`

### Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(ordenes): add status change endpoint
fix(auth): resolve CSRF token validation issue
refactor(api): standardize all clients to use ApiBaseService
```

---

## Pull Request Process

1. Create branch from `main`
2. Make changes following code standards
3. Run checks locally:
   ```bash
   pnpm run lint
   pnpm run typecheck
   pnpm run test
   pnpm run build
   ```
4. Push and create PR
5. Fill PR template with description
6. Request review
7. Address feedback
8. Merge after approval

---

## Testing

### Backend Tests
```bash
cd apps/api
pnpm run test           # Unit tests
pnpm run test:e2e       # E2E tests
pnpm run test:cov       # Coverage report
```

### Frontend Tests
```bash
cd apps/web
pnpm run test           # Unit tests
pnpm run e2e            # E2E tests (Playwright)
```

---

## Questions?

- Check existing issues before creating new ones
- Tag maintainers for urgent items
- Update documentation when making changes
