import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findById: vi.fn(),
}));

vi.mock("../../src/models/ServiceCase", () => ({
	ServiceCase: {
		findById: mocks.findById,
	},
}));

import {
	assertServiceCaseMutable,
	isLockedServiceCaseStage,
} from "../../src/services/case-closure-lock.service";

describe("case closure lock", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each(["paid", "archived", "cancelled"])("treats %s as locked", (stage) => {
		expect(isLockedServiceCaseStage(stage)).toBe(true);
	});

	it("allows active workflow stages", () => {
		expect(isLockedServiceCaseStage("in_execution")).toBe(false);
	});

	it("rejects retroactive mutation after payment closure", async () => {
		mocks.findById.mockReturnValue({
			select: vi.fn().mockReturnValue({
				lean: vi.fn().mockResolvedValue({ currentStage: "paid" }),
			}),
		});

		await expect(assertServiceCaseMutable("507f1f77bcf86cd799439011")).rejects.toMatchObject({
			code: "SERVICE_CASE_LOCKED",
			statusCode: 422,
		});
	});
});
