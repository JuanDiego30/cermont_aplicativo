# Formal audit exception - Next bundled PostCSS

Date: 2026-05-27

## Finding

`npm audit` reports 2 moderate findings:

- `postcss <8.5.10`
- transitive path: `frontend -> next@16.2.6 -> postcss@8.4.31`
- advisory: `GHSA-qx2v-qp2m-jg93`
- CWE: `CWE-79`

The project already has direct `postcss@8.5.15`, but Next bundles its own `postcss@8.4.31`.

## Remediation attempted

Attempted a scoped npm `overrides` mitigation for `next -> postcss@8.5.15`.

Result:

- `npm install --package-lock-only --ignore-scripts`: completed, but audit still reported the finding.
- `npm install --ignore-scripts`: completed, but npm kept `node_modules/next/node_modules/postcss@8.4.31` and marked it invalid against the override.
- The override was removed to avoid leaving the dependency graph inconsistent.

## Why `npm audit fix --force` was rejected

The audit fix proposes installing `next@9.3.3`, a breaking downgrade from `next@16.2.6`.
That violates the CERMONT rule against forced dependency changes and would risk the Next 16 app router/runtime.

## Current exploitability assessment

No local production code path was found that accepts user-authored CSS and stringifies it through PostCSS for browser injection.

Search performed:

```txt
rg "postcss|css\\.stringify|fromJSON|style tag|</style>|user.*css|custom.*css" frontend/src backend/src packages tooling
```

Result: only static logo CSS injection through `frontend/src/core/ui/CermontLogoSvg.tsx`; no dynamic user CSS path found.

## Required follow-up

Track as P1 security debt until one of these is available and verified:

- a patched Next release that removes the vulnerable nested PostCSS version;
- a compatible npm override that actually rewrites `next/node_modules/postcss` without `npm ls` errors;
- a controlled Next upgrade validated by `typecheck`, `lint`, `test`, `build`, `quality:strict`, `verify`, `test:e2e`, and React Doctor.

## Exception decision

Accepted temporarily as a formal exception for this continuation because:

- severity is moderate;
- no exploitable user-CSS stringify path was found;
- the forced fix is a breaking downgrade;
- all app gates must still be run and reported.

This exception does not mark `npm audit` clean. It documents why the remaining audit exit code is not being hidden or force-fixed.
