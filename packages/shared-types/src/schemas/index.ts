// Barrel export for all Zod schemas
// Reference: DOC-09 Section SSOT (Single Source of Truth)
//
// NOTE: AuditLog + TokenBlacklist are backend-only
// They are NOT exported from this barrel file per DOC-09
// Backend imports them directly from apps/backend/src/schemas/

export * from "./ai.schema";
export * from "./analytics.schema";
export * from "./audit.schema";
export * from "./auth.schema";
export * from "./checklist.schema";
// Additional business domain schemas
export * from "./closureReport.schema";
// Authentication schemas
export * from "./common.schema";
export * from "./cost.schema";
export * from "./costControl.schema";
export * from "./document.schema";
export * from "./evidence.schema";
export * from "./history.schema";
export * from "./inspection.schema";
export * from "./kit.schema";
export * from "./maintenanceKit.schema";
export * from "./order.schema";
export * from "./pipeline.schema";
export * from "./proposal.schema";
export * from "./report.schema";
export * from "./resource.schema";
export * from "./sync.schema";
export * from "./tariff.schema";
// Core business schemas
export * from "./user.schema";
// Work Order FSM (State Machine)
export * from "./work-order-fsm";
