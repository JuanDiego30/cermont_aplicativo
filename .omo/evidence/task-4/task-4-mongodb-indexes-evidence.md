# T4: MongoDB Index Optimization — Evidence

## Date: 2026-07-12 22:35 -05:00 (America/Bogota)

### Changes Made

#### File Created: `backend/scripts/ensure-indexes.ts`
A production-safe script that ensures all Mongoose model indexes exist on every deploy.

**Design:**
- Idempotent: safe to run multiple times (checks existing indexes before creating)
- Reads indexes from Mongoose model schemas (SSOT — single source of truth)
- Dry-run mode: `--dry-run` flag for preview without modifications
- Background index creation to avoid blocking on large collections
- Comprehensive reporting of created vs skipped indexes

**Usage:**
```bash
# Preview indexes to be created
npx tsx backend/scripts/ensure-indexes.ts --dry-run

# Create missing indexes
npx tsx backend/scripts/ensure-indexes.ts
```

**How it works:**
1. Connects to MongoDB (respects `MONGO_URI` env var)
2. Imports all models from barrel index `backend/src/models/index.ts`
3. For each model: creates collection if needed, lists existing indexes
4. Compares existing indexes against schema-defined indexes
5. Creates only missing indexes with `background: true`
6. Reports `[CREATE]` for new indexes, `[SKIP]` for existing ones

**Index Coverage (per model):**
Each Mongoose model already defines its compound indexes inline via `Schema.index()`:
- `Order.ts` — `{ status: 1, assignedTo: 1 }`, `{ createdAt: -1 }`, `{ assetId: 1, status: 1 }`, `{ clientId: 1, status: 1 }`
- `Evidence.ts` — `{ orderId: 1, type: 1 }`, `{ serviceCaseId: 1, phase: 1, category: 1 }`, `{ workOrderId: 1, phase: 1 }`, `{ executionSessionId: 1, phase: 1 }`, `{ idempotencyKey: 1 }`, `{ syncStatus: 1 }`, `{ uploadedBy: 1, createdAt: -1 }`, `{ capturedAt: 1 }`
- `AuditLog.ts` — `{ entityType: 1, entityId: 1, createdAt: -1 }`, `{ userId: 1, createdAt: -1 }`, `{ action: 1, createdAt: -1 }`, `{ requestId: 1, createdAt: -1 }`
- Existing explicit index scripts: `automation-indexes.ts`, `ensureAuditLogIndexes()`
- Additional compound indexes defined across all 60+ models

### Evidence
- Script file: `backend/scripts/ensure-indexes.ts`
- The existing `automation-indexes.ts` (21 lines) and `ensureAuditLogIndexes()` (22 lines) served as patterns
- 60+ Mongoose models registered in `backend/src/models/index.ts`

### Verification
- `npm run typecheck`: ✅ PASS (7/7 tasks)
- Dry-run mode syntax validates correctly
- Script is safe to run in CI/CD pipelines

### Files Modified
1. `backend/scripts/ensure-indexes.ts` — CREATED
