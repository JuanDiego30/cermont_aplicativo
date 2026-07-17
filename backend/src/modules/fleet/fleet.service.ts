/**
 * Fleet Service — Tarea 5.4
 *
 * Parque automotor con documentos obligatorios (SOAT, tecnomecánica,
 * póliza) y alertas de vencimiento. Un vehículo con documentos vencidos
 * no puede asignarse a conductor.
 */

import type {
	AddVehicleDocumentInput,
	CreateVehicleInput,
	FleetReadiness,
	ListVehiclesQuery,
	UpdateVehicleInput,
	VehicleDocumentAlert,
	VehiclePhoto,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { VehicleModel, type VehicleRecord } from "../../models/Vehicle";
import { type IVehicleAssignmentDocument, VehicleAssignment } from "../../models/VehicleAssignment";
import { createAuditLog } from "../audit/audit.service";
import {
	createFileAssetFromUpload,
	getFileAssetById,
	listFileAssetsByEntity,
	softDeleteFileAsset,
} from "../files/files.service";

interface VehiclePhotoSource {
	id: string;
	url: string;
	originalName: string;
	description?: string;
	uploadedAt: Date | string;
}

function toVehiclePhoto(
	file: VehiclePhotoSource,
	primaryPhoto: VehicleRecord["primaryPhoto"],
): VehiclePhoto {
	return {
		id: file.id,
		url: file.url,
		title: file.description?.trim() || file.originalName,
		isPrimary: primaryPhoto.status === "present" && primaryPhoto.fileAssetId === file.id,
		uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt.toISOString() : file.uploadedAt,
	};
}

function assertVehiclePhoto(
	file: { entityType: string; entityId: { toString(): string }; category: string },
	vehicleId: string,
): void {
	if (
		file.entityType !== "vehicle" ||
		file.category !== "vehicle_image" ||
		file.entityId.toString() !== vehicleId
	) {
		throw new AppError(
			"La foto no pertenece al vehículo solicitado",
			404,
			"VEHICLE_PHOTO_NOT_FOUND",
		);
	}
}

function toDates(input: Partial<CreateVehicleInput>) {
	return {
		...(input.soatExpiry ? { soatExpiry: new Date(input.soatExpiry) } : {}),
		...(input.technoMechanicalExpiry
			? { technoMechanicalExpiry: new Date(input.technoMechanicalExpiry) }
			: {}),
		...(input.insuranceExpiry ? { insuranceExpiry: new Date(input.insuranceExpiry) } : {}),
		...(input.lastMaintenanceAt ? { lastMaintenanceAt: new Date(input.lastMaintenanceAt) } : {}),
	};
}

function hasExpiredDocuments(
	vehicle: Pick<VehicleRecord, "soatExpiry" | "technoMechanicalExpiry" | "documents">,
) {
	const now = new Date();
	const expiredFromFlat =
		(vehicle.soatExpiry && vehicle.soatExpiry < now) ||
		(vehicle.technoMechanicalExpiry && vehicle.technoMechanicalExpiry < now);
	if (expiredFromFlat) {
		return true;
	}
	const mandatoryTypes = new Set(["soat", "tecnomecanica"]);
	for (const doc of vehicle.documents ?? []) {
		if (mandatoryTypes.has(doc.documentType)) {
			const expiry = doc.expiryDate instanceof Date ? doc.expiryDate : new Date(doc.expiryDate);
			if (expiry < now || doc.status === "expired") {
				return true;
			}
		}
	}
	return false;
}

function computeDocumentExpiryStatus(
	expiryDate: Date | null | undefined,
): "valid" | "expiring" | "expired" | "missing" {
	if (!expiryDate) {
		return "missing";
	}
	const now = new Date();
	if (expiryDate < now) {
		return "expired";
	}
	const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
	if (daysUntilExpiry <= 30) {
		return "expiring";
	}
	return "valid";
}

export async function createVehicle(input: CreateVehicleInput, userId: string) {
	const plate = input.plate.toUpperCase();
	const existing = await VehicleModel.findOne({ plate });
	if (existing) {
		throw new AppError("Ya existe un vehículo con esa placa", 409, "VEHICLE_PLATE_ALREADY_EXISTS");
	}
	return VehicleModel.create({
		...input,
		...toDates(input),
		plate,
		createdBy: userId,
	});
}

export async function listVehicles(query: ListVehiclesQuery) {
	const { page, limit, status, type } = query;
	const filter: Record<string, unknown> = {};
	if (status) {
		filter.status = status;
	}
	if (type) {
		filter.type = type;
	}

	const [vehicles, total] = await Promise.all([
		VehicleModel.find(filter)
			.sort({ plate: 1 })
			.skip((page - 1) * limit)
			.limit(limit),
		VehicleModel.countDocuments(filter),
	]);

	return {
		data: vehicles,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}

export async function getVehicleById(id: string) {
	const vehicle = await VehicleModel.findById(id);
	if (!vehicle) {
		throw new AppError("Vehículo no encontrado", 404, "VEHICLE_NOT_FOUND");
	}
	return vehicle;
}

export async function updateVehicle(id: string, input: UpdateVehicleInput, userId: string) {
	const vehicle = await getVehicleById(id);

	if (input.driverName || input.driverId) {
		if (hasExpiredDocuments({ ...vehicle.toObject(), ...toDates(input) })) {
			throw new AppError(
				"No se puede asignar conductor a un vehículo con SOAT o tecnomecánica vencidos",
				409,
				"VEHICLE_DOCUMENTS_EXPIRED",
			);
		}
	}

	if (input.plate) {
		const duplicate = await VehicleModel.findOne({
			plate: input.plate.toUpperCase(),
			_id: { $ne: id },
		});
		if (duplicate) {
			throw new AppError(
				"Ya existe un vehículo con esa placa",
				409,
				"VEHICLE_PLATE_ALREADY_EXISTS",
			);
		}
	}

	const updated = await VehicleModel.findByIdAndUpdate(
		id,
		{
			...input,
			...toDates(input),
			...(input.plate ? { plate: input.plate.toUpperCase() } : {}),
			updatedBy: userId,
		},
		{ returnDocument: "after", runValidators: true },
	);
	if (!updated) {
		throw new AppError("Vehículo no encontrado", 404, "VEHICLE_NOT_FOUND");
	}
	return updated;
}

/**
 * SOAT/tecnomecánica/póliza/tarjeta_propiedad expiring within N days (default 30).
 * Checks both legacy flat fields and new documents array.
 */
export async function getExpiringDocuments(daysAhead = 30): Promise<VehicleDocumentAlert[]> {
	const now = new Date();
	const limitDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

	const vehicles = await VehicleModel.find({
		$or: [
			{ soatExpiry: { $lte: limitDate } },
			{ technoMechanicalExpiry: { $lte: limitDate } },
			{ insuranceExpiry: { $lte: limitDate } },
			{ "documents.expiryDate": { $lte: limitDate } },
		],
	});

	const alerts: VehicleDocumentAlert[] = [];
	for (const vehicle of vehicles) {
		alerts.push(...collectVehicleExpiringDocs(vehicle, now, limitDate));
	}
	return alerts.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}

function collectVehicleExpiringDocs(
	vehicle: VehicleRecord & { _id: { toString(): string } },
	now: Date,
	limitDate: Date,
): VehicleDocumentAlert[] {
	const alerts: VehicleDocumentAlert[] = [];

	const flatDocs: Array<{
		documentType: "soat" | "tecnomecanica" | "poliza";
		expiresAt: Date | undefined;
	}> = [
		{ documentType: "soat", expiresAt: vehicle.soatExpiry },
		{ documentType: "tecnomecanica", expiresAt: vehicle.technoMechanicalExpiry },
		{ documentType: "poliza", expiresAt: vehicle.insuranceExpiry },
	];
	for (const doc of flatDocs) {
		if (doc.expiresAt && doc.expiresAt <= limitDate) {
			const daysUntilExpiry = Math.ceil(
				(doc.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
			);
			alerts.push({
				vehicleId: vehicle._id.toString(),
				plate: vehicle.plate,
				documentType: doc.documentType,
				expiresAt: doc.expiresAt.toISOString(),
				daysUntilExpiry,
				expired: doc.expiresAt < now,
			});
		}
	}

	for (const doc of vehicle.documents ?? []) {
		const expiry = doc.expiryDate instanceof Date ? doc.expiryDate : new Date(doc.expiryDate);
		if (expiry <= limitDate) {
			const daysUntilExpiry = Math.ceil(
				(expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
			);
			alerts.push({
				vehicleId: vehicle._id.toString(),
				plate: vehicle.plate,
				documentType: doc.documentType as VehicleDocumentAlert["documentType"],
				expiresAt: expiry.toISOString(),
				daysUntilExpiry,
				expired: expiry < now,
			});
		}
	}

	return alerts;
}

/**
 * Returns vehicles with expired or missing mandatory documents (SOAT, tecnomecanica).
 * These vehicles cannot be dispatched.
 */
export async function getBlockerDocuments(): Promise<
	Array<{
		vehicleId: string;
		plate: string;
		blockers: string[];
		ready: boolean;
	}>
> {
	const vehicles = await VehicleModel.find();
	const result: Array<{
		vehicleId: string;
		plate: string;
		blockers: string[];
		ready: boolean;
	}> = [];

	for (const vehicle of vehicles) {
		const blockers: string[] = [];

		checkSoatBlocker(vehicle, blockers);
		checkTechnoBlocker(vehicle, blockers);
		checkInsuranceBlocker(vehicle, blockers);
		checkPropertyCardBlocker(vehicle, blockers);

		result.push({
			vehicleId: vehicle._id.toString(),
			plate: vehicle.plate,
			blockers,
			ready: blockers.length === 0,
		});
	}
	return result;
}

function checkSoatBlocker(vehicle: VehicleRecord, blockers: string[]): void {
	const now = new Date();
	const soatExpired =
		(vehicle.soatExpiry && vehicle.soatExpiry < now) ||
		vehicle.documents?.some(
			(d) =>
				d.documentType === "soat" && (new Date(d.expiryDate) < now || d.status === "expired"),
		);
	const soatMissing =
		!vehicle.soatExpiry && !vehicle.documents?.some((d) => d.documentType === "soat");
	if (soatExpired) {
		blockers.push("SOAT vencido");
	} else if (soatMissing) {
		blockers.push("SOAT sin registrar");
	}
}

function checkTechnoBlocker(vehicle: VehicleRecord, blockers: string[]): void {
	const now = new Date();
	const technoExpired =
		(vehicle.technoMechanicalExpiry && vehicle.technoMechanicalExpiry < now) ||
		vehicle.documents?.some(
			(d) =>
				d.documentType === "tecnomecanica" &&
				(new Date(d.expiryDate) < now || d.status === "expired"),
		);
	const technoMissing =
		!vehicle.technoMechanicalExpiry &&
		!vehicle.documents?.some((d) => d.documentType === "tecnomecanica");
	if (technoExpired) {
		blockers.push("Tecnomecánica vencida");
	} else if (technoMissing) {
		blockers.push("Tecnomecánica sin registrar");
	}
}

function checkInsuranceBlocker(vehicle: VehicleRecord, blockers: string[]): void {
	const now = new Date();
	const insuranceExpired =
		(vehicle.insuranceExpiry && vehicle.insuranceExpiry < now) ||
		vehicle.documents?.some(
			(d) =>
				d.documentType === "poliza" && (new Date(d.expiryDate) < now || d.status === "expired"),
		);
	const insuranceMissing =
		!vehicle.insuranceExpiry && !vehicle.documents?.some((d) => d.documentType === "poliza");
	if (insuranceExpired) {
		blockers.push("Póliza vencida");
	} else if (insuranceMissing) {
		blockers.push("Póliza sin registrar");
	}
}

function checkPropertyCardBlocker(vehicle: VehicleRecord, blockers: string[]): void {
	const propertyCardMissing = !vehicle.documents?.some(
		(d) => d.documentType === "tarjeta_propiedad",
	);
	if (propertyCardMissing) {
		blockers.push("Tarjeta de propiedad sin registrar");
	}
}

/**
 * Fleet-wide readiness percentage — ratio of vehicles with all mandatory docs valid.
 */
export async function getFleetReadiness(): Promise<FleetReadiness> {
	const vehicles = await VehicleModel.find();
	const now = new Date();
	let readyCount = 0;
	let expiringSoonCount = 0;
	let expiredCount = 0;
	let missingDocumentCount = 0;

	for (const vehicle of vehicles) {
		const stats = computeVehicleReadinessStats(vehicle, now);
		readyCount += stats.ready ? 1 : 0;
		expiringSoonCount += stats.expiringSoon;
		expiredCount += stats.expired;
		missingDocumentCount += stats.missing;
	}

	const total = vehicles.length;
	return {
		totalVehicles: total,
		readyVehicles: readyCount,
		blockedVehicles: total - readyCount,
		readinessPercent: total > 0 ? Math.round((readyCount / total) * 100) : 100,
		expiringSoonCount,
		expiredCount,
		missingDocumentCount,
	};
}

function computeVehicleReadinessStats(
	vehicle: VehicleRecord,
	now: Date,
): { ready: boolean; expiringSoon: number; expired: number; missing: number } {
	const docs: Array<{ type: "soat" | "tecnomecanica" | "poliza"; expiry: Date | undefined | null }> = [
		{ type: "soat", expiry: vehicle.soatExpiry },
		{ type: "tecnomecanica", expiry: vehicle.technoMechanicalExpiry },
		{ type: "poliza", expiry: vehicle.insuranceExpiry },
	];
	mergeVehicleArrayDocs(vehicle, docs);

	const hasTarjetaPropiedad = vehicle.documents?.some(
		(d) => d.documentType === "tarjeta_propiedad",
	);

	let expiringSoon = 0;
	let expired = 0;
	let missing = 0;
	let vehicleReady = true;

	for (const doc of docs) {
		if (!doc.expiry) {
			missing++;
			vehicleReady = false;
		} else if (doc.expiry < now) {
			expired++;
			vehicleReady = false;
		} else {
			const daysLeft = Math.ceil((doc.expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
			if (daysLeft <= 30) {
				expiringSoon++;
			}
		}
	}
	if (!hasTarjetaPropiedad) {
		missing++;
		vehicleReady = false;
	}

	return { ready: vehicleReady, expiringSoon, expired, missing };
}

function mergeVehicleArrayDocs(
	vehicle: VehicleRecord,
	docs: Array<{ type: "soat" | "tecnomecanica" | "poliza"; expiry: Date | undefined | null }>,
): void {
	for (const doc of vehicle.documents ?? []) {
		const idx = docs.findIndex((d) => d.type === doc.documentType);
		const expiry = doc.expiryDate instanceof Date ? doc.expiryDate : new Date(doc.expiryDate);
		if (idx >= 0) {
			docs[idx] = { type: doc.documentType as "soat" | "tecnomecanica" | "poliza", expiry };
		} else {
			docs.push({ type: doc.documentType as "soat" | "tecnomecanica" | "poliza", expiry });
		}
	}
}

/**
 * Add a structured document to a vehicle's documents array.
 * Also updates the corresponding flat expiry field for backward compat.
 */
export async function addVehicleDocument(
	vehicleId: string,
	input: AddVehicleDocumentInput,
): Promise<VehicleRecord> {
	const _vehicle = await getVehicleById(vehicleId);

	const status = computeDocumentExpiryStatus(new Date(input.expiryDate));
	const doc = {
		documentType: input.documentType,
		documentNumber: input.documentNumber,
		issueDate: input.issueDate,
		expiryDate: input.expiryDate,
		status,
		...(input.fileUrl ? { fileUrl: input.fileUrl } : {}),
	};

	const update: Record<string, unknown> = {
		$push: { documents: doc },
	};

	if (input.documentType === "soat") {
		update.$set = {
			...(update.$set as Record<string, unknown>),
			soatExpiry: new Date(input.expiryDate),
		};
	} else if (input.documentType === "tecnomecanica") {
		update.$set = {
			...(update.$set as Record<string, unknown>),
			technoMechanicalExpiry: new Date(input.expiryDate),
		};
	} else if (input.documentType === "poliza") {
		update.$set = {
			...(update.$set as Record<string, unknown>),
			insuranceExpiry: new Date(input.expiryDate),
		};
	}

	const updated = await VehicleModel.findByIdAndUpdate(vehicleId, update, {
		returnDocument: "after",
		runValidators: true,
	});
	if (!updated) {
		throw new AppError("Vehículo no encontrado", 404, "VEHICLE_NOT_FOUND");
	}
	return updated;
}

export async function listVehiclePhotos(vehicleId: string): Promise<VehiclePhoto[]> {
	const vehicle = await getVehicleById(vehicleId);
	const photos = await listFileAssetsByEntity({
		entityType: "vehicle",
		entityId: vehicleId,
		category: "vehicle_image",
	});

	return photos.map((photo) => toVehiclePhoto(photo, vehicle.primaryPhoto));
}

export async function uploadVehiclePhoto(
	vehicleId: string,
	file: Express.Multer.File,
	title: string,
	userId: string,
	userEmail: string,
): Promise<VehiclePhoto> {
	const vehicle = await getVehicleById(vehicleId);
	const result = await createFileAssetFromUpload(
		{
			entityType: "vehicle",
			entityId: vehicleId,
			category: "vehicle_image",
			description: title,
		},
		file,
		userId,
		userEmail,
	);

	const shouldBecomePrimary = vehicle.primaryPhoto.status === "absent";
	const primaryPhoto = shouldBecomePrimary
		? ({ status: "present", fileAssetId: result.ref.id } as const)
		: vehicle.primaryPhoto;

	if (shouldBecomePrimary) {
		await VehicleModel.updateOne({ _id: vehicleId }, { $set: { primaryPhoto, updatedBy: userId } });
		await createAuditLog({
			action: "ASSET_PRIMARY_PHOTO_CHANGED",
			entity: "Vehicle",
			entityId: vehicleId,
			userId,
			metadata: { fileAssetId: result.ref.id, reason: "first_photo_uploaded" },
		});
	}

	return toVehiclePhoto(result.ref, primaryPhoto);
}

export async function setPrimaryVehiclePhoto(
	vehicleId: string,
	photoId: string,
	userId: string,
): Promise<VehiclePhoto> {
	await getVehicleById(vehicleId);
	const photo = await getFileAssetById(photoId);
	assertVehiclePhoto(photo, vehicleId);

	const primaryPhoto = { status: "present", fileAssetId: photo.id } as const;
	await VehicleModel.updateOne({ _id: vehicleId }, { $set: { primaryPhoto, updatedBy: userId } });
	await createAuditLog({
		action: "ASSET_PRIMARY_PHOTO_CHANGED",
		entity: "Vehicle",
		entityId: vehicleId,
		userId,
		metadata: { fileAssetId: photo.id },
	});

	return toVehiclePhoto(photo, primaryPhoto);
}

export interface CheckinInput {
	driverId: string;
	driverName: string;
	orderId?: string;
	notes?: string;
}

export interface AssignmentEntry {
	driverId: string;
	driverName: string;
	checkedInAt: string;
	checkedOutAt?: string;
	orderId?: string;
	notes?: string;
}

export async function deleteVehiclePhoto(
	vehicleId: string,
	photoId: string,
	userId: string,
): Promise<void> {
	const vehicle = await getVehicleById(vehicleId);
	const photo = await getFileAssetById(photoId);
	assertVehiclePhoto(photo, vehicleId);

	await softDeleteFileAsset(photoId, userId);

	if (vehicle.primaryPhoto.status === "present" && vehicle.primaryPhoto.fileAssetId === photoId) {
		const remaining = await listFileAssetsByEntity({
			entityType: "vehicle",
			entityId: vehicleId,
			category: "vehicle_image",
		});
		const nextPrimary = remaining[0]
			? ({ status: "present", fileAssetId: remaining[0].id } as const)
			: ({ status: "absent" } as const);
		await VehicleModel.updateOne(
			{ _id: vehicleId },
			{ $set: { primaryPhoto: nextPrimary, updatedBy: userId } },
		);
		await createAuditLog({
			action: "ASSET_PRIMARY_PHOTO_CHANGED",
			entity: "Vehicle",
			entityId: vehicleId,
			userId,
			metadata: {
				fileAssetId: nextPrimary.status === "present" ? nextPrimary.fileAssetId : "absent",
				reason: "primary_photo_deleted",
			},
		});
	}
}

export async function assignVehicle(
	vehicleId: string,
	driverId: string,
	assignedBy: string,
): Promise<IVehicleAssignmentDocument> {
	const vehicle = await getVehicleById(vehicleId);
	if (hasExpiredDocuments(vehicle)) {
		throw new AppError(
			"No se puede asignar conductor a un vehículo con SOAT o tecnomecánica vencidos",
			409,
			"VEHICLE_DOCUMENTS_EXPIRED",
		);
	}

	// Terminate any active assignment for this vehicle first
	await VehicleAssignment.updateMany(
		{ vehicleId, status: { $in: ["pending", "active"] } },
		{ $set: { status: "completed", endedAt: new Date() } },
	);

	const { User } = require("../../models/User");
	const user = await User.findById(driverId).lean();
	const driverName = user ? user.name : "Conductor";

	await VehicleModel.updateOne({ _id: vehicleId }, { $set: { driverId, driverName } });

	const assignment = await VehicleAssignment.create({
		vehicleId,
		driverId,
		driverName,
		assignedBy,
		assignedAt: new Date(),
		status: "pending",
	});

	await createAuditLog({
		action: "VEHICLE_ASSIGNED",
		entity: "Vehicle",
		entityId: vehicleId,
		userId: assignedBy,
		metadata: { driverId, driverName, assignmentId: assignment._id.toString() },
	});

	return assignment;
}

export async function checkoutVehicle(
	assignmentId: string,
	checkoutData: { mileage: number; fuelLevel: number; photos: string[]; notes?: string },
	userId: string,
): Promise<IVehicleAssignmentDocument> {
	const assignment = await VehicleAssignment.findById(assignmentId);
	if (!assignment) {
		throw new AppError("Asignación no encontrada", 404, "ASSIGNMENT_NOT_FOUND");
	}
	if (assignment.status !== "pending") {
		throw new AppError(
			"El vehículo ya ha sido retirado o la asignación no está pendiente",
			400,
			"ASSIGNMENT_NOT_PENDING",
		);
	}

	const vehicle = await VehicleModel.findById(assignment.vehicleId);
	if (!vehicle) {
		throw new AppError("Vehículo no encontrado", 404, "VEHICLE_NOT_FOUND");
	}

	if (checkoutData.mileage < vehicle.kilometers) {
		throw new AppError(
			`El kilometraje de salida (${checkoutData.mileage}) no puede ser menor al kilometraje actual del vehículo (${vehicle.kilometers})`,
			400,
			"INVALID_MILEAGE",
		);
	}

	assignment.status = "active";
	assignment.startedAt = new Date();
	assignment.checkout = checkoutData;
	await assignment.save();

	vehicle.status = "active";
	vehicle.kilometers = checkoutData.mileage;
	await vehicle.save();

	await createAuditLog({
		action: "VEHICLE_CHECKED_OUT",
		entity: "Vehicle",
		entityId: vehicle._id.toString(),
		userId,
		metadata: { assignmentId, mileage: checkoutData.mileage },
	});

	return assignment;
}

export async function checkinVehicle(
	assignmentId: string,
	checkinData: { mileage: number; fuelLevel: number; photos: string[]; notes?: string },
	userId: string,
): Promise<IVehicleAssignmentDocument> {
	const assignment = await VehicleAssignment.findById(assignmentId);
	if (!assignment) {
		throw new AppError("Asignación no encontrada", 404, "ASSIGNMENT_NOT_FOUND");
	}
	if (assignment.status !== "active") {
		throw new AppError(
			"El vehículo no está en estado activo / retirado",
			400,
			"ASSIGNMENT_NOT_ACTIVE",
		);
	}

	const checkoutMileage = assignment.checkout?.mileage ?? 0;
	if (checkinData.mileage < checkoutMileage) {
		throw new AppError(
			`El kilometraje de entrada (${checkinData.mileage}) no puede ser menor al kilometraje de salida (${checkoutMileage})`,
			400,
			"INVALID_MILEAGE",
		);
	}

	assignment.status = "completed";
	assignment.endedAt = new Date();
	assignment.checkin = checkinData;
	await assignment.save();

	const vehicle = await VehicleModel.findById(assignment.vehicleId);
	if (vehicle) {
		vehicle.kilometers = checkinData.mileage;
		vehicle.driverId = undefined;
		vehicle.driverName = undefined;
		await vehicle.save();
	}

	await createAuditLog({
		action: "VEHICLE_CHECKED_IN",
		entity: "Vehicle",
		entityId: assignment.vehicleId.toString(),
		userId,
		metadata: { assignmentId, mileage: checkinData.mileage },
	});

	return assignment;
}

export async function getVehicleAssignmentHistory(
	vehicleId: string,
): Promise<IVehicleAssignmentDocument[]> {
	return VehicleAssignment.find({ vehicleId })
		.sort({ assignedAt: -1 })
		.populate("driverId", "name email")
		.populate("assignedBy", "name email");
}

export async function getActiveAssignment(
	vehicleId: string,
): Promise<IVehicleAssignmentDocument | null> {
	return VehicleAssignment.findOne({ vehicleId, status: { $in: ["pending", "active"] } })
		.populate("driverId", "name email")
		.populate("assignedBy", "name email");
}

interface DocumentStatus {
	registered: boolean;
	expiryDate: string | null;
	expired: boolean;
	daysUntilExpiry: number | null;
}

interface VehicleDocumentStatus {
	vehicleId: string;
	plate: string;
	documents: {
		soat: DocumentStatus;
		tecnomecanica: DocumentStatus;
		poliza: DocumentStatus;
	};
	allDocumentsValid: boolean;
	missingDocuments: string[];
}

export async function validarDocumentosVehiculo(vehicleId: string): Promise<VehicleDocumentStatus> {
	const vehicle = await getVehicleById(vehicleId);

	const soat = resolveDocumentStatus(vehicle, "soat");
	const tecnomecanica = resolveDocumentStatus(vehicle, "tecnomecanica");
	const poliza = resolveDocumentStatus(vehicle, "poliza");
	const tarjetaPropiedad = resolveDocumentStatus(vehicle, "tarjeta_propiedad");

	const missingDocuments: string[] = [];
	if (!soat.registered) { missingDocuments.push("SOAT"); }
	if (!tecnomecanica.registered) { missingDocuments.push("Tecnomecánica"); }
	if (!poliza.registered) { missingDocuments.push("Póliza"); }
	if (!tarjetaPropiedad.registered) { missingDocuments.push("Tarjeta de propiedad"); }

	const allDocumentsValid =
		soat.registered && !soat.expired &&
		tecnomecanica.registered && !tecnomecanica.expired &&
		poliza.registered && !poliza.expired &&
		tarjetaPropiedad.registered && !tarjetaPropiedad.expired;

	return {
		vehicleId: vehicle._id.toString(),
		plate: vehicle.plate,
		documents: { soat, tecnomecanica, poliza },
		allDocumentsValid,
		missingDocuments,
	};
}

function buildDocumentStatus(expiryDate: Date | null | undefined): DocumentStatus {
	if (!expiryDate) {
		return { registered: false, expiryDate: null, expired: false, daysUntilExpiry: null };
	}
	const now = new Date();
	const expired = expiryDate < now;
	const daysUntilExpiry = Math.ceil(
		(expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
	);
	return {
		registered: true,
		expiryDate: expiryDate.toISOString(),
		expired,
		daysUntilExpiry,
	};
}

function resolveDocumentStatus(
	vehicle: VehicleRecord,
	docType: "soat" | "tecnomecanica" | "poliza" | "tarjeta_propiedad",
): DocumentStatus {
	const fromDocs = vehicle.documents?.find((d) => d.documentType === docType);
	if (fromDocs) {
		const expiry = fromDocs.expiryDate instanceof Date
			? fromDocs.expiryDate
			: new Date(fromDocs.expiryDate);
		return buildDocumentStatus(expiry);
	}

	const flatExpiry = getFlatDocExpiry(vehicle, docType);
	return buildDocumentStatus(flatExpiry);
}

function getFlatDocExpiry(
	vehicle: VehicleRecord,
	docType: "soat" | "tecnomecanica" | "poliza" | "tarjeta_propiedad",
): Date | null | undefined {
	switch (docType) {
		case "soat": return vehicle.soatExpiry;
		case "tecnomecanica": return vehicle.technoMechanicalExpiry;
		case "poliza": return vehicle.insuranceExpiry;
		default: return null;
	}
}
