/**
 * ServiceCaseStepContext Service — Unit tests
 *
 * Validates that `buildServiceCaseStepContext` returns correctly shaped data:
 * - canonical case data from ServiceCase document
 * - inherited fields for each step
 * - blockers forwarded from cermont-workflow-gate
 * - allowed actions from step definition
 * - linked entity IDs from artifacts map
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const CASE_ID = "507f1f77bcf86cd799439011";
const WR_ID = "507f1f77bcf86cd799439012";
const SV_ID = "507f1f77bcf86cd799439013";
const PR_ID = "507f1f77bcf86cd799439014";
const PO_ID = "507f1f77bcf86cd799439015";
const NIL = Object.getPrototypeOf(Object.prototype);

const mocks = vi.hoisted(() => ({
	serviceCaseFindById: vi.fn(),
	workRequestFindById: vi.fn(),
	calculateStepBlockers: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	ServiceCase: { findById: mocks.serviceCaseFindById },
	WorkRequest: { findById: mocks.workRequestFindById },
}));

vi.mock("../../src/services/cermont-workflow-gate.service", () => ({
	calculateStepBlockers: mocks.calculateStepBlockers,
}));

// Base service case with all artifacts pre-populated for testing deep steps
function buildBaseServiceCase(
	overrides: Record<string, string | number | boolean | object | Date | undefined> = {},
) {
	return {
		_id: new Types.ObjectId(CASE_ID),
		clientId: new Types.ObjectId("507f1f77bcf86cd799439099"),
		clientName: "SierraCol Energy",
		contactName: "Juan Prueba",
		contactPhone: "+57 300 000 0001",
		contactEmail: "jprueba@sierracol.com",
		siteId: "site-caño-limon",
		siteName: "Caño Limón",
		location: "Bloque 25, Arauca",
		businessUnit: "Oil & Gas",
		workTypeId: "wt-cctv-001",
		workTypeName: "Mantenimiento CCTV",
		priority: "high",
		requestedDate: new Date("2026-05-01T08:00:00.000Z"),
		generalScope: "Mantenimiento preventivo sistema CCTV Bloque 25",
		currentStepCode: "step_01_work_request",
		currentStage: "intake",
		artifacts: {
			workRequest: { id: new Types.ObjectId(WR_ID), code: "WR-2026-001", status: "completed" },
			siteVisit: { id: new Types.ObjectId(SV_ID), code: "SV-2026-001", status: "completed" },
			proposal: { id: new Types.ObjectId(PR_ID), code: "PR-2026-001", status: "approved" },
			purchaseOrder: { id: new Types.ObjectId(PO_ID), code: "PO-2026-001", status: "active" },
		},
		...overrides,
	};
}

import { buildServiceCaseStepContext } from "../../src/services/service-case-step-context.service";

describe("buildServiceCaseStepContext", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.calculateStepBlockers.mockResolvedValue([]);
		mocks.workRequestFindById.mockReturnValue({
			lean: () => Promise.resolve(undefined),
		});
	});

	it("throws NotFoundError when service case does not exist", async () => {
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(NIL),
		});

		await expect(buildServiceCaseStepContext(CASE_ID, "step_01_work_request")).rejects.toThrow(
			/not found/i,
		);
	});

	it("returns valid ServiceCaseStepContext for step_01 (no inherited fields expected)", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_01_work_request");

		expect(ctx.serviceCaseId).toBe(CASE_ID);
		expect(ctx.currentStepCode).toBe("step_01_work_request");

		// Canonical data must be populated
		expect(ctx.canonical.clientName).toBe("SierraCol Energy");
		expect(ctx.canonical.location).toBe("Bloque 25, Arauca");
		expect(ctx.canonical.businessUnit).toBe("Oil & Gas");
		expect(ctx.canonical.priority).toBe("high");

		// Step_01 has no previous step — no inherited fields
		expect(ctx.inheritedFields).toHaveLength(0);
		expect(ctx.blockers).toHaveLength(0);
	});

	it("returns inherited clientId, clientName, location for step_02 (site visit)", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_02_site_visit");

		const clientId = ctx.inheritedFields.find((f) => f.key === "clientId");
		const clientName = ctx.inheritedFields.find((f) => f.key === "clientName");
		const location = ctx.inheritedFields.find((f) => f.key === "location");

		expect(clientId).toBeDefined();
		expect(clientId?.sourceStepCode).toBe("step_01_work_request");
		expect(clientId?.required).toBe(true);
		expect(clientId?.editable).toBe(false);

		expect(clientName).toBeDefined();
		expect(clientName?.value).toBe("SierraCol Energy");
		expect(clientName?.editable).toBe(true);

		expect(location).toBeDefined();
		expect(location?.value).toBe("Bloque 25, Arauca");
		expect(location?.sourceStepLabel).toBe("Solicitud de servicio");
	});

	it("hydrates canonical site data from the linked work request", async () => {
		const serviceCase = buildBaseServiceCase({
			location: undefined,
			siteName: undefined,
			contactName: undefined,
			contactPhone: undefined,
			contactEmail: undefined,
			workTypeName: undefined,
			priority: undefined,
			requestedDate: undefined,
			generalScope: undefined,
		});
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});
		mocks.workRequestFindById.mockReturnValue({
			lean: () =>
				Promise.resolve({
					clientName: "SierraCol Energy",
					requesterName: "Juan Prueba",
					requesterPhone: "+57 300 000 0001",
					requesterEmail: "jprueba@sierracol.com",
					serviceSite: "Planta principal Bogotá",
					serviceType: "Mantenimiento CCTV",
					urgency: "high",
					requestedDate: new Date("2026-05-01T08:00:00.000Z"),
					description: "Mantenimiento preventivo sistema CCTV",
				}),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_02_site_visit");

		expect(ctx.canonical.location).toBe("Planta principal Bogotá");
		expect(ctx.canonical.siteName).toBe("Planta principal Bogotá");
		expect(ctx.canonical.contactName).toBe("Juan Prueba");
		expect(ctx.canonical.workTypeName).toBe("Mantenimiento CCTV");
		expect(ctx.inheritedFields.find((field) => field.key === "location")?.value).toBe(
			"Planta principal Bogotá",
		);
	});

	it("returns proposalId inherited for step_04 (purchase order)", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_04_purchase_order");

		const proposalIdField = ctx.inheritedFields.find((f) => f.key === "proposalId");
		expect(proposalIdField).toBeDefined();
		expect(proposalIdField?.sourceStepCode).toBe("step_03_proposal");
		expect(proposalIdField?.required).toBe(true);
		expect(proposalIdField?.editable).toBe(false);
	});

	it("returns purchaseOrderId inherited for step_05 (planning)", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_05_planning");

		const poField = ctx.inheritedFields.find((f) => f.key === "purchaseOrderId");
		expect(poField).toBeDefined();
		expect(poField?.sourceStepCode).toBe("step_04_purchase_order");
		expect(poField?.required).toBe(true);
	});

	it("includes blockers from calculateStepBlockers", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const blocker = {
			code: "MISSING_DOCUMENT",
			message: "Falta permiso de trabajo en alturas",
			severity: "error" as const,
			step: "step_05_planning",
		};
		mocks.calculateStepBlockers.mockResolvedValue([blocker]);

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_05_planning");
		expect(ctx.blockers).toHaveLength(1);
		expect(ctx.blockers[0]?.code).toBe("MISSING_DOCUMENT");
	});

	it("exposes linked entity IDs from artifacts", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_05_planning");
		// workRequest, siteVisit, proposal, purchaseOrder are all present in base fixture
		expect(ctx.linkedEntityIds.workRequestId).toBe(WR_ID);
		expect(ctx.linkedEntityIds.siteVisitId).toBe(SV_ID);
		expect(ctx.linkedEntityIds.proposalId).toBe(PR_ID);
		expect(ctx.linkedEntityIds.purchaseOrderId).toBe(PO_ID);
	});

	it("returns previousStep for non-first steps", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_03_proposal");
		expect(ctx.previousStep).toBeDefined();
		expect(ctx.previousStep?.stepCode).toBe("step_02_site_visit");
	});

	it("returns void previousStep for step_01", async () => {
		const serviceCase = buildBaseServiceCase();
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_01_work_request");
		expect(ctx.previousStep).toBeUndefined();
	});

	it("does not inherit fields when artifact is missing", async () => {
		// Remove siteVisit artifact — step_03 should still work but sv fields should be absent
		const serviceCase = buildBaseServiceCase({
			artifacts: {
				workRequest: { id: new Types.ObjectId(WR_ID), code: "WR-2026-001", status: "completed" },
				// siteVisit intentionally missing
				proposal: { id: new Types.ObjectId(PR_ID), code: "PR-2026-001", status: "approved" },
			},
		});
		mocks.serviceCaseFindById.mockReturnValue({
			lean: () => Promise.resolve(serviceCase),
		});

		const ctx = await buildServiceCaseStepContext(CASE_ID, "step_03_proposal");
		// clientName and location still come from workRequest canonical data
		expect(ctx.inheritedFields.find((f) => f.key === "clientName")).toBeDefined();
		// technicalFindings / visitDate require siteVisit — should not be present
		const visitDate = ctx.inheritedFields.find((f) => f.key === "visitDate");
		expect(visitDate).toBeUndefined();
	});
});
