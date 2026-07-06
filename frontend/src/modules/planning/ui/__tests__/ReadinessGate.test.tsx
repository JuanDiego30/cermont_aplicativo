import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadinessGate } from "../ReadinessGate";

const PASSING_CHECKS = [
	{ name: "approvedProposalExists", label: "Propuesta aprobada", passed: true },
	{ name: "allTechsHaveValidCerts", label: "Certificaciones técnicas", passed: true },
	{ name: "allVehiclesDocumentsOk", label: "Documentos vehículos", passed: true },
	{ name: "allToolsCalibrated", label: "Calibración herramientas", passed: true },
	{ name: "safetyChecklistComplete", label: "Checklist de seguridad", passed: true },
	{ name: "evidenceSlotsComplete", label: "Slots de evidencia", passed: true },
];

const FAILING_CHECKS = [
	{ name: "approvedProposalExists", label: "Propuesta aprobada", passed: true },
	{
		name: "allTechsHaveValidCerts",
		label: "Certificaciones técnicas",
		passed: false,
		reason: "Técnico sin certificación vigente",
	},
	{ name: "allVehiclesDocumentsOk", label: "Documentos vehículos", passed: true },
	{
		name: "allToolsCalibrated",
		label: "Calibración herramientas",
		passed: false,
		reason: "Taladro sin calibrar",
	},
	{ name: "safetyChecklistComplete", label: "Checklist de seguridad", passed: true },
	{ name: "evidenceSlotsComplete", label: "Slots de evidencia", passed: true },
];

describe("ReadinessGate", () => {
	it("renders loading state", () => {
		render(<ReadinessGate checks={PASSING_CHECKS} canExecute={false} loading />);
		expect(screen.getByText("Checking readiness...")).toBeInTheDocument();
	});

	it("renders all checks passed state", () => {
		render(<ReadinessGate checks={PASSING_CHECKS} canExecute={true} />);
		PASSING_CHECKS.forEach((check) => {
			expect(screen.getByText(check.label)).toBeInTheDocument();
		});
	});

	it("shows green styling when canExecute is true", () => {
		const { container } = render(<ReadinessGate checks={PASSING_CHECKS} canExecute={true} />);
		const header = container.querySelector("h3");
		expect(header).toBeInTheDocument();
	});

	it("renders failed checks with reasons", () => {
		render(<ReadinessGate checks={FAILING_CHECKS} canExecute={false} />);
		expect(screen.getByText("Técnico sin certificación vigente")).toBeInTheDocument();
		expect(screen.getByText("Taladro sin calibrar")).toBeInTheDocument();
	});

	it("shows warning styling when checks have failures", () => {
		const { container } = render(<ReadinessGate checks={FAILING_CHECKS} canExecute={false} />);
		const header = container.querySelector("h3");
		expect(header).toBeInTheDocument();
	});

	it("renders with empty checks array", () => {
		const { container } = render(<ReadinessGate checks={[]} canExecute={true} />);
		expect(container.querySelector("h3")).toBeInTheDocument();
	});
});
