import "./setup";
import jwt from "jsonwebtoken";
import { User } from "@/auth/infrastructure/model";

/**
 * Creates a test user and returns it
 */
export async function createTestUser(
	overrides: Record<string, string | number | boolean | undefined> = {},
) {
	const userData = {
		name: "Test User",
		email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
		password: "Password123!",
		role: "gerente",
		isActive: true,
		...overrides,
	};
	return await User.create(userData);
}

/**
 * Generates an auth header for a user
 */
export function getAuthHeader(user: { _id: { toString(): string }; role: string; email: string }) {
	const id = user._id.toString();
	const payload = {
		_id: id,
		sub: id,
		role: user.role,
		email: user.email,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET || "test-secret", {
		expiresIn: "1h",
	});
	return `Bearer ${token}`;
}
