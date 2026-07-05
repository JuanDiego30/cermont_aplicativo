import { describe, expect, it } from "vitest";
import {
	computeFirstTimeFixRate,
	computeMTBF,
	computeMTTR,
	computeTechnicianUtilization,
	evaluateCostRisk,
	evaluateEvidenceCompleteness,
	evaluatePreflightGates,
	evaluateSLARisk,
} from "../spec-015-rules";

const allChecksPassed = {
	eppComplete: true,
	astSigned: true,
	ptwObtained: true,
	toolsValidated: true,
	vehicleDocumentsOk: true,
	certificationsCurrent: true,
};

describe("evaluatePreflightGates", () => {
	it("passes when all blocking gates are checked", () => {
		const result = evaluatePreflightGates(
			[{ key: "extra", label: "Extra", isBlocking: true, isChecked: true }],
			allChecksPassed,
		);
		expect(result.passed).toBe(true);
		expect(result.missingBlockingKeys).toHaveLength(0);
	});

	it("fails when a fixed boolean check is missing", () => {
		const result = evaluatePreflightGates([], { ...allChecksPassed, astSigned: false });
		expect(result.passed).toBe(false);
		expect(result.missingBlockingKeys).toContain("astSigned");
	});

	it("fails on unchecked blocking item but not on optional", () => {
		const result = evaluatePreflightGates(
			[
				{ key: "gas-meter", label: "Gas meter", isBlocking: true, isChecked: false },
				{ key: "sunscreen", label: "Sunscreen", isBlocking: false, isChecked: false },
			],
			allChecksPassed,
		);
		expect(result.passed).toBe(false);
		expect(result.missingBlockingKeys).toEqual(["gas-meter"]);
		expect(result.missingOptionalKeys).toEqual(["sunscreen"]);
	});
});

describe("evaluateSLARisk", () => {
	it("returns on_track when far from deadline", () => {
		expect(evaluateSLARisk("2026-07-10T00:00:00.000Z", "2026-07-05T00:00:00.000Z")).toBe(
			"on_track",
		);
	});

	it("returns at_risk under 24h remaining", () => {
		expect(evaluateSLARisk("2026-07-05T20:00:00.000Z", "2026-07-05T00:00:00.000Z")).toBe("at_risk");
	});

	it("returns overdue past deadline", () => {
		expect(evaluateSLARisk("2026-07-04T00:00:00.000Z", "2026-07-05T00:00:00.000Z")).toBe("overdue");
	});
});

describe("evaluateCostRisk", () => {
	it("classifies each band", () => {
		expect(evaluateCostRisk(50)).toBe("under_budget");
		expect(evaluateCostRisk(85)).toBe("on_budget");
		expect(evaluateCostRisk(97)).toBe("at_risk");
		expect(evaluateCostRisk(120)).toBe("critical");
	});

	it("treats exactly 100 as at_risk and boundary 80/95 inclusively", () => {
		expect(evaluateCostRisk(100)).toBe("at_risk");
		expect(evaluateCostRisk(80)).toBe("on_budget");
		expect(evaluateCostRisk(95)).toBe("at_risk");
	});
});

describe("evaluateEvidenceCompleteness", () => {
	it("blocks closure while a blocking slot is unfulfilled", () => {
		const result = evaluateEvidenceCompleteness([
			{ slotId: "before-1", isRequired: true, isBlocking: true, isFulfilled: false },
			{ slotId: "after-1", isRequired: true, isBlocking: false, isFulfilled: true },
		]);
		expect(result.canClosePhase).toBe(false);
		expect(result.blockingPendingCount).toBe(1);
		expect(result.pendingBlockingSlotIds).toEqual(["before-1"]);
	});

	it("allows closure with pending non-blocking slots", () => {
		const result = evaluateEvidenceCompleteness([
			{ slotId: "before-1", isRequired: true, isBlocking: true, isFulfilled: true },
			{ slotId: "optional-1", isRequired: true, isBlocking: false, isFulfilled: false },
		]);
		expect(result.canClosePhase).toBe(true);
		expect(result.pendingCount).toBe(1);
	});
});

describe("computeMTTR", () => {
	it("averages session durations in minutes", () => {
		const mttr = computeMTTR([
			{ startedAt: "2026-07-01T10:00:00.000Z", completedAt: "2026-07-01T11:00:00.000Z" },
			{ startedAt: "2026-07-02T10:00:00.000Z", completedAt: "2026-07-02T12:00:00.000Z" },
		]);
		expect(mttr).toBe(90);
	});

	it("ignores invalid windows and returns 0 with no data", () => {
		expect(computeMTTR([])).toBe(0);
		expect(
			computeMTTR([
				{ startedAt: "2026-07-02T10:00:00.000Z", completedAt: "2026-07-01T10:00:00.000Z" },
			]),
		).toBe(0);
	});
});

describe("computeMTBF", () => {
	it("averages gaps between consecutive completions in days", () => {
		const mtbf = computeMTBF([
			{ completedAt: "2026-07-01T00:00:00.000Z" },
			{ completedAt: "2026-07-03T00:00:00.000Z" },
			{ completedAt: "2026-07-07T00:00:00.000Z" },
		]);
		expect(mtbf).toBe(3);
	});

	it("returns 0 with fewer than two orders", () => {
		expect(computeMTBF([{ completedAt: "2026-07-01T00:00:00.000Z" }])).toBe(0);
	});
});

describe("computeFirstTimeFixRate", () => {
	it("computes the percentage of orders without return visit", () => {
		const rate = computeFirstTimeFixRate([
			{ orderId: "a", hadReturnVisit: false },
			{ orderId: "b", hadReturnVisit: true },
			{ orderId: "c", hadReturnVisit: false },
			{ orderId: "d", hadReturnVisit: false },
		]);
		expect(rate).toBe(75);
	});

	it("returns 0 for an empty list", () => {
		expect(computeFirstTimeFixRate([])).toBe(0);
	});
});

describe("computeTechnicianUtilization", () => {
	it("computes productive time as a percentage of available time", () => {
		expect(
			computeTechnicianUtilization([
				{ productiveMinutes: 360, availableMinutes: 480 },
				{ productiveMinutes: 240, availableMinutes: 480 },
			]),
		).toBe(62.5);
	});

	it("ignores invalid availability and caps utilization at 100 percent", () => {
		expect(computeTechnicianUtilization([])).toBe(0);
		expect(
			computeTechnicianUtilization([
				{ productiveMinutes: 90, availableMinutes: 60 },
				{ productiveMinutes: 30, availableMinutes: 0 },
			]),
		).toBe(100);
	});
});
