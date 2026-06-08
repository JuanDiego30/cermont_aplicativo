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
	planningPacketFindOne: vi.fn(),
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

vi.mock("../../src/models/PlanningPacket", () => ({
	PlanningPacket: { findOne: mocks.planningPacketFindOne },
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
			{
				signatureId: "sig-tech",
				role: "tecnico",
				signatureType: "technician",
				signedAt: "2026-05-25T11:05:00.000Z",
			},
			{
				signatureId: "sig-supervisor",
				role: "supervisor",
				signatureType: "supervisor",
				signedAt: "2026-05-25T11:10:00.000Z",
			},
		],
	};
}

function buildPlanningServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "planning",
		currentStepCode: "step_05_planning",
		artifacts: {
			workOrder: {
				id: new Types.ObjectId(WORK_ORDER_ID),
				status: "open",
				updatedAt: new Date("2026-05-25T10:00:00.000Z"),
			},
			planningPacket: {
				id: new Types.ObjectId("507f1f77bcf86cd799439034"),
				status: "approved",
				updatedAt: new Date("2026-05-25T11:00:00.000Z"),
			},
		},
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

	it("blocks MISSING_TECHNICAL_SIGNATURE when signatures array lacks a technician signature by signatureType", async () => {
		mocks.executionSessionFindOne.mockReturnValue(
			leanResult({
				...buildCompleteExecutionSession(),
				signatures: [
					{
						signatureId: "sig-supervisor",
						role: "supervisor",
						signatureType: "supervisor",
						signedAt: "2026-05-25T11:10:00.000Z",
					},
				],
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).toContain("MISSING_TECHNICAL_SIGNATURE");
		expect(blockerCodes).not.toContain("MISSING_SUPERVISOR_SIGNATURE");
	});

	it("blocks MISSING_SUPERVISOR_SIGNATURE when signatures array lacks a supervisor signature by signatureType", async () => {
		mocks.executionSessionFindOne.mockReturnValue(
			leanResult({
				...buildCompleteExecutionSession(),
				signatures: [
					{
						signatureId: "sig-tech",
						role: "tecnico",
						signatureType: "technician",
						signedAt: "2026-05-25T11:05:00.000Z",
					},
				],
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).not.toContain("MISSING_TECHNICAL_SIGNATURE");
		expect(blockerCodes).toContain("MISSING_SUPERVISOR_SIGNATURE");
	});

	it("blocks both MISSING_TECHNICAL_SIGNATURE and MISSING_SUPERVISOR_SIGNATURE when signatures are empty", async () => {
		mocks.executionSessionFindOne.mockReturnValue(
			leanResult({
				...buildCompleteExecutionSession(),
				signatures: [],
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).toContain("MISSING_TECHNICAL_SIGNATURE");
		expect(blockerCodes).toContain("MISSING_SUPERVISOR_SIGNATURE");
	});

	it("supports backward compatibility: role-only signatures (without signatureType) are recognized", async () => {
		mocks.executionSessionFindOne.mockReturnValue(
			leanResult({
				...buildCompleteExecutionSession(),
				signatures: [
					{ signatureId: "sig-tech", role: "tecnico", signedAt: "2026-05-25T11:05:00.000Z" },
					{
						signatureId: "sig-supervisor",
						role: "supervisor",
						signedAt: "2026-05-25T11:10:00.000Z",
					},
				],
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).not.toContain("MISSING_TECHNICAL_SIGNATURE");
		expect(blockerCodes).not.toContain("MISSING_SUPERVISOR_SIGNATURE");
	});
});

describe("Cermont workflow gate — planning step blockers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.serviceCaseFindById.mockResolvedValue(buildPlanningServiceCase());
		mocks.documentFind.mockReturnValue(leanResult([]));
	});

	it("blocks if planning packet is completely missing in artifacts and database", async () => {
		mocks.serviceCaseFindById.mockResolvedValue({
			...buildPlanningServiceCase(),
			artifacts: {
				workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) },
			},
		});
		mocks.planningPacketFindOne.mockReturnValue(leanResult(void 0));

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
		expect(blockers[0].field).toBe("planning_packet");
	});

	it("blocks if planning packet exists but is not approved", async () => {
		mocks.planningPacketFindOne.mockReturnValue(
			leanResult({
				_id: new Types.ObjectId("507f1f77bcf86cd799439034"),
				status: "draft",
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
		expect(blockers[0].message).toContain("La planeación existe pero aún no está aprobada");
	});

	it("blocks if approved planning packet has empty crew, empty tools, or incomplete checklists", async () => {
		mocks.planningPacketFindOne.mockReturnValue(
			leanResult({
				_id: new Types.ObjectId("507f1f77bcf86cd799439034"),
				status: "approved",
				crew: [],
				tools: [],
				readinessChecklist: [{ itemId: "item-1", label: "AST validado", checked: false }],
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		const blockerCodes = blockers.map((blocker) => blocker.code);

		expect(blockerCodes).toContain("MISSING_CREW_ASSIGNMENT");
		expect(blockerCodes).toContain("MISSING_TOOLS");
		expect(blockerCodes).toContain("TEMPLATE_RESPONSE_NOT_VALIDATED");
	});

	it("clears all blockers if planning packet is approved and has crew, tools, and fully checked checklists", async () => {
		mocks.planningPacketFindOne.mockReturnValue(
			leanResult({
				_id: new Types.ObjectId("507f1f77bcf86cd799439034"),
				status: "approved",
				crew: [{ userId: new Types.ObjectId(), name: "John Doe", role: "Tecnico" }],
				tools: [{ name: "Screwdriver", quantity: 2, available: true }],
				readinessChecklist: [{ itemId: "item-1", label: "AST validado", checked: true }],
			}),
		);

		const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
		expect(blockers).toHaveLength(0);
	});
});
