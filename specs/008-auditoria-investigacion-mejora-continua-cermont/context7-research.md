# Next.js 16 (Context7) Research — Cermont S.A.S.

This research analyzes modern Next.js 16 App Router practices and maps their applicability to the Cermont web application.

| Topic | Next.js 16 Recommendation | CERMONT Application | Action |
|-------|--------------------------|---------------------|--------|
| **Dynamic Routing Params** | Route params (`params`, `searchParams`) are now Promises and must be awaited before accessing properties. | Route components under `src/app/` receive dynamic route properties. | Ensure all occurrences of `params` and `searchParams` are awaited (e.g. `const resolvedParams = await params`). |
| **Security Perimeter** | Intercept requests and enforce security via custom Proxy or server-side routing files instead of `middleware.ts`. | Cermont uses `proxy.ts` as the primary API router and session refresh perimeter. | Maintain and protect `proxy.ts`. Do not introduce `middleware.ts`. |
| **Error Handling** | Implement segment-level `error.tsx` and `not-found.tsx` to isolate and gracefully handle rendering errors. | Frontend uses localized error boundaries for dashboard, orders, and execution. | Verify that every route group has appropriate `error.tsx` or fallback bounds. |
| **SEO & Metadata** | Use `generateMetadata()` for dynamic pages or `export const metadata` static definition at the page level. | React Doctor reported missing metadata in legal pages (`privacy`, `consent`). | Add appropriate metadata configurations to legal pages. |
| **Resource Optimization** | Use standard Next.js components (`next/image`, `next/font`) for automatic compression and layout shift prevention. | Images and assets loaded throughout dashboard and vehicle detail screens. | Audit images to ensure custom components wrap them with standard optimization props. |
| **Data Caching** | Leverage standard TanStack Query caching for Client Components and server state cache headers. | TanStack Query v5 is the official server state manager in the frontend. | Ensure query keys are unique and staleTime/gcTime are configured appropriately. |
| **PWA & Manifest** | Set up `manifest.json` and service worker registrations via Next.js plugins (e.g., Serwist). | Cermont uses Serwist v9 for service worker offline syncing and service worker. | Maintain Serwist configuration in `next.config.ts` and verify offline mutation sync. |
| **OpenTelemetry** | Implement native observability via `instrumentation.ts` in Next.js. | Logs and audit trails need structured tracing. | Add telemetry bootstrap once ready for multi-tenant monitoring (P3). |
| **PPR (Partial Prerendering)**| Use PPR to prerender static shell and stream dynamic contents. | Dashboard uses async panels. | Keep dashboard components wrapped in `<Suspense>` bounds. |
| **Security Headers** | Enforce security headers (CSP, HSTS, X-Frame-Options) via configuration. | Handled via proxy and server configurations. | Ensure proxy rules enforce secure headers. |
| **Bundle Splitting** | Lazy-load heavy components (e.g. charts, maps, PDF generators) using `next/dynamic`. | PDF-lib and Recharts are used in cost/report screens. | Wrap charts and generators with dynamic imports. |
| **Performance Gates** | Keep hydration mismatch issues to 0. | Time/date rendering causes hydration mismatches in alerts banner. | Fix JSX time dependencies (move dynamic values to `useEffect` or state). |
