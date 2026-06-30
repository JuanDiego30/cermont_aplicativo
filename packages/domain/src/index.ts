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
 * - workflow/: 14-step service-case state machine and blocker helpers
 */

export type { BillingState, BillingStep } from "./billing.rules";
// ─── Billing Rules ──────────────────────────────────────────────────────────
export {
	BILLING_CHAIN_STEPS,
	BILLING_STEP_DESCRIPTIONS,
	BILLING_STEP_LABELS,
	getNextBillingAction,
} from "./billing.rules";
export type {
	ChecklistBlockerCode,
	ChecklistItemResult,
	ChecklistReadiness,
	ChecklistReadinessBlocker,
	ChecklistReadinessItem,
} from "./checklist.rules";
export { evaluateChecklistReadiness } from "./checklist.rules";
export type { ClosureBlocker, ServiceCaseClosureContext } from "./closure.rules";
// ─── Closure Rules ──────────────────────────────────────────────────────────
export {
	canCloseServiceCase,
	canCreateInvoice,
	canCreateSES,
	canDeleteServiceCase,
	canRegisterPayment,
} from "./closure.rules";
export type {
	CostBudgetAssessment,
	CostBudgetRisk,
	CostBudgetValue,
	CostEntry,
	CostProfitability,
} from "./cost.rules";
// ─── Cost Rules ─────────────────────────────────────────────────────────────
export {
	COST_REQUIRED_FIELDS,
	calculateGrossMargin,
	calculateMargin,
	calculateVariance,
	evaluateCostBudgetRisk,
	formatCostValue,
	isCostMissing,
} from "./cost.rules";
export type {
	ExecutionBlockerCode,
	ExecutionGateContext,
	ExecutionNextActionCode,
	ExecutionReadModel,
	ExecutionSessionStatus,
} from "./execution";
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
// ─── Fleet Readiness Rules ────────────────────────────────────────────────────
export type { FleetBlocker, FleetReadiness, VehicleDocumentStatus } from "./fleet-readiness.rules";
export { evaluateFleetReadiness } from "./fleet-readiness.rules";
// ─── Kit Rules ──────────────────────────────────────────────────────────────
export type {
	ApplyKitDecision,
	ArchiveKitDecision,
	DeleteKitDecision,
	KitChecklistRequirementDomainModel,
	KitDocumentRequirementDomainModel,
	KitDomainModel,
	KitItemDomainModel,
	KitReadinessRuleDomainModel,
	KitRiskLevel,
	KitStatus,
	ReadinessResult,
} from "./kit.rules";
export {
	calculateKitReadiness,
	canActivateKit,
	canApplyKitToPlanning,
	canArchiveKit,
	canDeleteKit,
	canRestoreKit,
	getAllKitItems,
	getCriticalItemCount,
	getMissingCriticalKitItems,
} from "./kit.rules";
// ─── Operational Steps ──────────────────────────────────────────────────────
export type {
	CanonicalOperationalStepCode,
	LegacyOperationalStepCode,
	OperationalStep,
	OperationalStepCodeNormalization,
	OperationalStepKey,
	OperationalStepStatus,
} from "./operational-steps";
export {
	CANONICAL_CODES,
	getNextStep,
	getOperationalStepCodeAliases,
	isValidStepKey,
	LEGACY_OPERATIONAL_STEP_CODES,
	normalizeOperationalStepCode,
	OPERATIONAL_STEPS,
	STEP_BY_KEY,
	STEP_KEYS,
} from "./operational-steps";
// ─── Permissions ────────────────────────────────────────────────────────────
export type { Permission } from "./permissions";
export {
	checkAllPermissions,
	getRolePermissions,
	hasPermission,
	ROLE_PERMISSIONS,
} from "./permissions";
// ─── Planning Rules ─────────────────────────────────────────────────────────
export type { PlanningBlocker, PlanningDocumentType, PlanningReadiness } from "./planning.rules";
export {
	getMaxBlockerSeverity,
	getPlanningBlockers,
	isPlanningReady,
	REQUIRED_PLANNING_DOCUMENTS,
} from "./planning.rules";
// ─── RBAC ───────────────────────────────────────────────────────────────────
export {
	canAccessModule,
	canAccessPath,
	canPerformAction,
	getAllowedRolesForPath,
	hasAllPermissions,
	isPublicPath,
	PUBLIC_PATHS,
	ROUTE_ACCESS_RULES,
} from "./rbac";
// ─── Roles ─────────────────────────────────────────────────────────────────
export type { UserRole } from "./roles";
export {
	ADMIN_PLUS_RESIDENTE,
	ADMIN_ROLES,
	AI_ASSISTANT_ROLES,
	ALL_AUTHENTICATED_ROLES,
	APPROVER_ROLES,
	ASSET_MANAGEMENT_ROLES,
	AUDIT_ACCESS_ROLES,
	BILLING_ACCESS_ROLES,
	DASHBOARD_ACCESS_ROLES,
	DEFAULT_NEW_USER_ROLE,
	DEFAULT_USER_ROLE,
	DOCUMENT_MANAGEMENT_ROLES,
	EVIDENCE_ACCESS_ROLES,
	FIELD_EXECUTION_ACCESS_ROLES,
	FIELD_MANAGEMENT_ROLES,
	FINANCE_ACCESS_ROLES,
	getRoleName,
	hasRole,
	INTERNAL_ROLES,
	isAuthenticatedRole,
	isUserRoleInput,
	LEGACY_ROLE_ALIASES,
	MAINTENANCE_MANAGEMENT_ROLES,
	MANAGEMENT_ROLES,
	normalizeUserRole,
	PLANNING_ACCESS_ROLES,
	REPORT_ROLES,
	REPORTING_ACCESS_ROLES,
	RESOURCE_ROLES,
	ROLE_HIERARCHY,
	ROLE_LABELS,
	resolveUserRole,
	SITE_VISIT_CANCEL_ROLES,
	SITE_VISIT_EXECUTION_ROLES,
	SITE_VISIT_MANAGEMENT_ROLES,
	SUPERVISORY_ROLES,
	TECHNICAL_EXECUTION_ROLES,
} from "./roles";
export type {
	CermontOperationalStep,
	CermontOperationalStepKey,
	CermontOperationalStepStatus,
	ServiceCaseEvent,
	ServiceCaseState,
	ServiceCaseWorkflowSnapshot,
	StepLookupResult,
	StepRequirement,
	TransitionResult,
	WorkflowAction,
	WorkflowBlocker,
	WorkflowContext,
} from "./workflow";
// ─── Service Case Workflow State Machine ───────────────────────────────────
export {
	buildBlockers,
	CERMONT_OPERATIONAL_STEP_BY_KEY,
	CERMONT_OPERATIONAL_STEP_KEYS,
	CERMONT_OPERATIONAL_STEPS,
	canAdvanceStep,
	getAllowedActions,
	getCurrentStep,
	getNextOperationalStepByKey,
	getNextStep as getNextServiceCaseStep,
	getOperationalStepByKey,
	getStepRequirements,
	isValidOperationalStepKey,
	ServiceCaseStateMachine,
} from "./workflow";
