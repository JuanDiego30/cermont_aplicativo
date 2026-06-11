/**
 * Fleet Service Tests
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	vehicleCreate: vi.fn(),
	vehicleFind: vi.fn(),
	vehicleFindById: vi.fn(),
	vehicleFindOne: vi.fn(),
	vehicleFindByIdAndUpdate: vi.fn(),
	vehicleCountDocuments: vi.fn(),
}));

vi.mock("../../src/models/Vehicle", () => ({
	VehicleModel: {
		create: mocks.vehicleCreate,
		find: mocks.vehicleFind,
		findById: mocks.vehicleFindById,
		findOne: mocks.vehicleFindOne,
		findByIdAndUpdate: mocks.vehicleFindByIdAndUpdate,
		countDocuments: mocks.vehicleCountDocuments,
	},
}));

import * as FleetService from "../../src/modules/fleet/fleet.service";

const VEHICLE_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439031";

function buildVehicle(overrides: Record<string, unknown> = {}) {
	const base = {
		_id: new Types.ObjectId(VEHICLE_ID),
		plate: "ABC-123",
		brand: "Toyota",
		model: "Hilux",
		year: 2022,
		type: "camioneta",
		kilometers: 50000,
		status: "active",
		...overrides,
	};
	return { ...base, toObject: () => base };
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("FleetService", () => {
	describe("createVehicle", () => {
		it("registers a vehicle with uppercased plate", async () => {
			mocks.vehicleFindOne.mockResolvedValue(null);
			const vehicle = buildVehicle();
			mocks.vehicleCreate.mockResolvedValue(vehicle);

			const result = await FleetService.createVehicle(
				{
					plate: "abc-123",
					brand: "Toyota",
					model: "Hilux",
					year: 2022,
					type: "camioneta",
					kilometers: 50000,
					status: "active",
				},
				USER_ID,
			);

			expect(result).toBe(vehicle);
			expect(mocks.vehicleCreate).toHaveBeenCalledWith(
				expect.objectContaining({ plate: "ABC-123", createdBy: USER_ID }),
			);
		});

		it("rejects duplicate plates", async () => {
			mocks.vehicleFindOne.mockResolvedValue(buildVehicle());

			await expect(
				FleetService.createVehicle(
					{
						plate: "ABC-123",
						brand: "Toyota",
						model: "Hilux",
						year: 2022,
						type: "camioneta",
						kilometers: 0,
						status: "active",
					},
					USER_ID,
				),
			).rejects.toMatchObject({ code: "VEHICLE_PLATE_ALREADY_EXISTS" });
		});
	});

	describe("updateVehicle", () => {
		it("blocks driver assignment when SOAT is expired", async () => {
			const expired = new Date(Date.now() - 24 * 60 * 60 * 1000);
			mocks.vehicleFindById.mockResolvedValue(buildVehicle({ soatExpiry: expired }));

			await expect(
				FleetService.updateVehicle(VEHICLE_ID, { driverName: "Juan Conductor" }, USER_ID),
			).rejects.toMatchObject({ code: "VEHICLE_DOCUMENTS_EXPIRED" });
		});
	});

	describe("getExpiringDocuments", () => {
		it("flags documents expiring within the window", async () => {
			const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
			const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({ soatExpiry: soon, technoMechanicalExpiry: past }),
			]);

			const alerts = await FleetService.getExpiringDocuments(30);

			expect(alerts).toHaveLength(2);
			expect(alerts[0]).toMatchObject({ documentType: "tecnomecanica", expired: true });
			expect(alerts[1]).toMatchObject({ documentType: "soat", expired: false });
		});
	});
});
