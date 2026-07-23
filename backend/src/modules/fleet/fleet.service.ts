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

function calcularStatusPorDocumentos(
	vehicle: Pick<
		VehicleRecord,
		"soatExpiry" | "technoMechanicalExpiry" | "insuranceExpiry" | "documents"
	>,
): "blocked" | "active" {
	const now = new Date();

	const docExpiry = (flat: Date | null | undefined, docType: string): Date | null => {
		const fromArray = vehicle.documents?.find((d) => d.documentType === docType);
		if (fromArray) {
			return fromArray.expiryDate instanceof Date
				? fromArray.expiryDate
				: new Date(fromArray.expiryDate);
		}
		return flat ?? null;
	};

	const soat = docExpiry(vehicle.soatExpiry, "soat");
	const techno = docExpiry(vehicle.technoMechanicalExpiry, "tecnomecanica");
	const insurance = docExpiry(vehicle.insuranceExpiry, "poliza");

	if (!soat || soat < now) {
		return "blocked";
	}
	if (!techno || techno < now) {
		return "blocked";
	}
	if (!insurance || insurance < now) {
		return "blocked";
	}

	return "active";
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

	const data = vehicles.map((v) => ({
		...v.toObject(),
		documentStatus: calcularStatusPorDocumentos(v),
	}));

	return {
		data,
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

function buildFlatDocAlert(
	vehicle: VehicleRecord & { _id: { toString(): string } },
	doc: { documentType: "soat" | "tecnomecanica" | "poliza"; expiresAt: Date | undefined },
	limitDate: Date,
	now: Date,
): VehicleDocumentAlert | null {
	if (!doc.expiresAt || doc.expiresAt > limitDate) {
		return null;
	}
	const daysUntilExpiry = Math.ceil(
		(doc.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
	);
	return {
		vehicleId: vehicle._id.toString(),
		plate: vehicle.plate,
		documentType: doc.documentType,
		expiresAt: doc.expiresAt.toISOString(),
		daysUntilExpiry,
		expired: doc.expiresAt < now,
	};
}

function buildArrayDocAlert(
	vehicle: VehicleRecord & { _id: { toString(): string } },
	doc: VehicleRecord["documents"][number],
	limitDate: Date,
	now: Date,
): VehicleDocumentAlert | null {
	const expiry = doc.expiryDate instanceof Date ? doc.expiryDate : new Date(doc.expiryDate);
	if (expiry > limitDate) {
		return null;
	}
	const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
	return {
		vehicleId: vehicle._id.toString(),
		plate: vehicle.plate,
		documentType: doc.documentType as VehicleDocumentAlert["documentType"],
		expiresAt: expiry.toISOString(),
		daysUntilExpiry,
		expired: expiry < now,
	};
}

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
		const flatDocs = [
			{ documentType: "soat" as const, expiresAt: vehicle.soatExpiry },
			{ documentType: "tecnomecanica" as const, expiresAt: vehicle.technoMechanicalExpiry },
			{ documentType: "poliza" as const, expiresAt: vehicle.insuranceExpiry },
		];
		for (const doc of flatDocs) {
			const alert = buildFlatDocAlert(vehicle, doc, limitDate, now);
			if (alert) {
				alerts.push(alert);
			}
		}
		for (const doc of vehicle.documents ?? []) {
			const alert = buildArrayDocAlert(vehicle, doc, limitDate, now);
			if (alert) {
				alerts.push(alert);
			}
		}
	}
	return alerts.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}

/**
 * Returns vehicles with expired or missing mandatory documents (SOAT, tecnomecanica).
 * These vehicles cannot be dispatched.
 */
function checkDocumentBlocker(
	vehicle: VehicleRecord,
	docType: "soat" | "tecnomecanica" | "poliza",
	flatExpiry: Date | null | undefined,
	now: Date,
	expiredLabel: string,
	missingLabel: string,
): string | null {
	const fromArray = vehicle.documents?.find((d) => d.documentType === docType);
	const isExpired =
		(flatExpiry && flatExpiry < now) ||
		(fromArray && (new Date(fromArray.expiryDate) < now || fromArray.status === "expired"));
	const isMissing = !flatExpiry && !vehicle.documents?.some((d) => d.documentType === docType);
	if (isExpired) {
		return expiredLabel;
	}
	if (isMissing) {
		return missingLabel;
	}
	return null;
}

function evaluateVehicleBlockers(
	vehicle: VehicleRecord & { _id: { toString(): string } },
	now: Date,
): string[] {
	const blockers: string[] = [];
	const soatBlocker = checkDocumentBlocker(
		vehicle,
		"soat",
		vehicle.soatExpiry,
		now,
		"SOAT vencido",
		"SOAT sin registrar",
	);
	if (soatBlocker) {
		blockers.push(soatBlocker);
	}
	const technoBlocker = checkDocumentBlocker(
		vehicle,
		"tecnomecanica",
		vehicle.technoMechanicalExpiry,
		now,
		"Tecnomecánica vencida",
		"Tecnomecánica sin registrar",
	);
	if (technoBlocker) {
		blockers.push(technoBlocker);
	}
	const insuranceBlocker = checkDocumentBlocker(
		vehicle,
		"poliza",
		vehicle.insuranceExpiry,
		now,
		"Póliza vencida",
		"Póliza sin registrar",
	);
	if (insuranceBlocker) {
		blockers.push(insuranceBlocker);
	}
	if (!vehicle.documents?.some((d) => d.documentType === "tarjeta_propiedad")) {
		blockers.push("Tarjeta de propiedad sin registrar");
	}
	return blockers;
}

export async function getBlockerDocuments(): Promise<
	Array<{
		vehicleId: string;
		plate: string;
		blockers: string[];
		ready: boolean;
	}>
> {
	const vehicles = await VehicleModel.find();
	const now = new Date();
	const result = vehicles.map((vehicle) => {
		const blockers = evaluateVehicleBlockers(vehicle, now);
		return {
			vehicleId: vehicle._id.toString(),
			plate: vehicle.plate,
			blockers,
			ready: blockers.length === 0,
		};
	});
	return result;
}

/**
 * Fleet-wide readiness percentage — ratio of vehicles with all mandatory docs valid.
 */
function mergeVehicleDocs(
	vehicle: VehicleRecord,
): Array<{ type: "soat" | "tecnomecanica" | "poliza"; expiry: Date | null }> {
	const docs: Array<{ type: "soat" | "tecnomecanica" | "poliza"; expiry: Date | null }> = [
		{ type: "soat" as const, expiry: vehicle.soatExpiry ?? null },
		{ type: "tecnomecanica" as const, expiry: vehicle.technoMechanicalExpiry ?? null },
		{ type: "poliza" as const, expiry: vehicle.insuranceExpiry ?? null },
	];
	for (const doc of vehicle.documents ?? []) {
		const idx = docs.findIndex((d) => d.type === doc.documentType);
		const expiry = doc.expiryDate instanceof Date ? doc.expiryDate : new Date(doc.expiryDate);
		if (idx >= 0) {
			docs[idx] = { type: doc.documentType as "soat" | "tecnomecanica" | "poliza", expiry };
		} else {
			docs.push({ type: doc.documentType as "soat" | "tecnomecanica" | "poliza", expiry });
		}
	}
	return docs;
}

function evaluateVehicleReadiness(
	docs: Array<{ type: string; expiry: Date | null }>,
	hasTarjetaPropiedad: boolean,
	now: Date,
): { ready: boolean; expiringSoon: boolean; expired: boolean; missing: boolean } {
	let missing = false;
	let expired = false;
	let expiringSoon = false;
	for (const doc of docs) {
		if (!doc.expiry) {
			missing = true;
		} else if (doc.expiry < now) {
			expired = true;
		} else {
			const daysLeft = Math.ceil((doc.expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
			if (daysLeft <= 30) {
				expiringSoon = true;
			}
		}
	}
	if (!hasTarjetaPropiedad) {
		missing = true;
	}
	return { ready: !missing && !expired, expiringSoon, expired, missing };
}

export async function getFleetReadiness(): Promise<FleetReadiness> {
	const vehicles = await VehicleModel.find();
	const now = new Date();
	let readyCount = 0;
	let expiringSoonCount = 0;
	let expiredCount = 0;
	let missingDocumentCount = 0;

	for (const vehicle of vehicles) {
		const docs = mergeVehicleDocs(vehicle);
		const hasTarjetaPropiedad = vehicle.documents?.some(
			(d) => d.documentType === "tarjeta_propiedad",
		);
		const status = evaluateVehicleReadiness(docs, !!hasTarjetaPropiedad, now);
		if (status.ready) {
			readyCount++;
		}
		if (status.expiringSoon) {
			expiringSoonCount++;
		}
		if (status.expired) {
			expiredCount++;
		}
		if (status.missing) {
			missingDocumentCount++;
		}
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

function buildStatus(expiryDate: Date | null | undefined, now: Date): DocumentStatus {
	if (!expiryDate) {
		return { registered: false, expiryDate: null, expired: false, daysUntilExpiry: null };
	}
	const expired = expiryDate < now;
	const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
	return { registered: true, expiryDate: expiryDate.toISOString(), expired, daysUntilExpiry };
}

function resolveDocExpiry(
	vehicle: VehicleRecord,
	docType: "soat" | "tecnomecanica" | "poliza",
	flatExpiry: Date | null | undefined,
): Date | null {
	const fromDocs = vehicle.documents?.find((d) => d.documentType === docType);
	if (fromDocs) {
		return fromDocs.expiryDate instanceof Date
			? fromDocs.expiryDate
			: new Date(fromDocs.expiryDate);
	}
	return flatExpiry ?? null;
}

export async function validarDocumentosVehiculo(vehicleId: string): Promise<VehicleDocumentStatus> {
	const vehicle = await getVehicleById(vehicleId);
	const now = new Date();

	const tarjetaFromDocs = vehicle.documents?.find((d) => d.documentType === "tarjeta_propiedad");

	const soat = buildStatus(resolveDocExpiry(vehicle, "soat", vehicle.soatExpiry), now);
	const tecnomecanica = buildStatus(
		resolveDocExpiry(vehicle, "tecnomecanica", vehicle.technoMechanicalExpiry),
		now,
	);
	const poliza = buildStatus(resolveDocExpiry(vehicle, "poliza", vehicle.insuranceExpiry), now);
	const tarjetaPropiedad = buildStatus(
		tarjetaFromDocs
			? tarjetaFromDocs.expiryDate instanceof Date
				? tarjetaFromDocs.expiryDate
				: new Date(tarjetaFromDocs.expiryDate)
			: null,
		now,
	);

	const missingDocuments: string[] = [];
	if (!soat.registered) {
		missingDocuments.push("SOAT");
	}
	if (!tecnomecanica.registered) {
		missingDocuments.push("Tecnomecánica");
	}
	if (!poliza.registered) {
		missingDocuments.push("Póliza");
	}
	if (!tarjetaPropiedad.registered) {
		missingDocuments.push("Tarjeta de propiedad");
	}

	const allDocumentsValid =
		soat.registered &&
		!soat.expired &&
		tecnomecanica.registered &&
		!tecnomecanica.expired &&
		poliza.registered &&
		!poliza.expired &&
		tarjetaPropiedad.registered &&
		!tarjetaPropiedad.expired;

	return {
		vehicleId: vehicle._id.toString(),
		plate: vehicle.plate,
		documents: { soat, tecnomecanica, poliza },
		allDocumentsValid,
		missingDocuments,
	};
}
