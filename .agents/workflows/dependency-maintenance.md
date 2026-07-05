# Workflow: Dependency Maintenance

> Use when updating, auditing, or adding npm dependencies.

---

## When to Use
- `npm audit` reports vulnerabilities.
- A package has a new major/minor version.
- Adding a new library to the project.
- Removing an unused dependency.

---

## Adding a New Dependency

### 1. Check package.json First
Is the package already installed?

```bash
cat package.json | grep "package-name"
```

Do not install something that already exists.

### 2. Verify It's Not Forbidden
Check [`.agents/rules/01-stack.md`](../rules/01-stack.md) — Forbidden Alternatives table.  
If the package replaces something we already have, **do not add it**.

### 3. Confirm the Need
Is this package truly required? Apply YAGNI:
- Does the existing stack cover this use case?
- Can it be done with a small utility function instead?

### 4. Install in the Correct Workspace
```bash
# Backend dependency
npm install <package> -w backend

# Frontend dependency
npm install <package> -w frontend

# Shared types dependency
npm install <package> -w @cermont/shared-types

# Dev / tooling (root)
npm install -D <package>
```

Do not install at the root level unless it's a true monorepo-wide dev tool.

### 5. Verify After Install
```bash
npm run typecheck
npm run build -w <affected-workspace>
```

---

## Auditing Vulnerabilities

```bash
npm audit                        # show all vulnerabilities
npm audit --audit-level=high    # show only high/critical
```

**Rule:** The CI pipeline rejects any high or critical vulnerability.

### Fixing Vulnerabilities

```bash
# Let npm try to fix automatically
npm audit fix

# For major version updates (review breaking changes first)
npm audit fix --force    # use with caution — may break things
```

After fixing:
```bash
npm run verify    # confirm nothing broke
```

---

## Updating Packages

```bash
npm outdated    # see outdated packages
```

**Process for updates:**
1. Read the changelog for the new version — check for breaking changes.
2. Update one package at a time.
3. Run `npm run verify` after each update.
4. Commit the `package-lock.json` change separately.

For major version upgrades, create a dedicated branch and PR.

---

## Removing Unused Dependencies

```bash
# Find dependencies potentially unused
npm run quality:strict    # checks dead code / unused exports
```

Before removing:
1. Search for all usages: `grep -r "package-name" backend frontend packages`.
2. Confirm it's truly unused.
3. Remove: `npm uninstall <package> -w <workspace>`.
4. Run `npm run verify`.

---

## Lockfile Rules

- `package-lock.json` must be committed with every dependency change.
- Never add `package-lock.json` to `.gitignore`.
- Never manually edit `package-lock.json`.
- In CI, always use `npm ci --frozen-lockfile` — not `npm install`.
