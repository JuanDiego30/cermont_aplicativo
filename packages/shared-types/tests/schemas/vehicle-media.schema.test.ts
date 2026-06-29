import { describe, expect, it } from "vitest";
import {
	CreateVehicleSchema,
	VehiclePhotoSchema,
	VehicleSchema,
} from "../../src/schemas/vehicle.schema";

const vehicle = {
	plate: "ABC-123",
	brand: "Toyota",
	model: "Hilux",
	year: 2024,
	type: "camioneta",
};

describe("vehicle media contract", () => {
	it("defaults media state without absence sentinels", () => {
		const parsed = VehicleSchema.parse(vehicle);

		expect(parsed.fileAssets).toEqual([]);
		expect(parsed.primaryPhoto).toEqual({ status: "absent" });
	});

	it("keeps media fields server-managed on vehicle creation", () => {
		expect(() =>
			CreateVehicleSchema.parse({
				...vehicle,
				fileAssets: [],
				primaryPhoto: { status: "absent" },
			}),
		).toThrow();
	});

	it("validates the fleet adapter photo DTO with the canonical file id", () => {
		const parsed = VehiclePhotoSchema.parse({
			id: "8f202b3d-76b7-4d58-98b0-f9dc711dbfa4",
			url: "/api/files/8f202b3d-76b7-4d58-98b0-f9dc711dbfa4/content",
			title: "Vista frontal",
			isPrimary: true,
			uploadedAt: "2026-06-29T12:00:00.000Z",
		});

		expect(parsed.id).toBe("8f202b3d-76b7-4d58-98b0-f9dc711dbfa4");
		expect(parsed.isPrimary).toBe(true);
	});
});
