# TestSprite — Cermont S.A.S. Test Suite

## Overview

This directory contains the complete [TestSprite](https://www.testsprite.com) test suite for the Cermont S.A.S. operational management platform.

- **20 Frontend test plans** (JSON) — end-to-end browser tests for all user flows
- **7 Backend test scripts** (Python) — API integration tests for all modules
- **~130 pages** and **57 backend modules** covered across all plans

## Prerequisites

- Node.js 20.19+, 22.13+, or 24+
- TestSprite CLI: `npm install -g @testsprite/testsprite-cli`
- TestSprite API key from [https://www.testsprite.com](https://www.testsprite.com)

## Quick Start

### 1. Setup TestSprite

```powershell
# One-time setup
testsprite setup

# Or using env var (non-interactive)
$env:TESTSPRITE_API_KEY = "sk-your-key-here"
testsprite setup --from-env --yes --agent codex
```

### 2. Verify Installation

```powershell
testsprite doctor
# Expected: all checks pass (CLI, Node, Profile, Credentials, Connectivity)
```

### 3. Create a Project

```powershell
testsprite project create --name "Cermont App" --description "Cermont S.A.S. Platform"
# Save the project ID (e.g., proj_8f0f6...)
```

### 4. Update Project ID in Plans

Replace `<run: testsprite project list>` in each `.plan.json` with your actual project ID.

### 5. Run Frontend Tests

```powershell
# Run a single test
testsprite test create --plan-from .testsprite/plans/frontend/01-auth-login.plan.json --run --wait

# Run all frontend tests (PowerShell)
Get-ChildItem .testsprite/plans/frontend/*.plan.json | ForEach-Object {
    testsprite test create --plan-from $_.FullName --run --wait
}
```

### 6. Run Backend Tests

```powershell
# First start the backend server
npm run dev -w backend

# Then run the Python tests (they need the API running)
testsprite test create --plan-from .testsprite/plans/backend/01-auth-api.py --type backend --run --wait
```

### 7. View Results

```powershell
# List all tests
testsprite test list --project <project-id>

# Get failure bundle for debugging
testsprite test failure get <test-id>
```

## Test Plan Structure

### Frontend Plans (JSON)
```
.testsprite/plans/frontend/
├── 01-auth-login.plan.json        # Login flow with JWT
├── 02-auth-register.plan.json     # User registration
├── 03-dashboard-overview.plan.json # Dashboard KPIs
├── 04-orders-crud.plan.json       # Orders CRUD + Kanban
├── 05-work-requests.plan.json     # Work request lifecycle
├── 06-proposals.plan.json         # Proposals flow
├── 07-evidences.plan.json         # Evidence management
├── 08-billing-ses.plan.json       # SES lifecycle
├── 09-billing-invoices.plan.json  # Invoice lifecycle
├── 10-execution-sessions.plan.json # Field execution
├── 11-maintenance.plan.json       # Maintenance tasks
├── 12-reports.plan.json           # Report generation
├── 13-costs.plan.json             # Cost tracking
├── 14-planning.plan.json          # Order planning
├── 15-admin-users.plan.json       # User management
├── 16-resources-kits.plan.json    # Tool/kit management
├── 17-site-visits.plan.json       # Site visits
├── 18-purchase-orders.plan.json   # Purchase orders
├── 19-client-portal.plan.json     # Client portal
├── 20-offline-sync.plan.json      # Offline sync
```

### Backend Plans (Python)
```
.testsprite/plans/backend/
├── 01-auth-api.py                 # Auth endpoints
├── 02-orders-api.py               # Orders CRUD + workflow
├── 03-evidences-api.py            # Evidence upload
├── 04-proposals-ses-invoice.py    # Billing pipeline
├── 05-users-dashboard-health.py   # Users + Dashboard + Health
├── 06-execution-planning.py       # Execution + Planning
├── 07-work-requests-maintenance.py # WR + Maintenance + Resources
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/testsprite.yml
name: TestSprite Verification
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm install -g @testsprite/testsprite-cli
      - run: testsprite setup --from-env --yes --agent codex
        env:
          TESTSPRITE_API_KEY: ${{ secrets.TESTSPRITE_API_KEY }}
      - run: |
          for plan in .testsprite/plans/frontend/*.plan.json; do
            testsprite test create --plan-from "$plan" --run --wait
          done
```

## Test Coverage by Business Flow

| Phase | Module | Test Plan | Priority |
|-------|--------|-----------|----------|
| 1 | Work Request | `05-work-requests.plan.json` | P0 |
| 2 | Site Visit | `17-site-visits.plan.json` | P2 |
| 3 | Proposal | `06-proposals.plan.json` | P0 |
| 4 | Purchase Order | `18-purchase-orders.plan.json` | P1 |
| 5 | Planning | `14-planning.plan.json` | P1 |
| 6 | Execution | `10-execution-sessions.plan.json` | P0 |
| 7 | Evidence | `07-evidences.plan.json` | P1 |
| 8 | Report | `12-reports.plan.json` | P1 |
| 9 | Delivery Record | `12-reports.plan.json` | P1 |
| 10 | Client Signature | `19-client-portal.plan.json` | P1 |
| 11 | SES | `08-billing-ses.plan.json` | P0 |
| 12 | Invoice | `09-billing-invoices.plan.json` | P0 |
| 13 | Payment | `09-billing-invoices.plan.json` | P0 |

## Tips

- Use `--dry-run` flag to preview test behavior without consuming credits
- Use `testsprite test lint` to validate plan files offline
- Backend tests require MongoDB and the backend server running
- Frontend tests run against the deployed app URL (local or staging)
- Update plan priorities if needed (p0=critical, p1=important, p2=minor, p3=optional)
