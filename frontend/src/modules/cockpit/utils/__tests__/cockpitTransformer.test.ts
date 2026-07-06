// @ts-expect-error - Mock for transformer, not a full ServiceCaseWorkflowViewModel
import type { ServiceCaseWorkflowViewModel } from "@cermont/shared-types";
import { describe, expect, it } from "vitest";
import { transformWorkflowToCockpitData } from "../cockpitTransformer";

const MOCK_WORKFLOW = {
	serviceCaseId: "abc123",
	code: "SC-2026-001",
	clientName: "Cliente Test",
	globalStatus: "active",
	updatedAt: new Date().toISOString(),
	currentStepCode: "step_05_planning",
	steps: [
		{
			stepNumber: 1,
			code: "step_01_work_request",
			label: "Solicitud",
			status: "completed",
			phase: "operational",
		},
		{
			stepNumber: 2,
			code: "step_02_site_visit",
			label: "Visita",
			status: "completed",
			phase: "operational",
		},
		{
			stepNumber: 3,
			code: "step_03_proposal",
			label: "Propuesta",
			status: "completed",
			phase: "operational",
		},
		{
			stepNumber: 4,
			code: "step_04_purchase_order",
			label: "PO",
			status: "completed",
			phase: "operational",
		},
		{
			stepNumber: 5,
			code: "step_05_planning",
			label: "Planeación",
			status: "active",
			phase: "operational",
		},
		{
			stepNumber: 6,
			code: "step_06_execution",
			label: "Ejecución",
			status: "pending",
			phase: "operational",
		},
	],
	blockers: [],
	nextActions: [
		{
			label: "Asignar cuadrilla",
			command: "assign_crew",
			requiredRole: "supervisor",
			route: "/planning",
		},
	],
	canAdvance: true,
	documents: [
		{
			documentId: "doc1",
			title: "ATS Firmado",
			purpose: "form_source",
			stepCode: "step_05_planning",
			fileUrl: "https://example.com/ats.pdf",
		},
	],
	evidences: [
		{
			evidenceId: "ev1",
			filename: "foto-001.jpg",
			evidenceType: "during",
			stepCode: "step_06_execution",
			url: "https://example.com/foto.jpg",
			capturedAt: new Date().toISOString(),
			hasGps: false,
		},
	],
	timeline: [],
} as unknown as ServiceCaseWorkflowViewModel;

function withBlockers(): ServiceCaseWorkflowViewModel {
	return {
		...MOCK_WORKFLOW,
		blockers: [
			{
				code: "MISSING_CREW_ASSIGNMENT",
				message: "Falta asignar cuadrilla",
				severity: "blocking",
				artifactType: "PlanningPacket",
				ownerRole: "supervisor",
				recommendedAction: "Asignar cuadrilla en planeación",
			},
		],
		canAdvance: false,
	} as unknown as ServiceCaseWorkflowViewModel;
}

describe("cockpitTransformer", () => {
	it("transforms serviceCaseId correctly", () => {
		const result = transformWorkflowToCockpitData(MOCK_WORKFLOW);
		expect(result.serviceCaseId).toBe("abc123");
	});

	it("maps step progress correctly", () => {
		const result = transformWorkflowToCockpitData(MOCK_WORKFLOW);
		expect(result.steps).toHaveLength(6);
		// Completed steps are "completed"
		expect(result.steps[0].status).toBe("completed");
		// Current step (no blockers) is "in_progress"
		expect(result.steps[4].status).toBe("in_progress");
		// Future steps are "pending"
		expect(result.steps[5].status).toBe("pending");
	});

	it("current step is blocked when blockers exist", () => {
		const workflow = withBlockers();
		const result = transformWorkflowToCockpitData(workflow);
		expect(result.currentStep).toBe(5);
		expect(result.steps[4].status).toBe("blocked");
	});

	it("maps next action when actions exist", () => {
		const result = transformWorkflowToCockpitData(MOCK_WORKFLOW);
		expect(result.nextAction).not.toBeNull();
		expect(result.nextAction?.description).toBe("Asignar cuadrilla");
	});

	it("returns null next action when no actions", () => {
		const workflow = {
			...MOCK_WORKFLOW,
			nextActions: [],
		} as unknown as ServiceCaseWorkflowViewModel;
		const result = transformWorkflowToCockpitData(workflow);
		expect(result.nextAction).toBeNull();
	});

	it("maps documents with correct status", () => {
		const result = transformWorkflowToCockpitData(MOCK_WORKFLOW);
		expect(result.documents).toHaveLength(1);
		expect(result.documents[0].name).toBe("ATS Firmado");
		expect(result.documents[0].status).toBe("ready");
	});

	it("maps evidences correctly", () => {
		const result = transformWorkflowToCockpitData(MOCK_WORKFLOW);
		expect(result.evidences).toHaveLength(1);
		expect(result.evidences[0].caption).toBe("foto-001.jpg");
	});

	it("handles empty blockers array", () => {
		const result = transformWorkflowToCockpitData(MOCK_WORKFLOW);
		expect(result.blockers).toHaveLength(0);
	});

	it("handles empty documents array", () => {
		const workflow = { ...MOCK_WORKFLOW, documents: [] } as unknown as ServiceCaseWorkflowViewModel;
		const result = transformWorkflowToCockpitData(workflow);
		expect(result.documents).toHaveLength(0);
	});
});
