# ADR-003: Status Object Pattern — Eliminating null/undefined in Business Logic

**Status:** Accepted
**Date:** 2026-05-29
**Deciders:** Principal Software Architect, TypeScript Engineer

---

## Context

Cermont S.A.S. development rules prohibit `null` and `undefined` as sentinel values in production code (see `docs/REGLAS_DESARROLLO_CERMONT.md` §5). However, the codebase pervasively uses patterns like:

```typescript
// ❌ Prohibited patterns found in the codebase
function findUser(id: string): User | null;
const order = await getOrder(id); // could be undefined
function getConfig(key: string): ConfigValue | undefined;
```

These patterns cause:
- Unchecked null/undefined propagation through the call stack
- Silent runtime errors when consumers forget to check
- Conditional explosion (`if (result !== null && result !== undefined)`)
- Impossible to distinguish "not found" from "not yet loaded" from "error"

The business logic requires representing three states for data:
1. **Present**: Data is available and valid
2. **Absent**: Data is not available (not found, not applicable)
3. **Loading/Pending**: Data is being fetched (for async operations)

## Decision

Use a **discriminated union pattern** (`StatusObject<T>`) instead of `T | null | undefined`:

```typescript
// ✅ Status object pattern
type StatusPresent<T> = { status: "present"; value: T };
type StatusAbsent = { status: "absent" };
type StatusObject<T> = StatusPresent<T> | StatusAbsent;

// Type guards
function isPresent<T>(v: StatusObject<T>): v is StatusPresent<T>;
function isAbsent<T>(v: StatusObject<T>): v is StatusAbsent;
function getValue<T>(v: StatusObject<T>, fallback: T): T;
```

### Migration Strategy

The pattern is applied incrementally:
1. **New code**: All new APIs must return `StatusObject<T>` instead of `T | null | undefined`.
2. **Hotspots**: Controllers, services, and React hooks are migrated first — these are the primary null-propagation sources.
3. **Boundaries**: API responses at the network boundary still use the `ApiEnvelope` format (`{ success, data, error }`) — this type is for internal business logic only.

## Consequences

### Positive

- **Type-safe absence**: The compiler enforces checking `isPresent()` before accessing `.value`. Zero null-check boilerplate.
- **Self-documenting**: `StatusObject<User>` communicates "this might not be available" explicitly.
- **No runtime surprises**: No `Cannot read properties of null` errors from unchecked null returns.
- **Encourages exhaustive handling**: Switch statements or if/else on `status` discriminant cover all cases.

### Negative

- **Boilerplate at boundaries**: Database and API layers still return raw values; conversion to `StatusObject` is needed at the service layer boundary.
- **Learning curve**: Developers unfamiliar with discriminated unions need onboarding.
- **Not universal**: Not suitable for hot loops or performance-critical paths where boxing overhead matters.

### Mitigations

- The `getValue(v, fallback)` helper covers 80% of use cases with a one-liner.
- Conversion helpers `toPresent(v)` and `toAbsent()` handle boundary wrapping.
- Performance overhead is negligible for database-backed operations (I/O dominates).

## Alternatives Considered

### A) Optional chaining (`?.`) everywhere
Rejected: Masks the problem but doesn't solve it. `user?.address?.city` still silently produces `undefined` at any missing level.

### B) Maybe monad (fp-ts Option)
Rejected: Adds functional programming dependency. The discriminated union is just TypeScript — no library needed.

### C) Result type (success/failure)
Rejected: `Result<T, E>` is for operations that can fail. `StatusObject<T>` is for data that may simply not exist — it's not an error condition.

### D) Default values / Null Object pattern
Rejected: Creates fake objects that silently pass through logic and produce confusing behavior. Better to be explicit about absence.

## Compliance

- Zero null/undefined: The pattern eliminates sentinel values from business logic.
- TypeScript strict: Compiler-enforced exhaustiveness on the status discriminant.
- KISS: Simple discriminated union, no library dependency.
