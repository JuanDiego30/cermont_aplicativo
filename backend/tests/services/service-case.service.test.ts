import { describe, expect, it } from "vitest";
import { computeNextActions, computeStage } from "../../src/modules/service-cases/service-case.service";

describe("ServiceCase — Stage Computation", () => {
	it("returns 'intake' when no artifacts exist", () => {
		expect(computeStage({})).toBe("intake");
	});

	it("returns 'assessment' when work request exists", () => {
		expect(
			computeStage({
				workRequest: {
					id: "507f1f77bcf86cd799439011" as never,
					status: "open",
					updatedAt: new Date(),
				},
			}),
		).toBe("assessment");
	});

	it("returns 'in_execution' when planning is approved", () => {
		expect(
			computeStage({
				workRequest: {
					id: "507f1f77bcf86cd799439011" as never,
					status: "open",
					updatedAt: new Date(),
				},
				siteVisit: {
					id: "507f1f77bcf86cd799439012" as never,
					status: "completed",
					updatedAt: new Date(),
				},
				proposal: {
					id: "507f1f77bcf86cd799439013" as never,
					status: "approved",
					updatedAt: new Date(),
				},
				purchaseOrder: {
					id: "507f1f77bcf86cd799439014" as never,
					status: "approved",
					updatedAt: new Date(),
				},
				workOrder: {
					id: "507f1f77bcf86cd799439015" as never,
					status: "open",
					updatedAt: new Date(),
				},
				planningPacket: {
					id: "507f1f77bcf86cd799439016" as never,
					status: "approved",
					updatedAt: new Date(),
				},
			}),
		).toBe("in_execution");
	});

	it("returns 'paid' when payment is completed", () => {
		expect(
			computeStage({
				workRequest: {
					id: "507f1f77bcf86cd799439011" as never,
					status: "open",
					updatedAt: new Date(),
				},
				workOrder: {
					id: "507f1f77bcf86cd799439015" as never,
					status: "open",
					updatedAt: new Date(),
				},
				planningPacket: {
					id: "507f1f77bcf86cd799439016" as never,
					status: "approved",
					updatedAt: new Date(),
				},
				executionSession: {
					id: "507f1f77bcf86cd799439017" as never,
					status: "finished",
					updatedAt: new Date(),
				},
				technicalReport: {
					id: "507f1f77bcf86cd799439018" as never,
					status: "approved",
					updatedAt: new Date(),
				},
				deliveryRecord: {
					id: "507f1f77bcf86cd799439019" as never,
					status: "signed",
					updatedAt: new Date(),
				},
				serviceEntrySheet: {
					id: "507f1f77bcf86cd799439020" as never,
					status: "approved",
					updatedAt: new Date(),
				},
				invoice: {
					id: "507f1f77bcf86cd799439021" as never,
					status: "approved",
					updatedAt: new Date(),
				},
				payment: {
					id: "507f1f77bcf86cd799439022" as never,
					status: "completed",
					updatedAt: new Date(),
				},
			}),
		).toBe("paid");
	});

	it("returns 'cancelled' when work request is cancelled", () => {
		expect(
			computeStage({
				workRequest: {
					id: "507f1f77bcf86cd799439011" as never,
					status: "cancelled",
					updatedAt: new Date(),
				},
			}),
		).toBe("cancelled");
	});
});

describe("ServiceCase — NextActions", () => {
	it("returns appropriate actions for 'intake' stage", () => {
		const actions = computeNextActions("intake");
		expect(actions).toHaveLength(1);
		expect(actions[0].command).toBe("schedule_visit");
	});

	it("returns empty array for 'paid' stage", () => {
		expect(computeNextActions("paid")).toEqual([]);
	});

	it("returns actions for 'in_execution' stage", () => {
		const actions = computeNextActions("in_execution");
		expect(actions.length).toBeGreaterThanOrEqual(1);
		expect(actions.some((a) => a.command === "upload_evidence")).toBe(true);
	});

	it("returns empty for unknown stage", () => {
		expect(computeNextActions("nonexistent_stage" as never)).toEqual([]);
	});
});
