/**
 * Tests for Planning Detail enrichment components:
 * - PlanningAstPtwSection
 * - PlanningCostBaselineSection
 * - PlanningResourcesSummary
 * - PlanningSignaturesSection
 */

import type {
	CostBaselineSnapshot,
	PlanningResourceLine,
	PlanningResponsible,
} from "@cermont/shared-types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanningAstPtwSection } from "@/modules/planning/ui/PlanningAstPtwSection";
import { PlanningCostBaselineSection } from "@/modules/planning/ui/PlanningCostBaselineSection";
import { PlanningResourcesSummary } from "@/modules/planning/ui/PlanningResourcesSummary";
import { PlanningSignaturesSection } from "@/modules/planning/ui/PlanningSignaturesSection";

describe("PlanningAstPtwSection", () => {
	it("shows no permits required when none needed", () => {
		render(<PlanningAstPtwSection astRequired={false} ptwRequired={false} />);
		expect(screen.getByText(/No se requieren permisos especiales/i)).toBeDefined();
	});

	it("shows AST required badge when astRequired is true", () => {
		render(<PlanningAstPtwSection astRequired={true} ptwRequired={false} />);
		expect(screen.getByText(/Análisis Seguro de Trabajo/i)).toBeDefined();
	});

	it("shows PTW required badge when ptwRequired is true", () => {
		render(<PlanningAstPtwSection astRequired={false} ptwRequired={true} />);
		expect(screen.getByText(/Permiso de Trabajo/i)).toBeDefined();
	});

	it("shows support documents when provided", () => {
		const docs = [
			{
				documentId: "id1",
				name: "AST-001",
				url: "/ast-001.pdf",
				documentType: "ast" as const,
				uploadedAt: new Date().toISOString(),
				required: true,
			},
		];
		render(
			<PlanningAstPtwSection astRequired={true} ptwRequired={false} supportDocuments={docs} />,
		);
		expect(screen.getByText("AST-001")).toBeDefined();
	});

	it("shows both AST and PTW when both required", () => {
		render(<PlanningAstPtwSection astRequired={true} ptwRequired={true} />);
		expect(screen.getByText(/Análisis Seguro de Trabajo/i)).toBeDefined();
		expect(screen.getByText(/Permiso de Trabajo/i)).toBeDefined();
	});
});

describe("PlanningCostBaselineSection", () => {
	it("shows empty state when no cost baseline", () => {
		render(<PlanningCostBaselineSection />);
		expect(screen.getByText(/No se ha definido un costo estimado/i)).toBeDefined();
	});

	it("shows cost breakdown when snapshot provided", () => {
		const baseline: CostBaselineSnapshot = {
			frozenAt: new Date().toISOString(),
			frozenBy: "Test User",
			laborCosts: 500000,
			materialCosts: 300000,
			equipmentCosts: 200000,
			totalBudget: 1000000,
			contingencyPercentage: 10,
			contingencyAmount: 100000,
			grandTotal: 1100000,
		};
		render(<PlanningCostBaselineSection costBaseline={baseline} />);
		expect(screen.getByText(/Mano de obra/i)).toBeDefined();
		expect(screen.getByText(/Total general/i)).toBeDefined();
	});
});

describe("PlanningResourcesSummary", () => {
	it("shows empty state when no resources", () => {
		render(<PlanningResourcesSummary />);
		expect(screen.getByText(/Recursos/i)).toBeDefined();
	});

	it("shows materials when provided", () => {
		const materials: PlanningResourceLine[] = [
			{ description: "Cable UTP", quantity: 100, unit: "m" },
		];
		render(<PlanningResourcesSummary materials={materials} />);
		expect(screen.getByText(/Cable UTP/)).toBeDefined();
	});

	it("shows worker count when requirements provided", () => {
		render(
			<PlanningResourcesSummary
				workerRequirements={{
					electricistas: 2,
					tecnicosTelecomunicacion: 1,
					instrumentistas: 0,
					obreros: 3,
				}}
			/>,
		);
		expect(screen.getByText("2")).toBeDefined();
		expect(screen.getByText("1")).toBeDefined();
	});
});

describe("PlanningSignaturesSection", () => {
	it("shows empty state when no responsibles", () => {
		render(<PlanningSignaturesSection />);
		expect(screen.getByText(/No se han asignado responsables/i)).toBeDefined();
	});

	it("shows responsibles when provided", () => {
		const responsibles: PlanningResponsible[] = [
			{
				role: "ingeniero_residente",
				name: "Juan Pérez",
				status: "signed",
				signedAt: new Date().toISOString(),
			},
			{ role: "hes", name: "María López", status: "assigned" },
		];
		render(<PlanningSignaturesSection responsibles={responsibles} />);
		expect(screen.getByText("Juan Pérez")).toBeDefined();
		expect(screen.getByText("María López")).toBeDefined();
	});

	it("shows signed status with date", () => {
		const responsibles: PlanningResponsible[] = [
			{
				role: "ingeniero_residente",
				name: "Juan Pérez",
				status: "signed",
				signedAt: new Date("2026-07-01").toISOString(),
			},
		];
		render(<PlanningSignaturesSection responsibles={responsibles} />);
		expect(screen.getByText(/Firmado/)).toBeDefined();
	});
});
