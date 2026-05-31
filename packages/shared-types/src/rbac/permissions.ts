/**
 * Permissions — re-exported from @cermont/domain (SSOT).
 *
 * @cermont/domain is the single source of truth for permission types,
 * role-to-permission mappings, and authorization helpers.
 * This file re-exports them for backward compatibility with
 * `@cermont/shared-types/rbac` imports.
 *
 * @packageDocumentation
 */

export {
	checkAllPermissions,
	hasPermission,
	type Permission,
	ROLE_PERMISSIONS,
} from "@cermont/domain";
