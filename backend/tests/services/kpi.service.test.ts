import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	countDocuments: vi.fn(),
	lean: vi.fn(),
}));

vi.mock("mongoose", () => ({
	default: {
		model: vi.fn(() => ({
			find: vi.fn(() => ({ lean: mocks.lean })),
			countDocuments: mocks.countDocuments,
		})),
		Types: { ObjectId: vi.fn((id) => id) },
	},
}));

describe("KPI Service", () => {
	it("should calculate MTTR correctly", async () => {
		mocks.lean.mockResolvedValue([
			{ elapsedMinutes: 120, status: "completed" },
			{ elapsedMinutes: 60, status: "completed" },
		]);

		const kpiService = await import("../../src/modules/kpi/kpi.service");
		const result = await kpiService.calculateMttr("7d");

		expect(result.totalRepairEvents).toBe(2);
		expect(result.mttrHours).toBe(1.5);
		expect(result.period).toBe("7d");
	});

	it("should return 0 MTTR when no events", async () => {
		mocks.lean.mockResolvedValue([]);

		const kpiService = await import("../../src/modules/kpi/kpi.service");
		const result = await kpiService.calculateMttr("30d");

		expect(result.totalRepairEvents).toBe(0);
		expect(result.mttrHours).toBe(0);
	});

	it("should calculate MTBF from corrective maintenance", async () => {
		mocks.countDocuments.mockResolvedValue(5);

		const kpiService = await import("../../src/modules/kpi/kpi.service");
		const result = await kpiService.calculateMtbf("30d");

		expect(result.totalFailures).toBe(5);
		expect(result.mtbfHours).toBeGreaterThan(0);
		expect(result.period).toBe("30d");
	});

	it("should calculate first-time fix rate", async () => {
		mocks.lean.mockResolvedValue([
			{ visitCount: 1 },
			{ visitCount: 1 },
			{ visitCount: 3 },
			{ visitCount: 1 },
		]);

		const kpiService = await import("../../src/modules/kpi/kpi.service");
		const result = await kpiService.calculateFirstTimeFixRate("90d");

		expect(result.totalJobs).toBe(4);
		expect(result.firstTimeFixes).toBe(3);
		expect(result.rate).toBe(75);
	});
});
