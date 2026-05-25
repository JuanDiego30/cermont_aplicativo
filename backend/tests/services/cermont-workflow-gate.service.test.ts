import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const SERVICE_CASE_ID = "507f1f77bcf86cd799439031";
const WORK_ORDER_ID = "507f1f77bcf86cd799439032";
const EXECUTION_SESSION_ID = "507f1f77bcf86cd799439033";

const mocks = vi.hoisted(() => ({
	documentFind: vi.fn(),
	evidenceCountDocuments: vi.fn(),
	executionSessionFindOne: vi.fn(),
	serviceCaseFindById: vi.fn(),
}));

vi.mock("../../src/models/Document", () => ({
	Document: { find: mocks.documentFind },
}));

vi.mock("../../src/models/Evidence", () => ({
	Evidence: { countDocuments: mocks.evidenceCountDocuments },
}));

vi.mock("../../src/models/ExecutionSession", () => ({
	ExecutionSession: { findOne: mocks.executionSessionFindOne },
}));

vi.mock("../../src/models/ServiceCase", () => ({
	ServiceCase: { findById: mocks.serviceCaseFindById },
}));

vi.mock("../../src/services/audit.service", () => ({
	createAuditLog: vi.fn(),
}));

const workflowGateService = await import("../../src/services/cermont-workflow-gate.service");

function leanResult<T>(value: T) {
	return {
		lean: vi.fn().mockResolvedValue(value),
	};
}

function buildExecutionServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "in_execution",
		currentStepCode: "step_06_execution",
		artifacts: {
			workOrder: {
				id: new Types.ObjectId(WORK_ORDER_ID),
				status: "open",
				updatedAt: new Date("2026-05-25T10:00:00.000Z"),
			},
			executionSession: {
				id: new Types.ObjectId(EXECUTION_SESSION_ID),
				status: "completed",
				updatedAt: new Date("2026-05-25T11:00:00.000Z"),
			},
		},
	};
}

function buildCompleteExecutionSession() {
	return {
		_id: new Types.ObjectId(EXECUTION_SESSION_ID),
		workOrderId: new Types.ObjectId(WORK_ORDER_ID),
		serviceCaseId: new Types.ObjectId(SERVICE_CASE_ID),
		status: "completed",
		dynamicFormResponses: [{ responseId: "form-response-1" }],
		materialsUsed: [{ materialId: "mat-1", quantity: 2 }],
		laborEntries: [{ technicianId: "tech-1", hours: 4 }],
		incidents: [],
		signatures: [
			{ signatureId: "sig-tech", role: "tecnico", signedAt: "2026-05-25T11:05:00.000Z" },
			{ signatureId: "sig-supervisor", role: "supervisor", signedAt: "2026-05-25T11:10:00.000Z" },
		],
	};
}

describe("Cermont workflow gate — execution step blockers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.serviceCaseFindById.mockResolvedValue(buildExecutionServiceCase());
		mocks.executionSessionFindOne.mockReturnValue(leanResult(buildCompleteExecutionSession()));
		mocks.documentFind.mockReturnValue(
			leanResult([{ title: "AST aprobado" }, { title: "PTW permiso de trabajo" }]),
		);
		mocks.evidenceCountDocuments.mockResolvedValue(1);
	});

	it("does not block a completed execution session that has labor entries and role signatures", async () => {
		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).not.toContain("MISSING_LABOR_TIME");
		expect(blockerCodes).not.toContain("MISSING_TECHNICAL_SIGNATURE");
		expect(blockerCodes).not.toContain("MISSING_SUPERVISOR_SIGNATURE");
	});
});
