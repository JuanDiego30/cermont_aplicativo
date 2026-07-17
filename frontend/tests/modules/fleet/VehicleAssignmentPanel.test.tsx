import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VehicleAssignmentPanel } from "@/modules/fleet/ui/VehicleAssignmentPanel";

const mocks = vi.hoisted(() => ({
	activeAssignment: null as Record<string, unknown> | null,
	history: [] as Record<string, unknown>[],
	isActiveLoading: false,
	isHistoryLoading: false,
	assignMutation: { mutate: vi.fn(), isPending: false, error: null as Error | null },
	checkoutMutation: { mutate: vi.fn(), isPending: false, error: null as Error | null },
	checkinMutation: { mutate: vi.fn(), isPending: false, error: null as Error | null },
}));

vi.mock("@/modules/fleet/queries", () => ({
	useActiveVehicleAssignment: (_vehicleId: string) => ({
		data: mocks.activeAssignment,
		isLoading: mocks.isActiveLoading,
	}),
	useVehicleHistory: (_vehicleId: string) => ({
		data: mocks.history,
		isLoading: mocks.isHistoryLoading,
		isError: false,
	}),
	useAssignVehicle: () => mocks.assignMutation,
	useCheckoutVehicle: () => mocks.checkoutMutation,
	useCheckinVehicle: () => mocks.checkinMutation,
}));

vi.mock("@/modules/auth/hooks/useAuth", () => ({
	useAuth: () => ({ user: { id: "user-1", role: "gerente" } }),
}));

describe("VehicleAssignmentPanel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.activeAssignment = void 0 as never;
		mocks.history = [];
	});

	it("muestra empty state cuando no hay asignación activa", () => {
		render(<VehicleAssignmentPanel vehicleId="vehicle-1" />);

		expect(screen.getByText("El vehículo está disponible para asignación.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /asignarme este vehículo/i })).toBeInTheDocument();
	});

	it("muestra historial vacío cuando no hay asignaciones", () => {
		render(<VehicleAssignmentPanel vehicleId="vehicle-1" />);

		expect(screen.getByText("Sin asignaciones registradas.")).toBeInTheDocument();
	});

	it("muestra asignación activa con formulario de checkout", () => {
		mocks.activeAssignment = {
			_id: "assign-1",
			vehicleId: "vehicle-1",
			driverId: "user-1",
			driverName: "Juan Pérez",
			status: "pending",
			assignedAt: new Date().toISOString(),
			assignedBy: "user-1",
		};

		render(<VehicleAssignmentPanel vehicleId="vehicle-1" />);

		expect(screen.getByRole("button", { name: /registrar salida/i })).toBeInTheDocument();
		expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
	});

	it("muestra acciones checkout/checkin según estado", () => {
		mocks.activeAssignment = {
			_id: "assign-1",
			vehicleId: "vehicle-1",
			driverId: "user-1",
			driverName: "Juan Pérez",
			status: "active",
			assignedAt: new Date().toISOString(),
			assignedBy: "user-1",
			checkout: { mileage: 5000, fuelLevel: 80, photos: [] },
		};

		render(<VehicleAssignmentPanel vehicleId="vehicle-1" />);

		expect(screen.getByRole("button", { name: /registrar regreso/i })).toBeInTheDocument();
	});
});
