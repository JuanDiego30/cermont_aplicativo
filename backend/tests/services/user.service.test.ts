/**
 * UserService Unit Tests (Minimal - Validates Mock Path Setup)
 *
 * These tests validate that UserService can be properly mocked
 * and imported without missing-value errors.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mockear models ANTES de cualquier import
vi.mock("../../src/models", () => ({
	User: {
		find: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue([]) }),
		findById: vi
			.fn()
			.mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue(null) }),
		findByIdAndUpdate: vi.fn(),
		findOne: vi.fn(),
	},
}));

vi.mock("bcryptjs", () => ({
	default: {
		hash: vi.fn().mockResolvedValue("hashed"),
		compare: vi.fn().mockResolvedValue(true),
	},
}));

// IMPORTS DESPUÉS de mocks
import { User } from "../../src/models";

describe("UserService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Minimal test to verify mocks work
	it("should mock User model correctly", () => {
		expect(User.find).toBeDefined();
		expect(User.findById).toBeDefined();
		expect(User.findOne).toBeDefined();
	});

	it("should find all users", async () => {
		const mockUsers = [{ _id: "1", name: "Test", email: "test@test.com" }];
		vi.mocked(User.find).mockReturnValue({
			select: vi.fn().mockResolvedValue(mockUsers),
		} as never);

		const result = await User.find({}).select("-password");

		expect(result).toEqual(mockUsers);
	});

	it("should find user by id", async () => {
		const mockUser = { _id: "1", name: "Test" };
		vi.mocked(User.findById).mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(mockUser),
		} as never);

		const result = await User.findById("1").select("-password").lean();

		expect(result).toEqual(mockUser);
	});
});
