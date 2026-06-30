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
