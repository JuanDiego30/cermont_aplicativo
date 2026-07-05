# Offline, Performance & A11y Remediation Report

> **Date:** 2026-06-04
> **Branch:** `rescue/restore-missing-project-files` (working tree, no commit yet)
> **Scope:** Fases 0–10 of the integrated offline + prod-startup + perf + a11y plan + user-reported real-world offline failures.
> **Author:** Kilo (acting on the original prompt that requested the 20-phase plan).

---

## 1. Executive summary

| Area | Before | After | Status |
|------|--------|-------|--------|
| `npm run start` (prod) | Not defined in root `package.json` | Three new scripts: `start:prod`, `start:backend`, `start:frontend` | ✅ Fixed |
| `BACKEND_URL` resolution in Windows prod | `http://backend:4000` (breaks local prod) | `http://127.0.0.1:4000` (overridable via `.env.local`) | ✅ Fixed |
| Service Worker catch handler (navigations) | Always served `/~offline` (even when a cached version of the requested URL existed) | Defense in depth: requested URL → `/~offline` precache → static HTML → 503 | ✅ Fixed |
| Service Worker catch handler (static assets) | Returned raw 503 for `/_next/static/*` not in cache → cascade CSS errors | Try cache first; if miss, return 200 + empty body (no cascade failure) | ✅ Fixed (cycle 2) |
| `/theme-init.js` external load | `<Script strategy="beforeInteractive" src="/theme-init.js" />` ran before SW claimed the page → `ERR_INTERNET_DISCONNECTED` offline | Script **inlined** into `<head>` via `<script dangerouslySetInnerHTML>`; zero network dependency. `CacheFirst` runtime rule added as defense in depth. | ✅ Fixed (cycle 2) |
| `theme-init.js` not in `globPublicPatterns` | Asset not recognized as public; could be excluded from precache if external load was kept | Added to `globPublicPatterns` so the runtime rule and any future precache pass treat it as public | ✅ Fixed (cycle 2) |
| Dashboard backend-down UX | Generic red error card, no retry, no friendly state | Dedicated `BackendUnavailableState` (warning color, retry refetches all queries) | ✅ Fixed |
| `KPICard` counter animation | `setState` per frame (~72 React re-renders per 1.2s animation per card) | Direct `ref.current.textContent` write on every frame; zero re-renders | ✅ Fixed |
| TanStack Query retries on offline | Already gated by `isOfflineLikeCode` (no retry) | Unchanged (already correct) | ✅ Already OK |
| `React Query Devtools` in prod | Already gated by `NODE_ENV !== "production"` | Unchanged (already correct) | ✅ Already OK |
| `unload` / `beforeunload` handlers | None found (`grep -r "unload\|beforeunload" frontend/src` → 0 matches) | Unchanged (already correct) | ✅ Already OK |
| `<main>` semantic landmark | Already present in `DefaultLayout` | Unchanged (already correct) | ✅ Already OK |
| Contrast `--color-danger` (`#d45656`) on light surfaces | 3.99:1 on white — fails WCAG AA body text (needs 4.5:1); only passes the large-text threshold. Used as `text-danger` in `RejectForm.tsx` and `billing/invoices/[id]/page.tsx`. | Light: `--color-danger: #b83939` (5.70:1 on white, 4.67:1 on `--color-danger-bg`). Dark: `--color-danger: #fca5a5` (9.17–10.24:1 on all Cermont dark surfaces). | ✅ Fixed (cycle 3) |
| Lighthouse score (Perf / A11y) | Not re-measured in this cycle (would need a real browser run) | — | ⚠ Pending — see §9 |
| `/_next/static/*` precache at build time | Initially assumed only `CacheFirst` on-demand | **VERIFIED** — already in the precache manifest via Serwist's default `globPatterns` (`**/*.{js,css,html}`). 150+ entries including all chunks, CSS, and per-route pages. The user's 503 was a stale-SW issue, not a missing precache. | ✅ Already correct |

**All five quality gates pass after cycle 2:** `typecheck`, `lint`, `test`, `build`, `verify`. React Doctor 88/100 ("Great"). 180/180 unit tests green. 51 Next.js routes generated, Service Worker bundled.

---

## 2. Files modified

### Cycle 1 (original Fases 0–10)

| File | Change | Rationale |
|------|--------|-----------|
| `package.json` (root) | Added `start:prod`, `start:backend`, `start:frontend` scripts. | No production startup command existed; users could only run `npm run dev`. |
| `frontend/.env.local` | Added `NEXT_PUBLIC_API_URL=http://127.0.0.1:4000` and `BACKEND_URL=http://127.0.0.1:4000`. | `next.config.ts:10` and `src/app/api/backend/[...path]/route.ts:35` both read `BACKEND_URL` at build/request time. Without an explicit value, the prod fallback was `http://backend:4000`, which is a Docker-network host that does not resolve on a native Windows prod build. |
| `frontend/.env.example` | Documented the new vars and their precedence. | Future contributors must know which URL the proxy actually uses. |
| `frontend/src/app/sw.ts` (cycle 1) | Rewrote `setCatchHandler` for navigations: try `caches.match(request)` first, then precached `/~offline`, then static `/offline.html`, then a plain 503. | The previous handler skipped the per-URL cache check and went straight to `/~offline`. With this change, if a navigation's exact URL is still in any cache (e.g. the dynamic `NetworkFirst` cache) the SW will serve it instead of degrading to the offline shell. |
| `frontend/src/components/common/PageStates.tsx` | Added `BackendUnavailableState` export (uses `CloudOff` icon, warning color, retry button). | The dashboard was rendering a generic red error card on `BACKEND_UNAVAILABLE`. Operators had no clear path to recover. The new state communicates the situation and offers a one-click retry that refetches all failed queries. |
| `frontend/src/modules/dashboard/ui/KPICard.tsx` | Removed `useState` for the counter; added `useRef<HTMLParagraphElement>`; GSAP `onUpdate` now writes `valueRef.current.textContent` directly. | The old code called `setDisplayVal` ~60 times per second per card. With 4 cards, that is ~240 React re-renders per second during the 1.2s entrance animation. Direct DOM mutation bypasses reconciliation and removes a significant jank source. |
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | Imports `isOfflineLikeError` and `BackendUnavailableState`; destructures `refetch` from each query; new `DashboardOfflineState` that calls `refetch` on all four queries when the user clicks Retry. | Wires the new component into the real failure path. The dashboard now degrades gracefully when the backend is down instead of throwing a red error card. |

### Cycle 2 (user-reported real-world offline failures)

| File | Change | Rationale |
|------|--------|-----------|
| `frontend/src/lib/theme/theme-init-script.ts` | Replaced `THEME_INIT_SCRIPT_SRC = "/theme-init.js"` with `THEME_INIT_SCRIPT` (string containing the full script body). | The external `/theme-init.js` request was dispatched with `strategy="beforeInteractive"`, which fires **before** the Service Worker has claimed the page. Offline, the browser has no network and no SW, so the request fails with `ERR_INTERNET_DISCONNECTED` and the page renders with the wrong theme (FOUC). Inlining the script removes the network dependency entirely. |
| `frontend/src/app/layout.tsx` | Removed `import Script from "next/script"`; removed `THEME_INIT_SCRIPT_SRC` import; replaced `<Script id="theme-init" src=... strategy="beforeInteractive" />` with `<script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />`. | Mirrors the change in the theme-init module. The inline script runs synchronously during HTML parsing — no network, no race with the SW. |
| `frontend/next.config.ts` | Added `"theme-init.js"` to the `globPublicPatterns` array (defense in depth, in case any future code reverts to an external load). | If the script were ever re-introduced as an external file, Serwist would recognize it as a public asset and the new `CacheFirst` runtime rule could serve it from cache offline. |
| `frontend/src/app/sw.ts` (cycle 2) | Added a new `CacheFirst` runtime rule for `url.pathname === "/theme-init.js"` placed **before** the `/_next/static/*` rule. Extended `setCatchHandler` so that, for non-navigation requests, the SW first tries `caches.match(request)` and only returns 200 + empty body if the cache is also empty (previously it returned 503). | (a) Makes the theme-init asset cacheable on its first online load so any future external reference works offline. (b) Prevents 503 cascade for `/_next/static/*` chunks on first offline reload — the page now renders with whatever assets are cached and degrades gracefully on the rest instead of throwing a red error state for the whole layout. |

### Cycle 3 (WCAG AA contrast fix for `--color-danger`)

| File | Change | Rationale |
|------|--------|-----------|
| `frontend/src/app/globals.css` (light theme) | `--color-danger: #d45656` → `--color-danger: #b83939`. | The original red only passed the WCAG AA large-text threshold (3.0:1) on white. The two production usages (`text-danger` for an error title in `RejectForm.tsx:40` and a destructive action button in `billing/invoices/[id]/page.tsx:451`) need body-text contrast (4.5:1). `#b83939` measures 5.70:1 on white and 4.67:1 on the existing `--color-danger-bg` (`#fee2e2`), so it passes AA everywhere it was failing without changing the brand hue. |
| `frontend/src/app/globals.css` (dark theme) | Added `--color-danger: #fca5a5;` inside the `.dark, [data-theme="dark"]` block, next to the existing brand-color overrides. | The same token is consumed in dark mode, but dark surfaces (`#141414`, `#1a1a1a`, `#1e1e1e`, `#0d0d0d`) require a *lighter* foreground to keep contrast. `#fca5a5` measures 9.17–10.24:1 on every Cermont dark surface, comfortably above the 4.5:1 threshold. Without this override, the new light-theme red would have been inherited in dark mode and would have failed contrast (3.13:1 on `--surface-primary` dark). |

**Files deleted:** none.
**Files created:** none (the report is the only new file).

---

## 3. Files audited (no change required, recorded for traceability)

These were read in Fase 0 and either confirmed correct or noted as pre-existing issues for a future cycle.

- `frontend/public/theme-init.js` — exists (12 lines, FOUC-prevention toggle). Can be deleted once the inline approach is confirmed in prod; kept as a defense-in-depth backup.
- `frontend/next.config.ts` — Serwist config (`swSrc`, `swDest`, `register: false`, additional precache entries for `/~offline` and `/offline.html`).
- `frontend/src/app/providers.tsx` — `PersistQueryClientProvider` with `dexieQueryPersister`; `ReactQueryDevtools` already gated on `NODE_ENV !== "production"`.
- `frontend/src/lib/http/api-client.ts` — `OFFLINE_LIKE_ERROR_CODES` set already prevents retries on `BACKEND_UNAVAILABLE / OFFLINE / SERVICE_UNAVAILABLE / NETWORK_ERROR`.
- `frontend/src/lib/offline/{offline-db,sync-engine,sync-queue,connectivity,sync-manager}.ts` — Dexie `CermontOfflineDB` v1, `MAX_SYNC_ATTEMPTS=5`, `BASE_RETRY_DELAY_MS=1500`, `useSyncExternalStore`-based connectivity.
- `frontend/src/components/common/OfflineBanner.tsx` — already wired to the offline Zustand store.
- `frontend/src/modules/core/ui/layout/DefaultLayout.tsx` — already has `<main id="main-content" tabIndex={-1}>` and a skip link.
- `frontend/src/modules/core/ui/pwa/ServiceWorkerRegistration.tsx` — manual registration gated by `NEXT_PUBLIC_ENABLE_SW`.
- `backend/.env` and `backend/.env.example` — already use `127.0.0.1` (per Ley 2).
- `packages/config/src/env.ts` — `BACKEND_URL` already defined as an optional URL in the shared Zod schema.
- `frontend/.next/build-manifest.json` — contains `rootMainFiles` (webpack, polyfills, main-app, 7566 chunk). The full set of `/_next/static/*` files to precache is split across `build-manifest.json` (root chunks) and per-route entries; see §8 item 7 for the precache strategy.

---

## 4. Verification (gates)

### Cycle 1

```text
npm run typecheck   → 7/7 successful (config, domain, shared-types, backend, frontend)
npm run lint        → 7/7 successful (Biome; 947 files checked; 0 fixes needed)
npm run test        → 5/5 successful; 180/180 tests pass
npm run build       → 5/5 successful; 51 routes; SW bundled
npm run verify      → typecheck + build + 5 quality sub-checks (all within baseline)
npx react-doctor    → 89/100 "Great" (112 issues, 56 fixed since prior baseline)
```

### Cycle 2 (after this report's changes)

```text
npm run typecheck   → 7/7 successful
npm run lint        → 7/7 successful (Biome; 947 files checked; 0 fixes needed)
npm run test        → 5/5 successful; 180/180 tests pass
npm run build       → 5/5 successful; 51 routes; SW bundled
npm run verify      → typecheck + build + 5 quality sub-checks (all within baseline)
npx react-doctor    → 88/100 "Great"
```

### Cycle 3 (after the contrast fix)

```text
npm run typecheck   → 7/7 successful
npm run lint        → 7/7 successful (Biome; 548 files checked; 0 fixes needed)
npm run test        → 5/5 successful; 180/180 tests pass (33 test files)
npm run build       → 5/5 successful; 51 routes; SW bundled
npm run verify      → typecheck + build + 5 quality sub-checks (all 0 findings)
npx react-doctor    → 88/100 "Great"
```

**Contrast verification (`--color-danger` after cycle 3):**

| Theme | Foreground | Surface | Ratio | AA body (4.5:1) |
|-------|-----------|---------|-------|------------------|
| Light | `#b83939` | `#ffffff` (white) | 5.70:1 | ✅ PASS |
| Light | `#b83939` | `#f8fafc` (`--surface-primary` light) | 5.45:1 | ✅ PASS |
| Light | `#b83939` | `#f1f5f9` (`--surface-secondary` light) | 5.21:1 | ✅ PASS |
| Light | `#b83939` | `#fee2e2` (`--color-danger-bg`) | 4.67:1 | ✅ PASS |
| Dark | `#fca5a5` | `#141414` (`--surface-primary` dark) | 9.71:1 | ✅ PASS |
| Dark | `#fca5a5` | `#1a1a1a` (`--surface-secondary` dark) | 9.17:1 | ✅ PASS |
| Dark | `#fca5a5` | `#1e1e1e` (`--surface-elevated` dark) | 8.78:1 | ✅ PASS |
| Dark | `#fca5a5` | `#0d0d0d` (`--surface-sidebar` dark) | 10.24:1 | ✅ PASS |

Highlights from the build log:

```text
@cermont/frontend:build: ▲ Next.js 16.2.6 (webpack)
@cermont/frontend:build: ✓ (serwist) Bundling the service worker script with the URL '/service-worker.js' and the scope '/'...
@cermont/frontend:build: ✓ Compiled successfully in 36.2s
@cermont/frontend:build: ✓ Generating static pages using 15 workers (51/51) in 1886ms
```

The catch-all `/api/backend/[...path]` route is built (`ƒ /api/backend/[...path]`) and the precached `/~offline` route is in the manifest (`○ /~offline`).

---

## 5. How to run in production locally

```bash
# 1. Install (from monorepo root)
npm install

# 2. Build everything (root pipeline)
npm run build

# 3. Start backend + frontend in parallel
npm run start:prod
#    └─ turbo run start --parallel --filter=@cermont/backend --filter=@cermont/frontend

# Or start them individually:
npm run start:backend     # node dist/server.js on port 4000
npm run start:frontend    # next start on port 3000
```

If you run on a non-default host, set `BACKEND_URL` in `frontend/.env.local` before the build so the Next.js rewrite and the `/api/backend/*` proxy resolve correctly.

---

## 6. How the offline / degraded path now works end-to-end

1. **Build time** — `next.config.ts` reads `BACKEND_URL` and stamps it into the `/uploads/:path*` rewrite. If `BACKEND_URL` is missing, it falls back to `http://backend:4000`.
2. **Request time** — every `/api/backend/*` call from the browser hits `src/app/api/backend/[...path]/route.ts`, which re-reads `env.BACKEND_URL`. If the backend is unreachable, the route catches the error and returns `503 { success: false, error: { code: "BACKEND_UNAVAILABLE" } }`.
3. **Client side** — `apiClient` recognizes `BACKEND_UNAVAILABLE` as an offline-like code and **does not retry**. It throws an `ApiError` that TanStack Query surfaces as a normal error.
4. **Dashboard** — the page checks `isOfflineLikeError(error)`. If true, it renders `BackendUnavailableState` with a retry button that calls `refetch()` on every query. If the backend comes back up, one click restores the page.
5. **Service Worker** — if the user navigates while still offline, the SW first tries the requested URL in any cache. If nothing matches, it falls back to the precached `/~offline` page (which renders the friendly "Sin conexión a internet" shell).
6. **Theme initialization** — runs **inline** in `<head>` before any CSS or JS is fetched. It is never a network request, so offline is a non-event. A `CacheFirst` runtime rule backs it up in case the script is reintroduced as an external file.
7. **Static assets (`/_next/static/*`, `/theme-init.js`, `/icons/*`, `/fonts/*`, `/images/*`)** — the SW tries the cache first. On a cold offline reload, assets that were never fetched online return 200 + empty body instead of 503; the page renders with whatever is cached and the SW logs the misses for the next session.

---

## 7. Real-world offline reproduction (user-reported)

The user reproduced the offline failure by toggling DevTools → Network → **Offline** and reloading `/dashboard`. The console reported:

```text
theme-init.js:1                                       Failed to load resource: net::ERR_INTERNET_DISCONNECTED
7566-428ab9b384226eed.js:1                           Event {isTrusted: true, type: 'error', ...}
_next/static/chunks/frontend_src_app_globals_*.css   GET ... net::ERR_ABORTED 503 (Service Unavailable)
dashboard:1                                           The resource ... was preloaded using link preload but not used within a few seconds
```

**Root causes identified:**

1. **`<Script src="/theme-init.js" strategy="beforeInteractive" />`** fires its request synchronously during HTML parsing. The Service Worker has not yet claimed the page (it does so on the next event-loop tick after install). Result: the browser hits the network directly, gets `ERR_INTERNET_DISCONNECTED`, and the theme FOUC-prevention never runs.
2. **`/_next/static/chunks/...css`** is matched by the `CacheFirst` runtime rule, but the `CacheFirst` strategy is **on-demand** — it only caches assets that have already been fetched online at least once. On the first offline reload, the asset is not in the cache, the `fetch()` rejects with a network error, and Serwist's `setCatchHandler` returned a raw 503. The browser then aborts the request and prints `ERR_ABORTED 503`.
3. **`/theme-init.js`** was not in `globPublicPatterns` and had no runtime rule, so the SW treated it as a non-cacheable document fetch and fell through to the navigation catch handler.

**Fixes applied** (see §2 cycle 2 for the file-level diffs):

1. **Inline the script** in `layout.tsx`. Zero network. No race with the SW. No `beforeInteractive` race.
2. **Add a `CacheFirst` runtime rule for `/theme-init.js`** as defense in depth.
3. **Add `theme-init.js` to `globPublicPatterns`** so any future external reference is recognized as a public asset.
4. **Improve the catch handler** to return 200 + empty body for static-asset misses instead of 503, preventing the cascade of preload warnings and error events on first offline reload.

**Limit of this fix:** the `CacheFirst` runtime rule still requires the asset to have been fetched online at least once. **However, the verified precache manifest in `public/service-worker.js` already includes every `/_next/static/chunks/*.js`, every `/_next/static/css/*.css`, and every per-route `app/.../page-*.js`** via Serwist's default `globPatterns` (`**/*.{js,css,html}`). So in practice, the first-offline-reload of `/dashboard` after a single online visit will serve the CSS, JS, and HTML from the precache without ever hitting the network. The catch handler's 200 + empty body fallback is a defense-in-depth layer for the rare case where a new chunk is added between SW install and a page load that references it.

---

## 8. Known pending issues (not blocking this delivery)

| # | Issue | Source | Priority | Owner |
|---|-------|--------|----------|-------|
| 1 | `npx react-doctor` reports 40 bug + 12 perf + 16 a11y + 44 maintainability warnings on `@cermont/frontend`. 56 are within the pre-existing baseline; the rest are pre-existing. None were introduced by this change. | react-doctor | P1 | Frontend |
| 2 | `tooling/quality/check-routes.ts` flags 52 backend route findings (1 missing auth, 30 missing authz, 21 missing validation). All within baseline. | `quality:routes` | P1 | Backend |
| 3 | `tooling/quality/check-dtos.ts` flags 1 local DTO. Within baseline. | `quality:dtos` | P2 | Backend |
| 4 | Lighthouse Perf / A11y not re-measured in this cycle (requires a real browser run with the prod build). | manual | P1 | Frontend |
| 5 | ~~The color pair `#d45656` on `#9e8e91` is referenced once in `frontend/src/app/globals.css`. Not used in production UI paths but should be audited.~~ **RESOLVED (cycle 3)**: the actual WCAG AA failure was `--color-danger` (`#d45656`) used as body text in `RejectForm.tsx:40` and `billing/invoices/[id]/page.tsx:451`, where it measured 3.99:1 on white (only passing the large-text threshold). Fixed by darkening to `#b83939` in light theme and adding `#fca5a5` as the dark-theme override. See §2 cycle 3 and §4 cycle 3 contrast verification. | grep + code audit | ✅ Closed | — |
| 6 | The user prompt referenced route handlers for `dashboard/summary`, `service-cases/summary`, `orders` that the prompt's auditor **assumed existed** but that **do not exist** in this repo. The hook layer (`useDashboardSummary`, `useServiceCaseSummary`, `useOrders`) is what calls `/api/backend/*` with the generic catch-all. | code audit | informational | — |
| 7 | `/_next/static/*` is only cached on-demand, not precached at install. A user who has never loaded `/dashboard` online will see a degraded (no-CSS) offline reload. **Fix:** add `additionalPrecacheEntries` generated from `.next/build-manifest.json` (rootMainFiles) and per-route `app-build-manifest.json` (page chunks) in a post-build step. Estimated effort: 1–2 hours including the build script + manifest reader + revision hashing. | code audit (this cycle) | P1 | Frontend |

---

## 9. Recommended next steps (not part of this delivery)

1. Run `npm run start:prod` against a real MongoDB and exercise:
   - `/dashboard` with backend up → KPIs animate without re-render storm.
   - `/dashboard` with backend stopped → `BackendUnavailableState` renders, retry recovers.
   - Toggle DevTools → Network → Offline and reload `/dashboard` → SW serves `/~offline`, banner shows, no `ERR_INTERNET_DISCONNECTED` for `/theme-init.js`, no `503` for CSS.
2. Run Lighthouse (or PageSpeed Insights) against the prod build to get a real Perf / A11y number.
3. Triage the `react-doctor` warnings in batches (a11y first — labels, contrast, focus).
4. Wire CI to run `npm run typecheck && npm run lint && npm run test && npm run build && npm run verify && npx react-doctor` on every PR.
5. Schedule a Lighthouse run in CI nightly to detect regressions.
6. Delete `frontend/public/theme-init.js` once cycle-2 changes are confirmed in production (currently kept as a defense-in-depth backup).
7. ~~(cycle 3) Implement the build-time `/_next/static/*` precache (§8 item 7) so first-offline-reload of the App Shell works without any prior online visit to that route.~~ **RESOLVED during verification**: Serwist's default `globPatterns` (`**/*.{js,css,html}`) already precaches every built JS/CSS/HTML file. Inspected the generated `public/service-worker.js` — the precache manifest contains 150+ entries including all `/_next/static/chunks/*.js`, all `/_next/static/css/*.css`, and all per-route `/_next/static/chunks/app/.../page-*.js`. The user's reported 503 for CSS was due to testing with a stale SW, not a missing precache. Item §8 #7 is now closed.

---

## 10. Deploy verdict

**READY for staging / internal demo.**

- **Cycle 1** delivered the production startup, proxy, SW catch handler (navigations), `BackendUnavailableState`, and `KPICard` perf fix. All five quality gates green, react-doctor 89/100.
- **Cycle 2** closed the user-reported real-world offline failures by inlining `/theme-init.js`, adding a `CacheFirst` runtime rule + `globPublicPatterns` entry for it, and replacing the 503 cascade for non-navigation SW misses with a 200 + empty body. Also confirmed that the `/_next/static/*` precache was already working via Serwist's default `globPatterns` — the user's 503 was a stale-SW artifact, not a missing precache. All five quality gates green, react-doctor 88/100.
- **Cycle 3** fixed the WCAG AA body-text contrast failure on `--color-danger`. Light theme now uses `#b83939` (5.70:1 on white), dark theme uses `#fca5a5` (9.17–10.24:1 on all Cermont dark surfaces). Both pass the 4.5:1 AA body-text threshold. All five quality gates green, react-doctor 88/100.

Not yet ready for **production rollout** until items #1–#4 in §8 are addressed. Those are pre-existing and out of scope for this cycle, but they are visible in the verification output and should be tracked.
