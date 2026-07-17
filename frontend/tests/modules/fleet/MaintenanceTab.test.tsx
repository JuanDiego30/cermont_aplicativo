import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaintenanceTab } from "@/modules/fleet/ui/MaintenanceTab";

const mocks = vi.hoisted(() => ({
	updateVehicle: vi.fn(),
}));

vi.mock("@/modules/fleet/queries", () => ({
	useUpdateVehicle: () => ({
		mutateAsync: mocks.updateVehicle,
		isPending: false,
	error: void 0 as never,
	}),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

describe("MaintenanceTab", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("muestra alerta por kilometraje vencido", () => {
		render(
			<MaintenanceTab
				vehicleId="vehicle-1"
				kilometers={15000}
				nextMaintenanceKm={10000}
				lastMaintenanceAt="2024-01-15T00:00:00.000Z"
			/>,
		);

		expect(screen.getByText("Mantenimiento vencido por kilometraje")).toBeInTheDocument();
	});

	it("no muestra alerta cuando kilometraje está por debajo del próximo mantenimiento", () => {
		render(<MaintenanceTab vehicleId="vehicle-1" kilometers={5000} nextMaintenanceKm={10000} />);

		expect(screen.queryByText("Mantenimiento vencido por kilometraje")).not.toBeInTheDocument();
	});

	it("no muestra alerta cuando no hay próximo mantenimiento configurado", () => {
		render(<MaintenanceTab vehicleId="vehicle-1" kilometers={5000} />);

		expect(screen.queryByText("Mantenimiento vencido por kilometraje")).not.toBeInTheDocument();
	});

	it("permite actualizar datos de mantenimiento", async () => {
		render(
			<MaintenanceTab
				vehicleId="vehicle-1"
				kilometers={5000}
				nextMaintenanceKm={10000}
				lastMaintenanceAt="2024-01-15T00:00:00.000Z"
				notes="Cambio de aceite"
			/>,
		);

		// Verificar que los campos contienen los valores iniciales
		const dateInput = screen.getByDisplayValue("2024-01-15");
		expect(dateInput).toBeInTheDocument();

		// Modificar el campo de kilometraje
		const kmInput = screen.getByDisplayValue("10000");
		fireEvent.change(kmInput, { target: { value: "15000" } });

		// Guardar
		const saveBtn = screen.getByRole("button", { name: /guardar cambios/i });
		fireEvent.click(saveBtn);

		await waitFor(() => {
			expect(mocks.updateVehicle).toHaveBeenCalled();
		});

		const callArgs = mocks.updateVehicle.mock.calls[0][0];
		expect(callArgs.input.nextMaintenanceKm).toBe(15000);
	});
});
