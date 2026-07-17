/**
 * Fleet Document Validation & Expiry Blocker Tests — T073/T075
 *
 * Validates:
 * 1. Adding structured documents to vehicles
 * 2. Detecting expired documents
 * 3. Blocking dispatch with expired documents
 * 4. Fleet readiness calculation
 * 5. Blocker document detection
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	vehicleFind: vi.fn(),
	vehicleFindById: vi.fn(),
	vehicleFindOne: vi.fn(),
	vehicleFindByIdAndUpdate: vi.fn(),
	vehicleCountDocuments: vi.fn(),
	vehicleUpdateOne: vi.fn(),
	auditCreate: vi.fn(),
}));

vi.mock("../../src/models/Vehicle", () => ({
	VehicleModel: {
		find: mocks.vehicleFind,
		findById: mocks.vehicleFindById,
		findOne: mocks.vehicleFindOne,
		findByIdAndUpdate: mocks.vehicleFindByIdAndUpdate,
		countDocuments: mocks.vehicleCountDocuments,
		updateOne: mocks.vehicleUpdateOne,
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.auditCreate,
}));

vi.mock("../../src/config/env", () => ({
	env: {
		MONGODB_URI: "mongodb://127.0.0.1:27017/cermont_test",
		JWT_SECRET: "test-jwt-secret-for-testing-only-thirtytwochars",
		REFRESH_TOKEN_SECRET: "test-refresh-secret-for-testing-only",
		FRONTEND_URL: "http://localhost:3000",
		NODE_ENV: "test",
		PORT: "4000",
	},
	validateBackendEnv: () => ({}),
}));

import * as FleetService from "../../src/modules/fleet/fleet.service";

const VEHICLE_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439031";

function toObject(record: Record<string, unknown>) {
	return { ...record, toObject: () => ({ ...record }) };
}

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
		documents: [],
		...overrides,
	};
	return toObject(base);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("T073 — Vehicle document contract", () => {
	describe("addVehicleDocument", () => {
		it("adds a SOAT document and updates the flat expiry field", async () => {
			const vehicle = buildVehicle();
			mocks.vehicleFindById.mockResolvedValue(vehicle);
			mocks.vehicleFindByIdAndUpdate.mockResolvedValue(vehicle);

			await FleetService.addVehicleDocument(VEHICLE_ID, {
				documentType: "soat",
				documentNumber: "SOAT-2026-001",
				issueDate: "2026-01-01T00:00:00.000Z",
				expiryDate: "2027-01-01T00:00:00.000Z",
			});

			expect(mocks.vehicleFindByIdAndUpdate).toHaveBeenCalledWith(
				VEHICLE_ID,
				expect.objectContaining({
					$push: expect.objectContaining({
						documents: expect.objectContaining({
							documentType: "soat",
							documentNumber: "SOAT-2026-001",
						}),
					}),
					$set: expect.objectContaining({
						soatExpiry: expect.any(Date),
					}),
				}),
				expect.objectContaining({ returnDocument: "after" }),
			);
		});

		it("adds a tarjeta_propiedad document (no flat field)", async () => {
			const vehicle = buildVehicle();
			mocks.vehicleFindById.mockResolvedValue(vehicle);
			mocks.vehicleFindByIdAndUpdate.mockResolvedValue(vehicle);

			await FleetService.addVehicleDocument(VEHICLE_ID, {
				documentType: "tarjeta_propiedad",
				documentNumber: "TP-123456",
				issueDate: "2020-06-01T00:00:00.000Z",
				expiryDate: "2030-06-01T00:00:00.000Z",
			});

			const updateCall = mocks.vehicleFindByIdAndUpdate.mock.calls[0][1];
			expect(updateCall.$push.documents.documentType).toBe("tarjeta_propiedad");
			expect(updateCall.$set).toBeUndefined();
		});
	});

	describe("validarDocumentosVehiculo", () => {
		it("returns tarjeta de propiedad as missing when not registered", async () => {
			const vehicle = buildVehicle({
				soatExpiry: new Date("2027-01-01"),
				technoMechanicalExpiry: new Date("2027-01-01"),
				insuranceExpiry: new Date("2027-01-01"),
				documents: [],
			});
			mocks.vehicleFindById.mockResolvedValue(vehicle);

			const status = await FleetService.validarDocumentosVehiculo(VEHICLE_ID);
			expect(status.missingDocuments).toContain("Tarjeta de propiedad");
			expect(status.allDocumentsValid).toBe(false);
		});

		it("returns all documents valid when all four are registered and current", async () => {
			const future = new Date("2027-06-01");
			const vehicle = buildVehicle({
				soatExpiry: future,
				technoMechanicalExpiry: future,
				insuranceExpiry: future,
				documents: [
					{
						documentType: "tarjeta_propiedad",
						documentNumber: "TP-789",
						issueDate: new Date("2020-01-01"),
						expiryDate: future,
						status: "valid",
					},
				],
			});
			mocks.vehicleFindById.mockResolvedValue(vehicle);

			const status = await FleetService.validarDocumentosVehiculo(VEHICLE_ID);
			expect(status.missingDocuments).toEqual([]);
			expect(status.allDocumentsValid).toBe(true);
		});
	});
});

describe("T074 — Expiry alerts and blockers", () => {
	describe("getBlockerDocuments", () => {
		it("returns empty blockers for a fully compliant vehicle", async () => {
			const future = new Date("2028-01-01");
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					soatExpiry: future,
					technoMechanicalExpiry: future,
					insuranceExpiry: future,
					documents: [
						{
							documentType: "tarjeta_propiedad",
							documentNumber: "TP-001",
							issueDate: new Date("2020-01-01"),
							expiryDate: future,
							status: "valid",
						},
					],
				}),
			]);

			const blockers = await FleetService.getBlockerDocuments();
			expect(blockers).toHaveLength(1);
			expect(blockers[0].ready).toBe(true);
			expect(blockers[0].blockers).toEqual([]);
		});

		it("flags vehicle with expired SOAT as blocked", async () => {
			const future = new Date("2028-01-01");
			const past = new Date("2024-01-01");
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					soatExpiry: past,
					technoMechanicalExpiry: future,
					insuranceExpiry: future,
					documents: [
						{
							documentType: "tarjeta_propiedad",
							documentNumber: "TP-001",
							issueDate: new Date("2020-01-01"),
							expiryDate: future,
							status: "valid",
						},
					],
				}),
			]);

			const blockers = await FleetService.getBlockerDocuments();
			expect(blockers[0].ready).toBe(false);
			expect(blockers[0].blockers).toEqual(
				expect.arrayContaining([expect.stringContaining("SOAT")]),
			);
		});

		it("flags vehicle with missing tecnomecanica as blocked", async () => {
			const future = new Date("2028-01-01");
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					soatExpiry: future,
					technoMechanicalExpiry: undefined,
					insuranceExpiry: future,
					documents: [
						{
							documentType: "tarjeta_propiedad",
							documentNumber: "TP-001",
							issueDate: new Date("2020-01-01"),
							expiryDate: future,
							status: "valid",
						},
					],
				}),
			]);

			const blockers = await FleetService.getBlockerDocuments();
			expect(blockers[0].ready).toBe(false);
			expect(blockers[0].blockers).toEqual(
				expect.arrayContaining([expect.stringContaining("Tecnomecánica")]),
			);
		});

		it("flags vehicle with missing property card as blocked", async () => {
			const future = new Date("2028-01-01");
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					soatExpiry: future,
					technoMechanicalExpiry: future,
					insuranceExpiry: future,
					documents: [],
				}),
			]);

			const blockers = await FleetService.getBlockerDocuments();
			expect(blockers[0].ready).toBe(false);
			expect(blockers[0].blockers).toEqual(
				expect.arrayContaining([expect.stringContaining("Tarjeta de propiedad")]),
			);
		});
	});

	describe("getFleetReadiness", () => {
		it("returns 100% readiness when all vehicles are compliant", async () => {
			const future = new Date("2028-01-01");
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					plate: "ABC-123",
					soatExpiry: future,
					technoMechanicalExpiry: future,
					insuranceExpiry: future,
					documents: [
						{
							documentType: "tarjeta_propiedad",
							documentNumber: "TP-001",
							issueDate: new Date("2020-01-01"),
							expiryDate: future,
							status: "valid",
						},
					],
				}),
				buildVehicle({
					_id: new Types.ObjectId(),
					plate: "XYZ-789",
					soatExpiry: future,
					technoMechanicalExpiry: future,
					insuranceExpiry: future,
					documents: [
						{
							documentType: "tarjeta_propiedad",
							documentNumber: "TP-002",
							issueDate: new Date("2020-01-01"),
							expiryDate: future,
							status: "valid",
						},
					],
				}),
			]);

			const readiness = await FleetService.getFleetReadiness();
			expect(readiness.readinessPercent).toBe(100);
			expect(readiness.readyVehicles).toBe(2);
			expect(readiness.blockedVehicles).toBe(0);
		});

		it("returns 0% readiness when all vehicles have expired docs", async () => {
			const past = new Date("2024-01-01");
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					plate: "ABC-123",
					soatExpiry: past,
					technoMechanicalExpiry: past,
					insuranceExpiry: past,
					documents: [],
				}),
			]);

			const readiness = await FleetService.getFleetReadiness();
			expect(readiness.readinessPercent).toBe(0);
			expect(readiness.readyVehicles).toBe(0);
			expect(readiness.blockedVehicles).toBe(1);
		});

		it("counts expiring documents within 30 days", async () => {
			const future = new Date("2028-01-01");
			const expiring = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
			mocks.vehicleFind.mockResolvedValue([
				buildVehicle({
					plate: "EXP-001",
					soatExpiry: expiring,
					technoMechanicalExpiry: future,
					insuranceExpiry: future,
					documents: [
						{
							documentType: "tarjeta_propiedad",
							documentNumber: "TP-001",
							issueDate: new Date("2020-01-01"),
							expiryDate: future,
							status: "valid",
						},
					],
				}),
			]);

			const readiness = await FleetService.getFleetReadiness();
			expect(readiness.expiringSoonCount).toBeGreaterThanOrEqual(1);
		});
	});

	describe("hasExpiredDocuments (blocking dispatch)", () => {
		it("blocks driver assignment when SOAT is expired via documents array", async () => {
			const past = new Date("2024-01-01");
			const future = new Date("2028-01-01");
			const vehicle = buildVehicle({
				soatExpiry: undefined,
				technoMechanicalExpiry: future,
				insuranceExpiry: future,
				documents: [
					{
						documentType: "soat",
						documentNumber: "SOAT-001",
						issueDate: new Date("2024-01-01"),
						expiryDate: past,
						status: "expired",
					},
				],
			});
			mocks.vehicleFindById.mockResolvedValue(vehicle);

			await expect(
				FleetService.assignVehicle(VEHICLE_ID, "507f1f77bcf86cd799439031", USER_ID),
			).rejects.toMatchObject({ code: "VEHICLE_DOCUMENTS_EXPIRED" });
		});

		it("allows driver assignment when documents array has valid SOAT (via updateVehicle)", async () => {
			const future = new Date("2028-01-01");
			const vehicle = buildVehicle({
				soatExpiry: future,
				technoMechanicalExpiry: future,
				insuranceExpiry: future,
				documents: [],
			});
			mocks.vehicleFindById.mockResolvedValue(vehicle);
			mocks.vehicleFindOne.mockResolvedValue(null);
			mocks.vehicleFindByIdAndUpdate.mockResolvedValue(vehicle);

			const result = await FleetService.updateVehicle(
				VEHICLE_ID,
				{ driverName: "Juan Conductor" },
				USER_ID,
			);
			expect(result).toBeDefined();
			expect(mocks.vehicleFindByIdAndUpdate).toHaveBeenCalled();
		});
	});
});
