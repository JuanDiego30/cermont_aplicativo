/**
 * User Service — Business Logic Layer
 *
 * DOC-10 §3 compliance:
 * - CRUD operations for users
 * - Password hashing on create
 * - Soft delete (deactivation) instead of hard delete
 * - No HTTP logic — pure business operations
 *
 * No Express imports. Throws AppError for business rule violations.
 * Controllers call this service and handle HTTP responses.
 *
 * FIX: Use Repository Pattern instead of direct model access
 * FIX: Strong typing with UserDocument from shared-types
 */

import type {
	CreateUserInput,
	UpdateUserInput,
	UserDocument,
	UserRole,
} from "@cermont/shared-types";
import { isAuthenticatedRole } from "@cermont/shared-types/rbac";
import { BadRequestError, ConflictError, NotFoundError } from "../../_shared/common/errors";
import { container } from "../../_shared/config/container";

export interface UserResponse {
	_id: string;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
	phone?: string;
	avatarUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Validate role against enum — per ISSUE-032
 * DOC-04 §6: RBAC must validate against canonical roles
 */
function validateRole(role: string): void {
	if (!isAuthenticatedRole(role)) {
		throw new BadRequestError(`Invalid role '${role}'`);
	}
}

/**
 * Format user document for API response (exclude sensitive fields)
 */
function formatUserResponse(doc: UserDocument): UserResponse {
	return {
		_id: doc._id.toString(),
		name: doc.name,
		email: doc.email,
		role: doc.role,
		isActive: doc.isActive,
		phone: doc.phone,
		avatarUrl: doc.avatarUrl,
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt,
	};
}

/**
 * Create a new user
 *
 * @param payload - CreateUserPayload (name, email, password, role, phone?)
 * @returns UserResponse
 * @throws ConflictError if email already exists
 * @throws BadRequestError if validation fails
 *
 * Password hashing is automatic via User model's pre('save') hook.
 */
export async function createUser(payload: CreateUserInput): Promise<UserResponse> {
	// Validate role per ISSUE-032
	validateRole(payload.role);

	// Check if email already exists
	const existingUser = await container.userRepository.findByEmail(payload.email);
	if (existingUser) {
		throw new ConflictError(`User with email '${payload.email}' already exists`);
	}

	// Create new user document
	// Password will be hashed automatically by Mongoose pre-save hook
	const user = await container.userRepository.create({
		name: payload.name,
		email: payload.email,
		password: payload.password,
		role: payload.role,
		phone: payload.phone,
		isActive: true,
	});

	return formatUserResponse(user);
}

/**
 * Get all users (paginated)
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param filters - Optional: { role?, isActive? }
 * @returns { users: UserResponse[], total, page, limit, pages }
 */
export async function listUsers(
	page: number = 1,
	limit: number = 50,
	filters?: { role?: UserRole; isActive?: boolean },
) {
	const query: Record<string, unknown> = {};

	if (filters?.role) {
		query.role = filters.role;
	}

	if (filters?.isActive !== undefined) {
		query.isActive = filters.isActive;
	}

	const skip = (page - 1) * limit;
	const total = await container.userRepository.countDocuments(query);
	const users = await container.userRepository.findPaginated(query, {
		skip,
		limit,
		sort: { createdAt: -1 },
		select: "-password",
	});

	const pages = Math.ceil(total / limit);

	return {
		users: users.map(formatUserResponse),
		total,
		page,
		limit,
		pages,
	};
}

/**
 * Get user by ID
 *
 * @param userId - MongoDB ObjectId as string
 * @returns UserResponse
 * @throws NotFoundError if user doesn't exist
 */
export async function getUserById(userId: string): Promise<UserResponse> {
	const user = await container.userRepository.findByIdLean(userId);

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	return formatUserResponse(user);
}

/**
 * Get users by role — accepts any string value for role
 *
 * @param role - User role as string (gerente, tecnico, etc.)
 * @param isActive - Optional: filter by active status (default: true)
 * @returns Array of UserResponse
 */
export async function getUsersByRole(
	role: UserRole | undefined,
	isActive: boolean = true,
): Promise<UserResponse[]> {
	if (!role) {
		return [];
	}

	const users = await container.userRepository.find({ role, isActive }, { sort: { name: 1 } });

	return users.map((u) => formatUserResponse(u));
}

/**
 * Update user
 *
 * Rules:
 * - All fields in the shared update contract can be updated freely
 * - Role MUST be validated against USER_ROLES (per ISSUE-032)
 *
 * @param userId - MongoDB ObjectId as string
 * @param payload - UpdateUserPayload (partial fields)
 * @returns UserResponse
 * @throws NotFoundError if user doesn't exist
 * @throws ConflictError if email already taken by another user
 * @throws BadRequestError if role is invalid
 */
export async function updateUser(userId: string, payload: UpdateUserInput): Promise<UserResponse> {
	const user = await container.userRepository.findById(userId);

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	// If email is being changed, check uniqueness
	if (payload.email && payload.email !== user.email) {
		const emailExists = await container.userRepository.findByEmail(payload.email);

		if (emailExists && emailExists._id.toString() !== userId) {
			throw new ConflictError(`Email '${payload.email}' is already in use`);
		}

		user.email = payload.email;
	}

	// Update non-sensitive fields
	if (payload.name) {
		user.name = payload.name;
	}

	// FIX (ISSUE-032): Validate role instead of using `as` cast
	if (payload.role) {
		validateRole(payload.role);
		user.role = payload.role;
	}

	if (payload.phone !== undefined) {
		user.phone = payload.phone;
	}
	if (payload.avatarUrl !== undefined) {
		user.avatarUrl = payload.avatarUrl;
	}

	await container.userRepository.save(user);

	return formatUserResponse(user);
}

/**
 * Deactivate user (soft delete)
 *
 * Sets isActive to false. User remains in database but is hidden from listings.
 * This is the standard way to "delete" users in this system.
 *
 * @param userId - MongoDB ObjectId as string
 * @returns UserResponse
 * @throws NotFoundError if user doesn't exist
 */
export async function deactivateUser(userId: string): Promise<UserResponse> {
	const user = await container.userRepository.findById(userId);

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	user.isActive = false;
	await container.userRepository.save(user);

	return formatUserResponse(user);
}

/**
 * Check if user exists and is active
 * (Used internally for validations)
 */
export async function userExists(userId: string): Promise<boolean> {
	const user = await container.userRepository.findByIdLean(userId);
	return user?.isActive === true;
}
