import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { mockPartial } from "../test-utils";

const mocks = vi.hoisted(() => ({
	buildServiceCaseWorkflowView: vi.fn(),
}));

vi.mock("../../src/modules/service-cases/service-case.service", () => ({
	buildServiceCaseWorkflowView: mocks.buildServiceCaseWorkflowView,
	getServiceCaseById: vi.fn(),
	getServiceCases: vi.fn(),
	getServiceCaseSummary: vi.fn(),
}));

import { getServiceCaseWorkflow } from "../../src/modules/service-cases/service-case.controller";

function createResponseMock() {
	const response = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	return response as unknown as Response & {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
	};
}

describe("ServiceCaseController", () => {
	it("returns the canonical workflow view for the cockpit endpoint", async () => {
		const workflow = {
			serviceCaseId: "507f1f77bcf86cd799439011",
			orderId: "507f1f77bcf86cd799439012",
			code: "SC-2026-0001",
			clientName: "Cermont Cliente",
			globalStatus: "planning",
			updatedAt: "2026-05-23T10:00:00.000Z",
			currentStepCode: "step_05_planning",
			steps: [],
			activeStepRequirements: [],
			blockers: [],
			nextActions: [],
			artifacts: {},
			timeline: [],
			documents: [],
			evidences: [],
			costs: {
				estimated: {
					proposalValue: 0,
					estimatedLabor: 0,
					estimatedMaterials: 0,
					estimatedEquipment: 0,
					estimatedTaxes: 0,
					estimatedTotalCost: 0,
					estimatedMargin: 0,
				},
				actual: {
					actualLabor: 0,
					actualMaterials: 0,
					actualEquipment: 0,
					actualTaxes: 0,
					actualTotalCost: 0,
					actualMargin: 0,
				},
				billing: {
					sesValue: 0,
					invoiceValue: 0,
					paidValue: 0,
					pendingValue: 0,
				},
				variance: {
					costDifference: 0,
					marginDifference: 0,
					status: "ok",
				},
			},
			closure: {
				deliveryRecordSigned: false,
				sesSubmitted: false,
				sesApproved: false,
				invoiceSubmitted: false,
				invoiceApproved: false,
				paymentReconciled: false,
				caseClosed: false,
				daysOverdue: 0,
				closingPackageReady: false,
			},
			generatedAt: "2026-05-23T10:00:00.000Z",
		};

		mocks.buildServiceCaseWorkflowView.mockResolvedValue(workflow);

		const request = mockPartial<Request>({
			params: { id: "507f1f77bcf86cd799439011" } as Request["params"],
		});
		const response = createResponseMock();

		await getServiceCaseWorkflow(request, response);

		expect(mocks.buildServiceCaseWorkflowView).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({ success: true, data: workflow });
	});
});
