import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findOneAndUpdate: vi.fn(),
	save: vi.fn(),
	createAuditLog: vi.fn(),
}));

vi.mock("../../src/modules/system-config/system-config.model", () => ({
	SystemConfig: {
		findOneAndUpdate: mocks.findOneAndUpdate,
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.createAuditLog,
}));

import { SystemConfigService } from "../../src/modules/system-config/system-config.service";

describe("SystemConfigService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("stores updatedBy as a Mongo ObjectId", async () => {
		const config = {
			_id: new Types.ObjectId(),
			featureFlags: [],
			maintenanceMode: false,
			maintenanceMessage: "",
			maxUploadSizeMb: 10,
			sessionTimeoutMinutes: 480,
			defaultLanguage: "es",
			allowedFileTypes: ["pdf"],
			reminderWorkerEnabled: true,
			reminderWorkerIntervalMinutes: 5,
			reminderRules: [],
			save: mocks.save,
		};
		mocks.findOneAndUpdate.mockResolvedValue(config);
		const userId = "507f1f77bcf86cd799439011";

		await SystemConfigService.updateSettings({ maxUploadSizeMb: 20 }, userId);

		expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
			{ singletonKey: "system" },
			expect.objectContaining({ $setOnInsert: expect.any(Object) }),
			expect.objectContaining({ upsert: true, returnDocument: "after" }),
		);
		expect(config.updatedBy).toBeInstanceOf(Types.ObjectId);
		expect(String(config.updatedBy)).toBe(userId);
		expect(mocks.save).toHaveBeenCalledTimes(2);
		expect(mocks.createAuditLog).toHaveBeenCalledOnce();
	});
});
