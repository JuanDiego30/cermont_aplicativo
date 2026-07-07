# Workflow: Debug Local

> Use when reproducing and fixing a bug reported in development or staging.

---

## When to Use
- A test is failing.
- A feature is not behaving as expected in development.
- A runtime error is thrown in the browser or server logs.
- An API is returning an unexpected response.

---

## Steps

### 1. Reproduce the Bug
Before looking at code, reproduce the exact failure:

```bash
# Backend bug: run the failing test
npm run test -w backend -- tests/services/order.service.test.ts

# Frontend bug: run Playwright test
npm run test:e2e -w frontend -- --grep "login"

# API bug: check server logs
npm run dev -w backend
# then trigger the failing request
```

**If you cannot reproduce it, you cannot fix it.** Do not guess.

### 2. Isolate the Cause

**Backend debugging flow:**
```
Request arrives →
  Is it a validation error? (check Zod schema) →
  Is it an auth error? (check authenticate/authorize middleware) →
  Is it a business logic error? (check service) →
  Is it a database error? (check Mongoose query) →
  Is it the error handler? (check AppError thrown vs caught)
```

**Frontend debugging flow:**
```
UI incorrect? →
  Is the query returning wrong data? (React Query DevTools) →
  Is the API response wrong? (Network tab) →
  Is the state stale? (TanStack Query cache) →
  Is the form validation wrong? (React Hook Form) →
  Is it a rendering bug? (React DevTools)
```

### 3. Check the Logs

```bash
# Backend request logs
npm run dev -w backend   # watch console for X-Request-ID

# Frontend console
# Open DevTools → Console → look for errors

# MongoDB connection
# Check db.ts connection events
```

### 4. Write a Failing Test (TDD)
Before fixing, write a test that:
1. Reproduces the bug.
2. Fails with the current code.

```typescript
it('does NOT allow invalid FSM transition from completed to open', async () => {
  // This should throw — if it doesn't, the bug exists
  await expect(orderService.updateStatus('order-id', 'open'))
    .rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION' });
});
```

### 5. Fix the Bug
Make the smallest possible change that makes the failing test pass.

### 6. Verify No Regressions
```bash
npm run test -w <workspace>
npm run typecheck -w <workspace>
```

### 7. Never Hide an Error
- Do not `try/catch` and swallow the error to make the test pass.
- Do not return a silent fallback that masks the real problem.
- Fix the root cause.

---

## Common Bug Patterns

| Symptom | Likely Cause |
|---------|-------------|
| 401 Unauthorized | JWT expired / cookie not sent with credentials |
| 403 Forbidden | Role mismatch in `authorize()` middleware |
| 400 Bad Request | Zod validation failing — check `req.body` shape |
| Mongoose validation error | Schema constraint violated |
| Data not refreshing in UI | TanStack Query cache stale — check `queryKey` or `invalidateQueries` |
| Form not submitting | Zod `defaultValues` mismatch or resolver error |
| `undefined is not iterable` | Data may be `null` / not yet loaded — check loading state |
| `localhost` MongoDB connection fail | Use `127.0.0.1` instead |
