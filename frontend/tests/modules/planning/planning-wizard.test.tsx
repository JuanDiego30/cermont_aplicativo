/**
 * PlanningWizard integration tests.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlanningWizard } from "@/modules/planning/ui/PlanningWizard";

const noop = vi.fn();

describe("PlanningWizard", () => {
	it("renders first step and does not advance without validation", () => {
		render(<PlanningWizard workOrderId="order123" onSubmit={noop} isPending={false} />);

		// Verify first step header
		expect(screen.getByText(/Paso 1: Cronograma e Información Básica/i)).toBeDefined();

		// Clicking next should trigger validation error or stay on step 1 since fields are empty
		const nextBtn = screen.getByText(/Siguiente/i);
		fireEvent.click(nextBtn);

		expect(screen.getByText(/Paso 1: Cronograma e Información Básica/i)).toBeDefined();
	});

	it("advances steps when inputs are valid", () => {
		render(<PlanningWizard workOrderId="order123" onSubmit={noop} isPending={false} />);

		// Fill fields for Step 1
		const respInput = screen.getByLabelText(/Responsable \/ Inspector HES/i);
		fireEvent.change(respInput, { target: { value: "Ing. Carlos Mendoza" } });

		const placeInput = screen.getByLabelText(/Lugar de Trabajo/i);
		fireEvent.change(placeInput, { target: { value: "Estación Banadía" } });

		const dateInput = screen.getByLabelText(/Fecha y Hora de Ejecución/i);
		fireEvent.change(dateInput, { target: { value: "2026-08-01T08:00" } });

		const scopeInput = screen.getByLabelText(/Alcance Detallado de la Planeación/i);
		fireEvent.change(scopeInput, {
			target: { value: "Este es un alcance lo suficientemente largo para validar." },
		});

		// Click Siguiente
		const nextBtn = screen.getByText(/Siguiente/i);
		fireEvent.click(nextBtn);

		// Should render Step 2: Resources
		expect(screen.getByText(/Paso 2: Asignación de Recursos/i)).toBeDefined();
	});
});
