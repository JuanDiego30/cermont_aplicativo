# Slice 12 — SaaS Multitenancy Foundation Specification

## 1. Objective
Establish multi-tenant isolation, allowing Cermont S.A.S. to serve multiple companies on the same application stack safely.

## 2. Technical Scope
- **Tenant Schema isolation**: Apply a `tenantId` field to all collection models. Configure Express middleware to enforce tenant scoping.
- **Tenant Brand customizer**: Dynamic theme storage (brand logo FileAsset, color palette settings) rendered on login.
- **Pricing & Billing integration**: Basic billing plans mapping tenant usage (e.g. number of active orders or storage size) to tiers.

## 3. Impacted Files
- [NEW] `backend/src/models/Tenant.ts`
- [MODIFY] `backend/src/middlewares/authenticate.ts` (extract tenantId from JWT)
- [MODIFY] `backend/src/models/index.ts` (inject tenant query filters)
- [NEW] `frontend/src/modules/admin/ui/TenantBillingSetup.tsx`

## 4. Verification Scenario
Simulate requests from two different tenants and verify that query results are strictly isolated.
