import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as UserController from "../../src/auth/api/user.controller";
import * as UserService from "../../src/auth/application/user.service";

vi.mock("../../src/auth/application/user.service", () => ({
	listUsers: vi.fn(),
}));

function createResponse() {
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	} as unknown as Response & {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
	};
}

describe("user controller", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists users with query values already parsed by validation middleware", async () => {
		vi.mocked(UserService.listUsers).mockResolvedValue({
			users: [],
			total: 0,
			page: 1,
			limit: 50,
			pages: 0,
		});
		const req = {
			query: {
				page: 1,
				limit: 50,
			},
		} as unknown as Request;
		const res = createResponse();

		await UserController.listUsers(req, res);

		expect(UserService.listUsers).toHaveBeenCalledWith(1, 50, {});
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: [],
			meta: {
				total: 0,
				page: 1,
				limit: 50,
				pages: 0,
			},
		});
	});
});
