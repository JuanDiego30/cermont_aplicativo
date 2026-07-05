# Vercel Deployment Reference Audit — Cermont S.A.S.

This audit evaluates standard Vercel deployment features against Cermont's custom VPS deployment architecture (Contabo, PM2, Docker), establishing categorizations for local implementation.

| Vercel Feature | Best Practice | Cermont VPS Equivalent | Action Category Tag |
|----------------|---------------|------------------------|---------------------|
| **Production Builds** | Optimized production bundles with asset minification and tree shaking. | Handled via Next.js and Express build scripts running inside Docker multi-stage containers. | `REFERENCE_ONLY` |
| **Environment Variables** | Secure environment variables injected during build/runtime. | Configured via PM2 `ecosystem.config.cjs` and local `.env` files managed by deploy scripts. | `REFERENCE_ONLY` |
| **Preview Deployments** | Automatic deployment of pull request branches to staging/preview URLs. | VPS lacks automatic branch preview URLs. Developers test locally or on a shared staging server. | `OPTIONAL_PREVIEW_QA` |
| **Log Management** | Real-time structured log streaming with integrations (Datadog, Axiom). | PM2 handles log rotations and outputs standard server logs to `backend/logs/`. | `REFERENCE_ONLY` |
| **Rollbacks** | Instant rollback to previous stable deployment sha with a single click. | Handled via Git revert/reset workflows on VPS deployment branch. PM2 reload triggers updates. | `REFERENCE_ONLY` |
| **Observability & Analytics**| Serverless function durations, cold start logging, and Core Web Vitals. | PM2 dashboard and local metrics. System monitors (healthcheck endpoints) report status. | `REFERENCE_ONLY` |
| **CI/CD Integration** | Automated deployments on repository push (GitHub integration). | GitHub Actions run tests and validation gates before instructing VPS PM2 to deploy. | `REFERENCE_ONLY` |
| **Source Maps** | Private source maps uploaded for error tracking without exposing source. | Biome and TS build configs optimize maps for production errors. | `REFERENCE_ONLY` |
| **Domain Routing** | Instant domain SSL routing and proxy redirection. | Managed via Nginx reverse proxy configuration on Contabo VPS. | `BLOCKED_BY_VPS_ONLY_RULE` |
