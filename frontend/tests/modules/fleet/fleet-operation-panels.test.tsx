import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadVehiclePhoto } from "@/modules/fleet/api/fleet-api";
import { FleetCheckinPanel } from "@/modules/fleet/ui/FleetCheckinPanel";
import { FleetCheckoutPanel } from "@/modules/fleet/ui/FleetCheckoutPanel";

const mocks = vi.hoisted(() => ({
	checkin: vi.fn(),
	checkout: vi.fn(),
}));

vi.mock("@/modules/fleet/queries", () => ({
	useCheckoutVehicle: () => ({ mutateAsync: mocks.checkout, isPending: false, isError: false }),
	useCheckinVehicle: () => ({ mutateAsync: mocks.checkin, isPending: false, isError: false }),
}));

vi.mock("@/modules/fleet/api/fleet-api", () => ({
	uploadVehiclePhoto: vi.fn(),
}));

const mockedUploadVehiclePhoto = vi.mocked(uploadVehiclePhoto);

describe("fleet operation panels", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.checkout.mockResolvedValue({});
		mocks.checkin.mockResolvedValue({});
		mockedUploadVehiclePhoto.mockResolvedValue({
			id: "vehicle-photo-1",
			url: "https://files.example.com/vehicle-photo-1.webp",
			title: "Salida ABC-123",
			isPrimary: false,
			uploadedAt: "2026-07-10T00:00:00.000Z",
		});
	});

	it("uploads checkout photos and submits their canonical file ids", async () => {
		render(
			<FleetCheckoutPanel
				assignmentId="assignment-1"
				vehicleId="vehicle-1"
				vehiclePlate="ABC-123"
				vehicleCurrentKm={1000}
			/>,
		);

		const photo = new File(["photo"], "checkout.webp", { type: "image/webp" });
		fireEvent.change(screen.getByLabelText(/agregar fotos/i), { target: { files: [photo] } });
		fireEvent.change(screen.getByLabelText("Notas"), { target: { value: "Sin novedades" } });
		fireEvent.click(screen.getByRole("button", { name: /registrar salida/i }));

		await waitFor(() => {
			expect(mockedUploadVehiclePhoto).toHaveBeenCalledWith("vehicle-1", photo, "Salida ABC-123");
			expect(mocks.checkout).toHaveBeenCalledWith({
				assignmentId: "assignment-1",
				input: {
					checkout: {
						mileage: 1000,
						fuelLevel: 75,
						notes: "Sin novedades",
						photos: ["vehicle-photo-1"],
					},
				},
			});
		});
	});

	it("uploads checkin photos and submits the inspection notes", async () => {
		render(
			<FleetCheckinPanel
				assignmentId="assignment-1"
				vehicleId="vehicle-1"
				vehiclePlate="ABC-123"
				checkoutMileage={1000}
			/>,
		);

		const photo = new File(["photo"], "checkin.webp", { type: "image/webp" });
		fireEvent.change(screen.getByLabelText(/agregar fotos/i), {
			target: { files: [photo] },
		});
		fireEvent.change(screen.getByLabelText(/daños/i), {
			target: { value: "Sin daños" },
		});
		fireEvent.click(screen.getByRole("button", { name: /registrar entrada/i }));

		await waitFor(() => {
			expect(mockedUploadVehiclePhoto).toHaveBeenCalledWith("vehicle-1", photo, "Entrada ABC-123");
			expect(mocks.checkin).toHaveBeenCalledWith({
				assignmentId: "assignment-1",
				input: {
					checkin: {
						mileage: 1000,
						fuelLevel: 50,
						damages: "Sin daños",
						photos: ["vehicle-photo-1"],
					},
				},
			});
		});
	});
});
