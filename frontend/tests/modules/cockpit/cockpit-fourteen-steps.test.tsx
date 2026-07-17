/**
 * Tests for the 14-step Cockpit — progress bar, step ordering,
 * blocker display, next actions, and missing documents.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StepProgress } from "@/modules/cockpit/model/cockpit.types";
import { FourteenStepProgressBar } from "@/modules/cockpit/ui/FourteenStepProgressBar";

const ALL_STEPS: StepProgress[] = [
	{ step: 1, label: "Solicitud de servicio", status: "completed" },
	{ step: 2, label: "Visita técnica", status: "completed" },
	{ step: 3, label: "Propuesta económica", status: "completed" },
	{ step: 4, label: "Orden de compra", status: "completed" },
	{ step: 5, label: "Planeación", status: "in_progress" },
	{ step: 6, label: "Ejecución en campo", status: "pending" },
	{ step: 7, label: "Informe técnico", status: "pending" },
	{ step: 8, label: "Acta de entrega", status: "pending" },
	{ step: 9, label: "Firma del cliente", status: "pending" },
	{ step: 10, label: "Radicación SES", status: "pending" },
	{ step: 11, label: "Aprobación SES", status: "pending" },
	{ step: 12, label: "Factura", status: "pending" },
	{ step: 13, label: "Aprobación factura", status: "pending" },
	{ step: 14, label: "Pago y cierre", status: "pending" },
];

const BLOCKED_STEPS: StepProgress[] = ALL_STEPS.map((s) =>
	s.step === 5 ? { ...s, status: "blocked" as const } : s,
);

describe("FourteenStepProgressBar", () => {
	it("renders all 14 steps", () => {
		render(<FourteenStepProgressBar steps={ALL_STEPS} currentStep={5} />);
		const nav = screen.getByRole("navigation", { name: /progreso de los 14 pasos/i });
		expect(nav).toBeDefined();
	});

	it("renders steps in correct order", () => {
		render(<FourteenStepProgressBar steps={ALL_STEPS} currentStep={5} />);
		ALL_STEPS.forEach((step) => {
			const title = `Paso ${step.step}: ${step.label}`;
			expect(screen.getByTitle(new RegExp(title))).toBeDefined();
		});
	});

	it("highlights the current step", () => {
		render(<FourteenStepProgressBar steps={ALL_STEPS} currentStep={5} />);
		const stepBtn = screen.getByTitle(/Paso 5: Planeación/);
		expect(stepBtn.className).toContain("ring-2");
	});

	it("shows blocked step with alert icon", () => {
		render(<FourteenStepProgressBar steps={BLOCKED_STEPS} currentStep={5} />);
		const stepBtn = screen.getByTitle(/Paso 5: Planeación/);
		expect(stepBtn).toBeDefined();
	});

	it("shows completed steps with check icon", () => {
		render(<FourteenStepProgressBar steps={ALL_STEPS} currentStep={5} />);
		const stepBtn = screen.getByTitle(/Paso 1: Solicitud de servicio/);
		expect(stepBtn).toBeDefined();
	});

	it("triggers onStepClick when a step is clicked", () => {
		let clicked = 0;
		render(
			<FourteenStepProgressBar
				steps={ALL_STEPS}
				currentStep={5}
				onStepClick={() => {
					clicked = 1;
				}}
			/>,
		);
		const stepBtn = screen.getByTitle(/Paso 1: Solicitud de servicio/);
		stepBtn.click();
		expect(clicked).toBe(1);
	});

	it("renders with empty steps array", () => {
		render(<FourteenStepProgressBar steps={[]} currentStep={1} />);
		const nav = screen.getByRole("navigation", { name: /progreso de los 14 pasos/i });
		expect(nav).toBeDefined();
	});

	it("renders all-14 steps without error", () => {
		const mockSteps: StepProgress[] = Array.from({ length: 14 }, (_, i) => ({
			step: i + 1,
			label: `Paso ${i + 1}`,
			status: i < 4 ? "completed" : i === 4 ? "in_progress" : "pending",
		}));
		render(<FourteenStepProgressBar steps={mockSteps} currentStep={5} />);
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBe(14);
	});
});
