import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findById: vi.fn(),
	findTracking: vi.fn(),
	trackingExists: vi.fn(),
	createTracking: vi.fn(),
	findConfig: vi.fn(),
	createConfig: vi.fn(),
	findUsers: vi.fn(),
	createNotification: vi.fn(),
}));

vi.mock("../../src/modules/sla/sla.model", () => ({
	SLAConfigModel: {
		findOne: mocks.findConfig,
		create: mocks.createConfig,
	},
	SLATrackingModel: {
		findById: mocks.findById,
		find: mocks.findTracking,
		exists: mocks.trackingExists,
		create: mocks.createTracking,
	},
}));

vi.mock("../../src/models", () => ({
	User: {
		find: mocks.findUsers,
	},
}));

vi.mock("../../src/modules/notifications/notification.service", () => ({
	createNotification: mocks.createNotification,
}));

import { SLAService } from "../../src/modules/sla/sla.service";

describe("SLAService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns a typed not-found error when escalation target does not exist", async () => {
		mocks.findById.mockResolvedValue(null);

		await expect(
			SLAService.escalateTracking("507f1f77bcf86cd799439011", "Sin respuesta"),
		).rejects.toMatchObject({
			code: "SLA_TRACKING_NOT_FOUND",
			statusCode: 404,
		});
	});

	it("creates an idempotent tracking with canonical deadlines", async () => {
		mocks.trackingExists.mockResolvedValue(false);
		mocks.findConfig.mockResolvedValue({
			configs: [
				{
					serviceType: "*",
					priority: "high",
					responseHours: 4,
					escalationHours: 8,
					resolutionHours: 24,
					isActive: true,
				},
			],
		});
		mocks.createTracking.mockResolvedValue({});
		const assignedAt = new Date("2026-06-11T12:00:00.000Z");

		const result = await SLAService.createTrackingForServiceCase({
			serviceCaseId: "507f1f77bcf86cd799439011",
			serviceType: "Lineas de vida",
			priority: "high",
			assignedAt,
		});

		expect(result).toEqual({ status: "created" });
		expect(mocks.createTracking).toHaveBeenCalledWith(
			expect.objectContaining({
				responseDeadline: new Date("2026-06-11T16:00:00.000Z"),
				escalationDeadline: new Date("2026-06-11T20:00:00.000Z"),
				resolutionDeadline: new Date("2026-06-12T12:00:00.000Z"),
			}),
		);
	});
});
