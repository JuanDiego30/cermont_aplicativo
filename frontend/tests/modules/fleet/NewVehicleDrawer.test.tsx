import { CreateVehicleSchema } from "@cermont/shared-types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewVehicleDrawer } from "@/modules/fleet/ui/NewVehicleDrawer";

const mocks = vi.hoisted(() => ({
	createVehicle: vi.fn(),
}));

vi.mock("@/modules/fleet/queries", () => ({
	useCreateVehicle: () => ({
		mutateAsync: mocks.createVehicle,
		mutate: mocks.createVehicle,
		isPending: false,
		error: void 0 as never,
	}),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

describe("NewVehicleDrawer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renderiza las secciones profesionales del formulario", () => {
		render(<NewVehicleDrawer open onClose={vi.fn()} />);

		// Verifica las secciones principales
		expect(screen.getByText("Identificación del vehículo")).toBeInTheDocument();
		expect(screen.getByText("Documentos obligatorios")).toBeInTheDocument();
		expect(screen.getByText("Asignación / Conductor")).toBeInTheDocument();
		expect(screen.getByText("Mantenimiento inicial")).toBeInTheDocument();
		expect(screen.getByText("Fotos iniciales")).toBeInTheDocument();
		expect(screen.getByText("Notas")).toBeInTheDocument();
	});

	it("no usa error global falso", () => {
		render(<NewVehicleDrawer open onClose={vi.fn()} />);

		// No debe mostrar un error global sin motivo
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("valida que la placa sea requerida", async () => {
		render(<NewVehicleDrawer open onClose={vi.fn()} />);

		const submitBtn = screen.getByRole("button", { name: /registrar vehículo/i });
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(screen.getByText("Mínimo 5 caracteres")).toBeInTheDocument();
		});

		// No debe llamar al API si la validación falla
		expect(mocks.createVehicle).not.toHaveBeenCalled();
	});

	it("envía un payload que satisface el contrato compartido", async () => {
		render(<NewVehicleDrawer open onClose={vi.fn()} />);

		// Llenar campos obligatorios
		fireEvent.change(screen.getByPlaceholderText("ABC-123"), { target: { value: "abc123" } });
		fireEvent.change(screen.getByPlaceholderText("Toyota"), { target: { value: "Toyota" } });
		fireEvent.change(screen.getByPlaceholderText("Hilux"), { target: { value: "Hilux" } });

		const yearInput = screen.getByDisplayValue(new Date().getFullYear().toString());
		fireEvent.change(yearInput, { target: { value: "2024" } });

		// Usar getByLabelText para encontrar el input SOAT
		const soatInput = screen.getByLabelText("Vencimiento SOAT");
		fireEvent.change(soatInput, { target: { value: "2026-12-31" } });

		// Enviar
		const submitBtn = screen.getByRole("button", { name: /registrar vehículo/i });
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(mocks.createVehicle).toHaveBeenCalled();
		});

		// Verificar que la placa se normalizó a mayúsculas
		const callArgs = mocks.createVehicle.mock.calls[0][0];
		expect(callArgs.plate).toBe("ABC123");
		expect(callArgs.soatExpiry).toBe("2026-12-31T00:00:00.000Z");
		expect(CreateVehicleSchema.safeParse(callArgs).success).toBe(true);
	});

	it("renderiza el botón para agregar fotos", () => {
		render(<NewVehicleDrawer open onClose={vi.fn()} />);

		expect(screen.getByText("Agregar fotos")).toBeInTheDocument();
	});
});
