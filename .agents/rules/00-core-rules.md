# 00 — Core Software Engineering Rules

> Canonical source for SOLID, DRY, KISS, YAGNI, Clean Code, and code-quality principles.  
> Applies to every workspace: backend, frontend, shared-types, tooling.

---

## SOLID

### SRP — Single Responsibility Principle
- Routes wire endpoints to middleware chains only.
- Controllers parse HTTP input, call one service, return the standard response.
- Services contain pure business logic; they never import `req`, `res`, or `next`.
- Models define Mongoose schemas and nothing else.
- **Violation detected if:** a controller calls Mongoose directly, or a service accepts Express objects.

### OCP — Open/Closed Principle
- Extend behavior by adding new modules, not by modifying existing ones.
- Use strategy patterns and dependency injection rather than if/else proliferation.
- **Violation detected if:** an existing service is modified to handle a new unrelated case.

### LSP — Liskov Substitution Principle
- Subtypes must be substitutable for their parent types.
- TypeScript interfaces must be honored completely by all implementations.

### ISP — Interface Segregation Principle
- DTOs are granular; one interface per use case.
- Never create a god interface with 20+ optional fields.

### DIP — Dependency Inversion Principle
- High-level modules depend on abstractions (interfaces), not concrete implementations.
- Services receive repository interfaces, not Mongoose models directly.

---

## DRY — Don't Repeat Yourself

- **ZERO tolerance for duplicated types.** Every Zod schema and TypeScript type lives in `packages/shared-types`.
- Extract repeated logic into shared utilities; never copy-paste business logic between modules.
- **Violation detected if:** the same type/interface is defined in more than one package.

---

## KISS — Keep It Simple, Stupid

- Functions ≤ 30 lines. If longer, split by responsibility.
- Maximum nesting depth: 3 levels.
- Comments only when the intent is not obvious from the code itself.
- **Violation detected if:** a function exceeds 30 lines or has more than 3 levels of nesting.

---

## YAGNI — You Aren't Gonna Need It

- Write only what the current documented requirement needs.
- No speculative endpoints, models, or UI components.
- **Violation detected if:** code has no reference to a documented operational step (DOC-07, DOC-11).

---

## Clean Code Principles

### Boy Scout Rule
Always leave the code cleaner than you found it. Remove dead imports, fix obvious lint warnings in files you touch.

### Early Returns
Prefer guard clauses and early returns over deeply nested if/else blocks.

```typescript
// ✅ Correct — early return
function validateOrder(order: Order): void {
  if (!order.id) throw new AppError('MISSING_ID', 400, 'Order ID required');
  if (!order.status) throw new AppError('MISSING_STATUS', 400, 'Status required');
  // ... main logic continues at the top level
}

// ❌ Incorrect — deep nesting
function validateOrder(order: Order): void {
  if (order.id) {
    if (order.status) {
      // ... logic buried at depth 2
    }
  }
}
```

### Immutability
- Prefer `const` over `let`; never use `var`.
- Prefer non-mutating array methods (`map`, `filter`, `reduce`) over `forEach` + push.
- Return new objects rather than mutating parameters.

### No Silent Fallback
Never swallow errors silently. Every catch block must either rethrow or log with context.

### No Magic Strings / Numbers
Extract string constants and numeric values into named constants or enum-like objects.

```typescript
// ✅ Correct
const HTTP_STATUS = { OK: 200, NOT_FOUND: 404 } as const;

// ❌ Incorrect
res.status(200).json(data);
```

---

## Semantic Code Rules

### English-Only Naming (Non-Negotiable)
All code — variables, functions, classes, interfaces, comments — must be in **English**.  
No Spanglish. No Spanish identifiers. No mixed-language comments.

```typescript
// ✅ Correct
const orderStatus = 'open';
function handleUserLogin() {}

// ❌ Incorrect
const estadoOrden = 'open';
function manejarLogin() {}
```

### Descriptive Names
Names must communicate intent without abbreviations.

```typescript
// ✅ Correct
const userAuthToken: string;
function fetchOrdersByStatus(status: OrderStatus) {}

// ❌ Incorrect
const tok: string;
function fn2(s: string) {}
```

### Semantic HTML (Frontend)
Use the correct HTML element for the semantic role:
- Navigation → `<nav>`
- Main content area → `<main>`
- Independent content → `<article>`
- Thematic grouping → `<section>`
- Supplementary content → `<aside>`
- One and only one `<h1>` per page.
- Buttons are always `<button>`, never `<div onClick>`.
- Every `<input>` has a `<label htmlFor="id">`.

### No Div Soup
Do not nest generic `<div>` elements where semantic elements apply.

```tsx
// ✅ Correct
<main>
  <section aria-label="Order list">
    <ul>{orders.map(o => <li key={o._id}><article>…</article></li>)}</ul>
  </section>
</main>

// ❌ Incorrect
<div><div className="orders"><div>{orders.map(o => <div key={o._id}><div>…</div></div>)}</div></div></div>
```

---

## SDLC Rules

- **No Broken Windows:** Never commit code that breaks the build.
- **Zero TypeScript errors:** `npm run typecheck` must pass with 0 errors.
- **Zero Biome errors:** `npm run lint` must pass with 0 errors.
- **Zero Qodana new issues:** No new Qodana warnings introduced per commit.
- **TDD for bug fixes:** Write a failing test that reproduces the bug before fixing it.
- **Conventional Commits:** All commit messages follow `type(scope): description` format.

---

## Composition Over Inheritance (React)

- Never extend React class components.
- Build flexible UIs with `children`, custom hooks, and compound components.
- A component > 200 lines is a God Component — split it.

```tsx
// ✅ Correct — composition
<Card>
  <CardHeader title="Work Order #1" />
  <CardContent>{details}</CardContent>
  <CardFooter actions={actions} />
</Card>

// ❌ Incorrect — inheritance
class AdminCard extends BaseCard {}
```
