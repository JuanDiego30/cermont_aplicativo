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
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { VehicleModel, type VehicleRecord } from "../../models/Vehicle";

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
				alerts.push({
					vehicleId: vehicle._id.toString(),
					plate: vehicle.plate,
					documentType: doc.documentType,
					expiresAt: doc.expiresAt.toISOString(),
					expired: doc.expiresAt < now,
				});
			}
		}
	}
	return alerts.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}
