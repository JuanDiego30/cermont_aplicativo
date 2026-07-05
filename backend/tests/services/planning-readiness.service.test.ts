import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/PlanningPacket", () => ({
	PlanningPacket: { findById: vi.fn() },
}));

const { buildPlanningReadinessReport, resolvePlanningReadinessStatus } = await import(
	"../../src/modules/planning-packet/planning-readiness.service"
);
type ReadinessView = Parameters<typeof buildPlanningReadinessReport>[1];

function buildReadyPacket(): ReadinessView {
	return {
		status: "incomplete",
		responsibleInspectorName: "Carlos Pérez",
		place: "Caño Limón — Torre CCTV 4",
		plannedDate: "2026-07-10",
		businessUnit: "IT",
		scope: "Rutina preventiva de cámara CCTV y radioenlace en torre 4.",
		crew: [{ name: "Juan Rojas", role: "tecnico_electricista" }],
		materials: [{ description: "Cable UTP", quantity: 20 }],
		tools: [{ name: "Multímetro", available: true }],
		equipment: [{ name: "Camioneta 4x4", available: true, certificateRequired: false }],
		safetyElements: [{ description: "Arnés certificado", quantity: 2 }],
		workerRequirements: { electricistas: 1, tecnicosTelecomunicacion: 1 },
		responsibles: [
			{ role: "ingeniero_residente", status: "confirmed", name: "Carlos Pérez" },
			{ role: "tecnico_electricista", status: "confirmed", name: "Juan Rojas" },
			{ role: "hes", status: "confirmed", name: "Paola Petro" },
		],
		requiredCertifications: [{ verified: true, name: "Trabajo en alturas" }],
		astRequired: true,
		ptwRequired: true,
		supportDocuments: [
			{ documentType: "ast", required: true },
			{ documentType: "ptw", required: true },
		],
		readinessChecklist: [{ checked: true }],
		blockers: [{ resolved: true }],
	};
}

describe("buildPlanningReadinessReport", () => {
	it("reports canExecute=true with no blocking reasons when everything is ready", () => {
		const report = buildPlanningReadinessReport("packet-1", buildReadyPacket());

		expect(report.canExecute).toBe(true);
		expect(report.status).toBe("ready");
		expect(report.blockingReasons).toEqual([]);
		expect(report.checks).toHaveLength(7);
		expect(report.checks.every((check) => check.passed)).toBe(true);
	});

	it("names the unavailable tools in blockingReasons (LTG failure #1/#2)", () => {
		const packet = buildReadyPacket();
		packet.tools = [
			{ name: "Multímetro", available: true },
			{ name: "Pértiga dieléctrica", available: false },
		];

		const report = buildPlanningReadinessReport("packet-1", packet);

		expect(report.canExecute).toBe(false);
		expect(report.status).toBe("incomplete");
		expect(report.blockingReasons).toContain("Herramientas no disponibles: Pértiga dieléctrica.");
	});

	it("reports missing AST/PTW documents and unverified certifications explicitly", () => {
		const packet = buildReadyPacket();
		packet.supportDocuments = [];
		packet.requiredCertifications = [{ verified: false, name: "Trabajo en alturas" }];

		const report = buildPlanningReadinessReport("packet-1", packet);

		expect(report.canExecute).toBe(false);
		expect(report.blockingReasons).toContain("Falta el AST requerido para la actividad.");
		expect(report.blockingReasons).toContain("Falta el permiso de trabajo (PTW) requerido.");
		expect(report.blockingReasons).toContain("Certificaciones sin verificar: Trabajo en alturas.");
	});

	it("reports missing responsibles with role labels", () => {
		const packet = buildReadyPacket();
		packet.responsibles = packet.responsibles.filter((responsible) => responsible.role !== "hes");

		const report = buildPlanningReadinessReport("packet-1", packet);

		expect(report.canExecute).toBe(false);
		expect(report.blockingReasons).toContain("Falta confirmar el responsable: HES.");
	});
});

describe("resolvePlanningReadinessStatus", () => {
	it("stays aligned with the report gate", () => {
		const readyPacket = buildReadyPacket();
		expect(resolvePlanningReadinessStatus(readyPacket)).toBe("ready");

		readyPacket.blockers = [{ resolved: false }];
		expect(resolvePlanningReadinessStatus(readyPacket)).toBe("incomplete");
	});
});
