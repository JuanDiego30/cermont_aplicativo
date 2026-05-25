/**
 * Domain package — Single Source of Truth for business rules, roles, and permissions
 *
 * Exports:
 * - roles.ts: Role definitions and validation
 * - permissions.ts: Granular permissions mapping
 * - rbac.ts: Role-based and permission-based access control
 * - operational-steps.ts: 14-step CERMONT pipeline definitions
 * - planning.rules.ts: Planning readiness gates
 * - execution.ts: Execution session rules and blockers
 * - closure.rules.ts: Administrative closure chain gates
 * - billing.rules.ts: SES/Invoice/Payment chain definitions
 * - cost.rules.ts: Cost display and validation rules
 */

// ─── Roles ─────────────────────────────────────────────────────────────────
export type { UserRole } from "./roles";
export {
	ADMIN_PLUS_RESIDENTE,
	ADMIN_ROLES,
	ALL_AUTHENTICATED_ROLES,
	APPROVER_ROLES,
	ASSET_MANAGEMENT_ROLES,
	BILLING_ACCESS_ROLES,
	DASHBOARD_ACCESS_ROLES,
	EVIDENCE_ACCESS_ROLES,
	FIELD_EXECUTION_ACCESS_ROLES,
	FINANCE_ACCESS_ROLES,
	hasRole,
	INTERNAL_ROLES,
	isAuthenticatedRole,
	MAINTENANCE_MANAGEMENT_ROLES,
	MANAGEMENT_ROLES,
	normalizeUserRole,
	PLANNING_ACCESS_ROLES,
	REPORT_ROLES,
	RESOURCE_ROLES,
	ROLE_HIERARCHY,
	ROLE_LABELS,
	SITE_VISIT_CANCEL_ROLES,
	SITE_VISIT_EXECUTION_ROLES,
	SITE_VISIT_MANAGEMENT_ROLES,
} from "./roles";

// ─── Permissions ────────────────────────────────────────────────────────────
export {
	checkAllPermissions,
	hasPermission,
	ROLE_PERMISSIONS,
} from "./permissions";

// ─── RBAC ───────────────────────────────────────────────────────────────────
export {
	canAccessPath,
	canPerformAction,
	getAllowedRolesForPath,
	hasAllPermissions,
	isPublicPath,
	PUBLIC_PATHS,
} from "./rbac";

// ─── Operational Steps ──────────────────────────────────────────────────────
export {
	OPERATIONAL_STEPS,
	STEP_BY_KEY,
	STEP_KEYS,
	getNextStep,
	getStep,
	isValidStepKey,
} from "./operational-steps";
export type { OperationalStep, OperationalStepKey, OperationalStepStatus } from "./operational-steps";

// ─── Execution Rules ────────────────────────────────────────────────────────
export {
	calculateExecutionBlockers,
	calculateExecutionNextActions,
	canCancelExecution,
	canCompleteExecution,
	canCreateExecutionSession,
	canPauseExecution,
	canResumeExecution,
	canStartExecution,
	mergeLaborEntries,
	mergeMaterialUsage,
	validateExecutionCommandIdempotency,
	validateRequiredChecklistResponses,
	validateRequiredEvidence,
	validateRequiredSignatures,
} from "./execution";
export type {
	ExecutionBlockerCode,
	ExecutionGateContext,
	ExecutionNextActionCode,
	ExecutionReadModel,
	ExecutionSessionStatus,
} from "./execution";

// ─── Planning Rules ─────────────────────────────────────────────────────────
export {
	getMaxBlockerSeverity,
	getPlanningBlockers,
	isPlanningReady,
	REQUIRED_PLANNING_DOCUMENTS,
} from "./planning.rules";
export type { PlanningBlocker, PlanningDocumentType, PlanningReadiness } from "./planning.rules";

// ─── Closure Rules ──────────────────────────────────────────────────────────
export {
	canCloseServiceCase,
	canCreateInvoice,
	canCreateSES,
	canDeleteServiceCase,
	canRegisterPayment,
} from "./closure.rules";
export type { ClosureBlocker, ServiceCaseClosureContext } from "./closure.rules";

// ─── Billing Rules ──────────────────────────────────────────────────────────
export {
	BILLING_CHAIN_STEPS,
	BILLING_STEP_DESCRIPTIONS,
	BILLING_STEP_LABELS,
	getNextBillingAction,
} from "./billing.rules";
export type { BillingState, BillingStep } from "./billing.rules";

// ─── Cost Rules ─────────────────────────────────────────────────────────────
export {
	calculateMargin,
	calculateVariance,
	COST_REQUIRED_FIELDS,
	formatCostValue,
	isCostMissing,
} from "./cost.rules";
export type { CostEntry } from "./cost.rules";
