/**
 * RBAC (Role-Based Access Control) — re-exported from @cermont/domain (SSOT).
 *
 * @cermont/domain is the single source of truth for route-level access control,
 * public path definitions, and authorization helpers.
 * This file re-exports them for backward compatibility with
 * `@cermont/shared-types/rbac` imports.
 *
 * @packageDocumentation
 */

export {
	canAccessPath,
	canPerformAction,
	hasAllPermissions,
	hasRole,
	isPublicPath,
	PUBLIC_PATHS,
} from "@cermont/domain";
