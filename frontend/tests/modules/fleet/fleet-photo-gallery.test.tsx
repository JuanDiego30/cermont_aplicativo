import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FleetPhotoGallery } from "@/modules/fleet/ui/FleetPhotoGallery";

const mocks = vi.hoisted(() => ({
	handleDelete: vi.fn(),
	handleSetPrimary: vi.fn(),
	handleUpload: vi.fn(),
}));

vi.mock("@/modules/fleet/hooks/useFleetPhotos", () => ({
	useFleetPhotos: () => ({
		photos: [
			{
				id: "photo-primary",
				url: "/api/files/photo-primary/content",
				title: "Frontal",
				isPrimary: true,
				uploadedAt: "2026-06-29T12:00:00.000Z",
			},
			{
				id: "photo-secondary",
				url: "/api/files/photo-secondary/content",
				title: "Lateral",
				isPrimary: false,
				uploadedAt: "2026-06-29T13:00:00.000Z",
			},
		],
		isLoading: false,
		error: false,
		handleUpload: mocks.handleUpload,
		handleSetPrimary: mocks.handleSetPrimary,
		handleDelete: mocks.handleDelete,
		isUploading: false,
	}),
}));

describe("FleetPhotoGallery", () => {
	beforeEach(() => vi.clearAllMocks());

	it("uses the canonical file id for primary and delete mutations", () => {
		render(<FleetPhotoGallery vehicleId="vehicle-1" canManage />);

		fireEvent.click(screen.getByRole("button", { name: "Establecer como principal" }));
		fireEvent.click(screen.getByRole("button", { name: "Eliminar foto" }));

		expect(mocks.handleSetPrimary).toHaveBeenCalledWith("photo-secondary");
		expect(mocks.handleDelete).toHaveBeenCalledWith("photo-secondary");
	});

	it("hides upload and mutation controls from read-only roles", () => {
		render(<FleetPhotoGallery vehicleId="vehicle-1" canManage={false} />);

		expect(screen.queryByLabelText("Agregar foto")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Establecer como principal" }),
		).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Eliminar foto" })).not.toBeInTheDocument();
	});
});
