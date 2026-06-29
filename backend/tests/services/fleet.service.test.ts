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
	vehicleUpdateOne: vi.fn(),
	createFileAssetFromUpload: vi.fn(),
	getFileAssetById: vi.fn(),
	listFileAssetsByEntity: vi.fn(),
	softDeleteFileAsset: vi.fn(),
	auditCreate: vi.fn(),
}));

vi.mock("../../src/models/Vehicle", () => ({
	VehicleModel: {
		create: mocks.vehicleCreate,
		find: mocks.vehicleFind,
		findById: mocks.vehicleFindById,
		findOne: mocks.vehicleFindOne,
		findByIdAndUpdate: mocks.vehicleFindByIdAndUpdate,
		countDocuments: mocks.vehicleCountDocuments,
		updateOne: mocks.vehicleUpdateOne,
	},
}));

vi.mock("../../src/modules/files/files.service", () => ({
	createFileAssetFromUpload: mocks.createFileAssetFromUpload,
	getFileAssetById: mocks.getFileAssetById,
	listFileAssetsByEntity: mocks.listFileAssetsByEntity,
	softDeleteFileAsset: mocks.softDeleteFileAsset,
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.auditCreate,
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
		primaryPhoto: { status: "absent" },
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

	describe("vehicle photos", () => {
		it("promotes and audits the first uploaded vehicle photo", async () => {
			const file = { originalname: "front.jpg" } as Express.Multer.File;
			mocks.vehicleFindById.mockResolvedValue(buildVehicle());
			mocks.createFileAssetFromUpload.mockResolvedValue({
				ref: {
					id: "photo-first",
					url: "/api/files/photo-first/content",
					originalName: "front.jpg",
					description: "Frontal",
					uploadedAt: "2026-06-29T12:00:00.000Z",
				},
				storedFilename: "stored-front.jpg",
				publicUrl: "/api/files/photo-first/content",
			});

			const photo = await FleetService.uploadVehiclePhoto(
				VEHICLE_ID,
				file,
				"Frontal",
				USER_ID,
				"supervisor@cermont.test",
			);

			expect(photo).toMatchObject({ id: "photo-first", isPrimary: true });
			expect(mocks.vehicleUpdateOne).toHaveBeenCalledWith(
				{ _id: VEHICLE_ID },
				{
					$set: {
						primaryPhoto: { status: "present", fileAssetId: "photo-first" },
						updatedBy: USER_ID,
					},
				},
			);
			expect(mocks.auditCreate).toHaveBeenCalledWith(
				expect.objectContaining({ action: "ASSET_PRIMARY_PHOTO_CHANGED" }),
			);
		});

		it("lists canonical FileAssets and marks the vehicle primary photo", async () => {
			mocks.vehicleFindById.mockResolvedValue(
				buildVehicle({ primaryPhoto: { status: "present", fileAssetId: "photo-2" } }),
			);
			mocks.listFileAssetsByEntity.mockResolvedValue([
				{
					id: "photo-1",
					url: "/api/files/photo-1/content",
					description: "Lateral",
					uploadedAt: new Date("2026-06-28T12:00:00.000Z"),
				},
				{
					id: "photo-2",
					url: "/api/files/photo-2/content",
					description: "Frontal",
					uploadedAt: new Date("2026-06-29T12:00:00.000Z"),
				},
			]);

			const photos = await FleetService.listVehiclePhotos(VEHICLE_ID);

			expect(photos).toEqual([
				expect.objectContaining({ id: "photo-1", isPrimary: false, title: "Lateral" }),
				expect.objectContaining({ id: "photo-2", isPrimary: true, title: "Frontal" }),
			]);
			expect(mocks.listFileAssetsByEntity).toHaveBeenCalledWith({
				entityType: "vehicle",
				entityId: VEHICLE_ID,
				category: "vehicle_image",
			});
		});

		it("rejects setting a photo owned by another vehicle as primary", async () => {
			mocks.vehicleFindById.mockResolvedValue(buildVehicle());
			mocks.getFileAssetById.mockResolvedValue({
				id: "photo-1",
				entityType: "vehicle",
				entityId: new Types.ObjectId(),
				category: "vehicle_image",
			});

			await expect(
				FleetService.setPrimaryVehiclePhoto(VEHICLE_ID, "photo-1", USER_ID),
			).rejects.toMatchObject({ code: "VEHICLE_PHOTO_NOT_FOUND" });
			expect(mocks.vehicleUpdateOne).not.toHaveBeenCalled();
		});

		it("selects and audits the next photo when deleting the primary", async () => {
			mocks.vehicleFindById.mockResolvedValue(
				buildVehicle({ primaryPhoto: { status: "present", fileAssetId: "photo-1" } }),
			);
			mocks.getFileAssetById.mockResolvedValue({
				id: "photo-1",
				entityType: "vehicle",
				entityId: new Types.ObjectId(VEHICLE_ID),
				category: "vehicle_image",
			});
			mocks.listFileAssetsByEntity.mockResolvedValue([{ id: "photo-2" }]);

			await FleetService.deleteVehiclePhoto(VEHICLE_ID, "photo-1", USER_ID);

			expect(mocks.softDeleteFileAsset).toHaveBeenCalledWith("photo-1", USER_ID);
			expect(mocks.vehicleUpdateOne).toHaveBeenCalledWith(
				{ _id: VEHICLE_ID },
				{
					$set: {
						primaryPhoto: { status: "present", fileAssetId: "photo-2" },
						updatedBy: USER_ID,
					},
				},
			);
			expect(mocks.auditCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "ASSET_PRIMARY_PHOTO_CHANGED",
					metadata: { fileAssetId: "photo-2", reason: "primary_photo_deleted" },
				}),
			);
		});
	});
});
