/**
 * RBAC package — re-exported from @cermont/domain (SSOT).
 *
 * All canonical role definitions, permission mappings, and authorization
 * helpers live in @cermont/domain. This barrel re-exports them under the
 * `@cermont/shared-types/rbac` path for backward compatibility.
 *
 * @packageDocumentation
 */

// ─── Roles ───────────────────────────────────────────────────────────────────
export type { UserRole } from "@cermont/domain";
// Backward-compatible aliases
export {
	ADMIN_PLUS_RESIDENTE,
	ADMIN_ROLES,
	AI_ASSISTANT_ROLES,
	ALL_AUTHENTICATED_ROLES,
	ALL_AUTHENTICATED_ROLES as ALL_USER_ROLE_INPUTS,
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
} from "@cermont/domain";

import { ADMIN_PLUS_RESIDENTE as _ADMIN_PLUS_RESIDENTE } from "@cermont/domain";
export const ADMIN_PLUS_RESIDENT_ENGINEER = _ADMIN_PLUS_RESIDENTE;

// ─── Permissions ────────────────────────────────────────────────────────────
export type { Permission } from "@cermont/domain";
// ─── RBAC (route-level) ─────────────────────────────────────────────────────
export {
	canAccessPath,
	canPerformAction,
	checkAllPermissions,
	hasAllPermissions,
	hasPermission,
	isPublicPath,
	PUBLIC_PATHS,
	ROLE_PERMISSIONS,
} from "@cermont/domain";
