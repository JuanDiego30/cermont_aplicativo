import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "@/core/ui/EmptyState";

describe("EmptyState", () => {
	it("renders the module illustration and delegates the primary action", () => {
		const onClick = vi.fn();

		render(
			<EmptyState
				icon="work-requests"
				title="No hay solicitudes"
				description="Crea la primera solicitud para iniciar el flujo."
				action={{ label: "Crear solicitud", onClick }}
			/>,
		);

		expect(screen.getByTestId("empty-state-illustration").getAttribute("data-illustration")).toBe(
			"work-requests",
		);

		fireEvent.click(screen.getByRole("button", { name: "Crear solicitud" }));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("supports a secondary action through the canonical button component", () => {
		const onSecondaryClick = vi.fn();

		render(
			<EmptyState
				icon="invoices"
				title="No hay facturas"
				secondaryAction={{
					label: "Revisar SES",
					onClick: onSecondaryClick,
					variant: "secondary",
				}}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Revisar SES" }));
		expect(onSecondaryClick).toHaveBeenCalledOnce();
	});
});
