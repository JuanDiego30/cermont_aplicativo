/**
 * PlanningWizard step components tests.
 * Tests each step renders its fields and labels correctly.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CertificationsStep } from "@/modules/planning/ui/steps/CertificationsStep";
import { ResourcesStep } from "@/modules/planning/ui/steps/ResourcesStep";
import { ReviewStep } from "@/modules/planning/ui/steps/ReviewStep";
import { SafetyStep } from "@/modules/planning/ui/steps/SafetyStep";
import { ScheduleStep } from "@/modules/planning/ui/steps/ScheduleStep";

const noop = vi.fn();

describe("ScheduleStep", () => {
	it("renders all fields with labels", () => {
		render(
			<ScheduleStep
				place=""
				onPlaceChange={noop}
				plannedDate=""
				onPlannedDateChange={noop}
				businessUnit="GEN"
				onBusinessUnitChange={noop}
				responsibleName=""
				onResponsibleNameChange={noop}
					scope=""
					onScopeChange={noop}
					materials={[]}
					tools={[]}
					equipment={[]}
					safetyElements={[]}
					workerReqs={{ electricistas: 0, tecnicosTelecomunicacion: 0, instrumentistas: 0, obreros: 0 }}
					astRequired={false}
					ptwRequired={false}
					requiredSignatureCount={3}
				/>,
		);

		expect(screen.getByLabelText(/lugar/i)).toBeDefined();
		expect(screen.getByText(/unidad de negocio/i)).toBeDefined();
		expect(screen.getByLabelText(/responsable/i)).toBeDefined();
		expect(screen.getByLabelText(/alcance/i)).toBeDefined();
	});

	it("displays step title", () => {
		render(
			<ScheduleStep
				place=""
				onPlaceChange={noop}
				plannedDate=""
				onPlannedDateChange={noop}
				businessUnit="GEN"
				onBusinessUnitChange={noop}
				responsibleName=""
				onResponsibleNameChange={noop}
					scope=""
					onScopeChange={noop}
					materials={[]}
					tools={[]}
					equipment={[]}
					safetyElements={[]}
					workerReqs={{ electricistas: 0, tecnicosTelecomunicacion: 0, instrumentistas: 0, obreros: 0 }}
					astRequired={false}
					ptwRequired={false}
					requiredSignatureCount={3}
				/>,
		);

		expect(screen.getByText(/Paso 1: Cronograma e Información Básica/i)).toBeDefined();
	});
});

describe("ResourcesStep", () => {
	const defaultWorkers = {
		electricistas: 0,
		tecnicosTelecomunicacion: 0,
		instrumentistas: 0,
		obreros: 0,
	};
	const defaultProps = {
		materials: [] as Array<{ description: string; quantity: number; unit: string }>,
		onMaterialsChange: noop,
		tools: [] as Array<{ name: string; quantity: number; available: boolean }>,
		onToolsChange: noop,
		equipment: [] as Array<{
			name: string;
			quantity: number;
			available: boolean;
			certificateRequired: boolean;
		}>,
		onEquipmentChange: noop,
		safetyElements: [] as Array<{ description: string; quantity: number; unit: string }>,
		onSafetyElementsChange: noop,
		workerReqs: defaultWorkers,
		onWorkerReqsChange: noop,
	};

	it("renders resource tabs", () => {
		render(<ResourcesStep {...defaultProps} />);

		expect(screen.getByText("Materiales")).toBeDefined();
		expect(screen.getByText("Herramientas")).toBeDefined();
		expect(screen.getByText("Equipos")).toBeDefined();
		expect(screen.getByText("EPP / Seguridad")).toBeDefined();
		expect(screen.getByText("Personal")).toBeDefined();
	});

	it("shows added materials in the list", () => {
		render(
			<ResourcesStep
				{...defaultProps}
				materials={[{ description: "Cable UTP", quantity: 10, unit: "m" }]}
			/>,
		);

		const input = screen.getByDisplayValue("Cable UTP");
		expect(input).toBeDefined();
	});
});

describe("SafetyStep", () => {
	it("renders safety fields", () => {
		render(
			<SafetyStep
				astRequired={true}
				onAstRequiredChange={noop}
				ptwRequired={true}
				onPtwRequiredChange={noop}
				planningNotes=""
				onPlanningNotesChange={noop}
			/>,
		);

		expect(screen.getByText(/AST Requerido/i)).toBeDefined();
		expect(screen.getByText("Permiso de Trabajo (PTW)")).toBeDefined();
		expect(screen.getByLabelText(/Observaciones/i)).toBeDefined();
	});
});

describe("CertificationsStep", () => {
	it("renders certifications fields", () => {
		render(<CertificationsStep certifications={[]} onCertificationsChange={noop} />);

		expect(screen.getByText(/Certificaciones y Habilitaciones/i)).toBeDefined();
		expect(screen.getByText(/Certificaciones Comunes/i)).toBeDefined();
	});
});

describe("ReviewStep", () => {
	const defaultWorkers = {
		electricistas: 0,
		tecnicosTelecomunicacion: 0,
		instrumentistas: 0,
		obreros: 0,
	};

	it("renders summary sections", () => {
		render(
			<ReviewStep
				place="Campo Caño Limón"
				plannedDate="2026-08-01T08:00:00.000Z"
				businessUnit="GEN"
				responsibleName="Juan Pérez"
				scope="Prueba de revisión con al menos 20 caracteres obligatorios."
				materials={[]}
				tools={[]}
				equipment={[]}
				safetyElements={[]}
				workerReqs={defaultWorkers}
				responsibles={[]}
				certifications={[]}
				astRequired={true}
				ptwRequired={false}
				planningNotes="Notas de seguridad"
			/>,
		);

		expect(screen.getByText(/Información Básica/i)).toBeDefined();
		expect(screen.getByText(/Resumen de Recursos/i)).toBeDefined();
		expect(screen.getByText(/Observaciones HES/i)).toBeDefined();
		expect(screen.getByText("Campo Caño Limón")).toBeDefined();
		expect(screen.getByText("Juan Pérez")).toBeDefined();
	});
});
