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
 */

import type { CreateUserInput, UpdateUserInput, UserRole } from "@cermont/shared-types";
import { BadRequestError, ConflictError, NotFoundError } from "../../common/errors/AppError";
import { USER_ROLES, User } from "../../models";
import type { IUserDocument } from "../../models/User";

export interface UserContract {
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
	if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
		throw new BadRequestError(
			`Invalid role '${role}'. Allowed roles: ${Array.from(USER_ROLES).join(", ")}`,
		);
	}
}

/**
 * Format user document for API response (exclude sensitive fields)
 */
function formatUserResponse(doc: IUserDocument): UserContract {
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
 * @returns UserContract
 * @throws ConflictError if email already exists
 * @throws BadRequestError if validation fails
 *
 * Password hashing is automatic via User model's pre('save') hook.
 */
export async function createUser(payload: CreateUserInput): Promise<UserContract> {
	// Validate role per ISSUE-032
	validateRole(payload.role);

	// Check if email already exists
	const existingUser = await User.findOne({ email: payload.email }).lean();
	if (existingUser) {
		throw new ConflictError(`User with email '${payload.email}' already exists`);
	}

	// Create new user document
	// Password will be hashed automatically by Mongoose pre-save hook
	const user = new User({
		name: payload.name,
		email: payload.email,
		password: payload.password,
		role: payload.role,
		phone: payload.phone,
		isActive: true,
	});

	await user.save();

	return formatUserResponse(user);
}

/**
 * Get all users (paginated)
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param filters - Optional: { role?, isActive? }
 * @returns { users: UserContract[], total, page, limit, pages }
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
	const total = await User.countDocuments(query);
	const users = await User.find(query)
		.skip(skip)
		.limit(limit)
		.select("-password")
		.sort({ createdAt: -1 })
		.lean();

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
 * @returns UserContract
 * @throws NotFoundError if user doesn't exist
 */
export async function getUserById(userId: string): Promise<UserContract> {
	const user = await User.findById(userId).select("-password").lean();

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	return formatUserResponse(user as unknown as IUserDocument);
}

/**
 * Get users by role — accepts any string value for role
 *
 * @param role - User role as string (gerente, tecnico, etc.)
 * @param isActive - Optional: filter by active status (default: true)
 * @returns Array of UserContract
 */
export async function getUsersByRole(
	role: UserRole | undefined,
	isActive: boolean = true,
): Promise<UserContract[]> {
	if (!role) {
		return [];
	}

	const users = await User.find({ role, isActive }).select("-password").sort({ name: 1 }).lean();

	return users.map(formatUserResponse);
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
 * @returns UserContract
 * @throws NotFoundError if user doesn't exist
 * @throws ConflictError if email already taken by another user
 * @throws BadRequestError if role is invalid
 */
export async function updateUser(userId: string, payload: UpdateUserInput): Promise<UserContract> {
	const user = await User.findById(userId);

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	// If email is being changed, check uniqueness
	if (payload.email && payload.email !== user.email) {
		const emailExists = await User.findOne({
			email: payload.email,
			_id: { $ne: userId },
		}).lean();

		if (emailExists) {
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
		user.role = payload.role as typeof user.role;
	}

	if (payload.phone !== undefined) {
		user.phone = payload.phone;
	}
	if (payload.avatarUrl !== undefined) {
		user.avatarUrl = payload.avatarUrl;
	}

	await user.save();

	return formatUserResponse(user);
}

/**
 * Deactivate user (soft delete)
 *
 * Sets isActive to false. User remains in database but is hidden from listings.
 * This is the standard way to "delete" users in this system.
 *
 * @param userId - MongoDB ObjectId as string
 * @returns UserContract
 * @throws NotFoundError if user doesn't exist
 */
export async function deactivateUser(userId: string): Promise<UserContract> {
	const user = await User.findById(userId);

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	user.isActive = false;
	await user.save();

	return formatUserResponse(user);
}

/**
 * Check if user exists and is active
 * (Used internally for validations)
 */
export async function userExists(userId: string): Promise<boolean> {
	const user = await User.findById(userId).lean();
	return user?.isActive === true;
}
