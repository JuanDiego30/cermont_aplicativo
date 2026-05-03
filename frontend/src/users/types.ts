/**
 * User Types — Re-exports from @cermont/shared-types (SSOT)
 *
 * All entity types live in shared-types. This file only re-exports
 * for convenience so local consumers don't need to change imports.
 */
export type {
	CreateUserInput,
	LoginInput,
	UpdateUserInput,
	User,
	UserRole,
} from "@cermont/shared-types";

// ── API response envelope types (not in shared-types) ──
import type { User } from "@cermont/shared-types";

/** Response shape for GET /users (paginated list) */
export type UserList = {
	success: boolean;
	data: User[];
	total: number;
	message?: string;
};

/** Response shape for GET /users/:id (single user detail) */
export type UserDetail = {
	success: boolean;
	data?: User;
	error?: string;
	message?: string;
};
