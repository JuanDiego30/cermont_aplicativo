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
	deliveryRecordFindOne: vi.fn(),
	serviceEntrySheetFindOne: vi.fn(),
	invoiceFindOne: vi.fn(),
	paymentFindOne: vi.fn(),
	createAuditLog: vi.fn(),
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

vi.mock("../../src/models/DeliveryRecord", () => ({
	DeliveryRecord: { findOne: mocks.deliveryRecordFindOne },
}));

vi.mock("../../src/models/ServiceEntrySheet", () => ({
	ServiceEntrySheet: { findOne: mocks.serviceEntrySheetFindOne },
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: { findOne: mocks.invoiceFindOne },
}));

vi.mock("../../src/models/Payment", () => ({
	Payment: { findOne: mocks.paymentFindOne },
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.createAuditLog,
}));

const workflowGateService = await import("../../src/services/cermont-workflow-gate.service");

function leanResult<T>(value: T) {
	return {
		lean: vi.fn().mockResolvedValue(value),
	};
}

// ─── Service case builders ────────────────────────────────────────────────────

function buildWorkRequestServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "intake",
		currentStepCode: "step_01_work_request",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			workRequest: { id: new Types.ObjectId(), status: "completed" },
		},
	};
}

function buildSiteVisitServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "assessment",
		currentStepCode: "step_02_site_visit",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			siteVisit: { id: new Types.ObjectId(), status: "completed" },
		},
	};
}

function buildProposalServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "proposal",
		currentStepCode: "step_03_proposal",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			proposal: { id: new Types.ObjectId(), status: "approved" },
		},
	};
}

function buildPurchaseOrderServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "authorization",
		currentStepCode: "step_04_purchase_order",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			purchaseOrder: { id: new Types.ObjectId(), status: "approved" },
		},
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

function buildTechnicalReportServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "technical_closure",
		currentStepCode: "step_07_technical_report",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			technicalReport: { id: new Types.ObjectId(), status: "approved" },
		},
	};
}

function buildDeliveryRecordServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "administrative_closure",
		currentStepCode: "step_08_delivery_record",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			deliveryRecord: { id: new Types.ObjectId() },
		},
	};
}

function buildClientSignatureServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "administrative_closure",
		currentStepCode: "step_09_client_signature",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
		},
	};
}

function buildSesSubmissionServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "ses_pending",
		currentStepCode: "step_10_ses_submission",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			serviceEntrySheet: { id: new Types.ObjectId(), status: "submitted" },
		},
	};
}

function buildSesApprovalServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "billing_pending",
		currentStepCode: "step_11_ses_approval",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			serviceEntrySheet: { id: new Types.ObjectId(), status: "approved" },
		},
	};
}

function buildInvoiceSubmissionServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "receivable_open",
		currentStepCode: "step_12_invoice_submission",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			invoice: { id: new Types.ObjectId(), status: "sent" },
		},
	};
}

function buildInvoiceApprovalServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "receivable_open",
		currentStepCode: "step_13_invoice_approval",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			invoice: { id: new Types.ObjectId(), status: "approved" },
		},
	};
}

function buildPaymentClosureServiceCase() {
	return {
		_id: new Types.ObjectId(SERVICE_CASE_ID),
		currentStage: "paid",
		currentStepCode: "step_14_payment_closure",
		artifacts: {
			workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
			payment: { id: new Types.ObjectId(), status: "reconciled" },
		},
	};
}

// ─── Tests: steps 1-4 ────────────────────────────────────────────────────────

describe("workflow gate — steps 1-4 (intake through authorization)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.documentFind.mockReturnValue(leanResult([]));
		mocks.evidenceCountDocuments.mockResolvedValue(1);
	});

	describe("step_01_work_request", () => {
		it("clears all blockers when work request is completed", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildWorkRequestServiceCase());
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("clears blockers for status 'assigned' and 'in_progress'", async () => {
			for (const status of ["assigned", "in_progress"]) {
				mocks.serviceCaseFindById.mockResolvedValue({
					...buildWorkRequestServiceCase(),
					artifacts: {
						workOrder: { id: new Types.ObjectId(WORK_ORDER_ID), status: "open" },
						workRequest: { id: new Types.ObjectId(), status },
					},
				});
				const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
				expect(blockers).toHaveLength(0);
			}
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when work request is missing", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildWorkRequestServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(1);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].field).toBe("work_request");
		});

		it("blocks when work request exists but has invalid status (e.g. 'pending')", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildWorkRequestServiceCase(),
				artifacts: {
					workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) },
					workRequest: { id: new Types.ObjectId(), status: "pending" },
				},
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].message).toContain("existe pero aún no está validada");
		});
	});

	describe("step_02_site_visit", () => {
		it("clears all blockers when site visit is completed and has before-photos", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildSiteVisitServiceCase());
			mocks.evidenceCountDocuments.mockResolvedValue(2);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when site visit is missing", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildSiteVisitServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.evidenceCountDocuments.mockResolvedValue(1);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
		});

		it("blocks MISSING_STEP_REQUIRED_EVIDENCE when before-photos are absent", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildSiteVisitServiceCase());
			mocks.evidenceCountDocuments.mockResolvedValue(0);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_EVIDENCE");
		});

		it("blocks both document and evidence when site visit is missing AND no before-photos", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildSiteVisitServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.evidenceCountDocuments.mockResolvedValue(0);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(codes).toContain("MISSING_STEP_REQUIRED_EVIDENCE");
		});
	});

	describe("step_03_proposal", () => {
		it("clears all blockers when proposal is approved", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildProposalServiceCase());
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks when proposal is missing", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildProposalServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].field).toBe("proposal_document");
		});

		it("blocks when proposal exists but is not approved (e.g. 'draft')", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildProposalServiceCase(),
				artifacts: {
					workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) },
					proposal: { id: new Types.ObjectId(), status: "draft" },
				},
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].message).toContain("existe pero aún no está aprobada");
		});
	});

	describe("step_04_purchase_order", () => {
		it("clears all blockers when purchase order is approved", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildPurchaseOrderServiceCase());
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks when purchase order is missing", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildPurchaseOrderServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].field).toBe("purchase_order");
		});

		it("blocks when purchase order exists but is not approved", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildPurchaseOrderServiceCase(),
				artifacts: {
					workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) },
					purchaseOrder: { id: new Types.ObjectId(), status: "pending" },
				},
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].ownerRole).toBe("gerente");
		});
	});
});

// ─── Tests: steps 5-6 (existing) ─────────────────────────────────────────────

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

// ─── Tests: steps 7-14 ───────────────────────────────────────────────────────

describe("workflow gate — steps 7-14 (technical closure through payment)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.documentFind.mockReturnValue(leanResult([{ title: "Documento de soporte" }]));
		mocks.evidenceCountDocuments.mockResolvedValue(1);
		mocks.deliveryRecordFindOne.mockResolvedValue(null);
		mocks.serviceEntrySheetFindOne.mockReturnValue(leanResult(null));
		mocks.invoiceFindOne.mockReturnValue(leanResult(null));
		mocks.paymentFindOne.mockReturnValue(leanResult(null));
	});

	describe("step_07_technical_report", () => {
		it("clears all blockers when technical report is approved and after-photos exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildTechnicalReportServiceCase());
			mocks.evidenceCountDocuments.mockResolvedValue(3);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when technical report is missing", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildTechnicalReportServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.evidenceCountDocuments.mockResolvedValue(1);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers.find((b) => b.field === "technical_report")).toBeDefined();
		});

		it("blocks MISSING_STEP_REQUIRED_EVIDENCE when after-photos are absent", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildTechnicalReportServiceCase());
			mocks.evidenceCountDocuments.mockResolvedValue(0);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_EVIDENCE");
			expect(blockers.find((b) => b.field === "after_photos")).toBeDefined();
		});

		it("blocks both document and evidence when report is missing AND no after-photos", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildTechnicalReportServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.evidenceCountDocuments.mockResolvedValue(0);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(2);
		});
	});

	describe("step_08_delivery_record", () => {
		it("clears all blockers when delivery record artifact exists", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildDeliveryRecordServiceCase());
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("clears all blockers when step documents contain the delivery record", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildDeliveryRecordServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.documentFind.mockReturnValue(leanResult([{ title: "Acta de entrega" }]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when neither artifact nor step documents exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildDeliveryRecordServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].field).toBe("delivery_record");
		});
	});

	describe("step_09_client_signature", () => {
		it("clears all blockers when a signed delivery record exists in DB", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildClientSignatureServiceCase());
			mocks.deliveryRecordFindOne.mockResolvedValue({
				_id: new Types.ObjectId(),
				status: "signed",
			});
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("clears all blockers when signature documents exist for step 09", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildClientSignatureServiceCase());
			mocks.deliveryRecordFindOne.mockResolvedValue(null);
			mocks.documentFind.mockReturnValue(leanResult([{ title: "Acta firmada cliente" }]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when no signed record and no documents", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildClientSignatureServiceCase());
			mocks.deliveryRecordFindOne.mockResolvedValue(null);
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers[0].code).toBe("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers[0].field).toBe("signed_delivery_record");
		});
	});

	describe("step_10_ses_submission", () => {
		it("clears all blockers when SES is submitted and step documents exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildSesSubmissionServiceCase());
			mocks.serviceEntrySheetFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks SES_NOT_CREATED when SES is not submitted", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildSesSubmissionServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.serviceEntrySheetFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("SES_NOT_CREATED");
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when SES has no supporting documents", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildSesSubmissionServiceCase());
			mocks.serviceEntrySheetFindOne.mockReturnValue(leanResult(null));
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers.find((b) => b.field === "ses_receipt")).toBeDefined();
		});

		it("ownerRole for SES blockers is 'administrativo' (not 'cliente')", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildSesSubmissionServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.serviceEntrySheetFindOne.mockReturnValue(leanResult(null));
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			for (const blocker of blockers) {
				expect(blocker.ownerRole).toBe("administrativo");
				expect(blocker.ownerRole).not.toBe("cliente");
			}
		});
	});

	describe("step_11_ses_approval", () => {
		it("clears all blockers when SES is approved via artifact and step documents exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildSesApprovalServiceCase());
			mocks.serviceEntrySheetFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks SES_NOT_APPROVED when SES record is not approved", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildSesApprovalServiceCase(),
				artifacts: {
					workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) },
					serviceEntrySheet: { id: new Types.ObjectId(), status: "submitted" },
				},
			});
			mocks.serviceEntrySheetFindOne.mockReturnValue(
				leanResult({ status: "submitted", _id: new Types.ObjectId() }),
			);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("SES_NOT_APPROVED");
		});
	});

	describe("step_12_invoice_submission", () => {
		it("clears all blockers when invoice is sent via artifact and step documents exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildInvoiceSubmissionServiceCase());
			mocks.invoiceFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks INVOICE_NOT_CREATED when no invoice artifact and no DB record", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildInvoiceSubmissionServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.invoiceFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("INVOICE_NOT_CREATED");
		});

		it("ownerRole for invoice blockers is 'administrativo'", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildInvoiceSubmissionServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.invoiceFindOne.mockReturnValue(leanResult(null));
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			for (const blocker of blockers) {
				expect(blocker.ownerRole).toBe("administrativo");
			}
		});
	});

	describe("step_13_invoice_approval", () => {
		it("clears all blockers when invoice is approved via artifact and step documents exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildInvoiceApprovalServiceCase());
			mocks.invoiceFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks INVOICE_NOT_APPROVED when invoice status is only 'sent'", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildInvoiceApprovalServiceCase(),
				artifacts: {
					workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) },
					invoice: { id: new Types.ObjectId(), status: "sent" },
				},
			});
			mocks.invoiceFindOne.mockReturnValue(
				leanResult({ status: "sent", _id: new Types.ObjectId() }),
			);
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("INVOICE_NOT_APPROVED");
		});
	});

	describe("step_14_payment_closure", () => {
		it("clears all blockers when payment is reconciled via artifact and step documents exist", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildPaymentClosureServiceCase());
			mocks.paymentFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers).toHaveLength(0);
		});

		it("blocks PAYMENT_NOT_RECONCILED when payment is not reconciled", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildPaymentClosureServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.paymentFindOne.mockReturnValue(leanResult(null));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("PAYMENT_NOT_RECONCILED");
		});

		it("blocks MISSING_STEP_REQUIRED_DOCUMENT when payment voucher is missing", async () => {
			mocks.serviceCaseFindById.mockResolvedValue(buildPaymentClosureServiceCase());
			mocks.paymentFindOne.mockReturnValue(leanResult(null));
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			const codes = blockers.map((b) => b.code);
			expect(codes).toContain("MISSING_STEP_REQUIRED_DOCUMENT");
			expect(blockers.find((b) => b.field === "payment_voucher")).toBeDefined();
		});

		it("generates at most 2 blockers (PAYMENT_NOT_RECONCILED + payment_voucher document)", async () => {
			mocks.serviceCaseFindById.mockResolvedValue({
				...buildPaymentClosureServiceCase(),
				artifacts: { workOrder: { id: new Types.ObjectId(WORK_ORDER_ID) } },
			});
			mocks.paymentFindOne.mockReturnValue(leanResult(null));
			mocks.documentFind.mockReturnValue(leanResult([]));
			const blockers = await workflowGateService.calculateStepBlockers(SERVICE_CASE_ID);
			expect(blockers.length).toBeLessThanOrEqual(2);
		});
	});
});
