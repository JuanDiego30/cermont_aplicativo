/**
 * Fleet Service — Tarea 5.4
 *
 * Parque automotor con documentos obligatorios (SOAT, tecnomecánica,
 * póliza) y alertas de vencimiento. Un vehículo con documentos vencidos
 * no puede asignarse a conductor.
 */

import type {
	CreateVehicleInput,
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
	vehicle: Pick<VehicleRecord, "soatExpiry" | "technoMechanicalExpiry">,
) {
	const now = new Date();
	return (
		(vehicle.soatExpiry && vehicle.soatExpiry < now) ||
		(vehicle.technoMechanicalExpiry && vehicle.technoMechanicalExpiry < now)
	);
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
 * SOAT/tecnomecánica/póliza expiring within N days (default 30).
 */
export async function getExpiringDocuments(daysAhead = 30): Promise<VehicleDocumentAlert[]> {
	const now = new Date();
	const limitDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

	const vehicles = await VehicleModel.find({
		$or: [
			{ soatExpiry: { $lte: limitDate } },
			{ technoMechanicalExpiry: { $lte: limitDate } },
			{ insuranceExpiry: { $lte: limitDate } },
		],
	});

	const alerts: VehicleDocumentAlert[] = [];
	for (const vehicle of vehicles) {
		const documents = [
			{ documentType: "soat" as const, expiresAt: vehicle.soatExpiry },
			{ documentType: "tecnomecanica" as const, expiresAt: vehicle.technoMechanicalExpiry },
			{ documentType: "poliza" as const, expiresAt: vehicle.insuranceExpiry },
		];
		for (const doc of documents) {
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
	}
	return alerts.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
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
