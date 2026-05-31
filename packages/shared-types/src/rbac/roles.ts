/**
 * Role definitions — re-exported from @cermont/domain (SSOT).
 *
 * @cermont/domain is the single source of truth for all role types,
 * constants, and validation helpers. This file re-exports them for
 * backward compatibility with `@cermont/shared-types/rbac` imports.
 *
 * @packageDocumentation
 */

export {
	ADMIN_PLUS_RESIDENTE,
	ADMIN_ROLES,
	AI_ASSISTANT_ROLES,
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
	isUserRoleInput,
	LEGACY_ROLE_ALIASES,
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
	type UserRole,
} from "@cermont/domain";
