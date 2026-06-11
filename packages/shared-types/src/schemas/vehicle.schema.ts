import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Fleet / Vehicle — Parque automotor con documentos obligatorios colombianos
// (SOAT, tecnomecánica, póliza) y control de mantenimiento por kilometraje.
// ──────────────────────────────────────────────────────────────────────────────

export const VehicleTypeSchema = z.enum(["camioneta", "camion", "moto", "van", "otro"]);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const VehicleStatusSchema = z.enum(["active", "maintenance", "out_of_service"]);
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;

export const VehicleSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		plate: z
			.string()
			.min(5)
			.max(10)
			.regex(/^[A-Z0-9-]+$/i, "Placa inválida"),
		brand: z.string().min(1).max(60),
		model: z.string().min(1).max(60),
		year: z.number().int().min(1980).max(2100),
		type: VehicleTypeSchema,
		capacity: z.string().max(60).optional(),
		driverName: z.string().max(200).optional(),
		driverId: ObjectIdSchema.optional(),
		soatExpiry: z.string().datetime().optional(),
		technoMechanicalExpiry: z.string().datetime().optional(),
		insuranceExpiry: z.string().datetime().optional(),
		lastMaintenanceAt: z.string().datetime().optional(),
		nextMaintenanceKm: z.number().int().nonnegative().optional(),
		kilometers: z.number().int().nonnegative().default(0),
		status: VehicleStatusSchema.default("active"),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
	})
	.strict();
export type Vehicle = z.infer<typeof VehicleSchema>;

export const CreateVehicleSchema = VehicleSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

export const UpdateVehicleSchema = CreateVehicleSchema.partial();
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;

export const VehicleIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export const ListVehiclesQuerySchema = z
	.object({
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(100).default(20),
		status: VehicleStatusSchema.optional(),
		type: VehicleTypeSchema.optional(),
	})
	.strict();
export type ListVehiclesQuery = z.infer<typeof ListVehiclesQuerySchema>;

/** Documento vehicular próximo a vencer */
export const VehicleDocumentAlertSchema = z
	.object({
		vehicleId: ObjectIdSchema,
		plate: z.string(),
		documentType: z.enum(["soat", "tecnomecanica", "poliza"]),
		expiresAt: z.string().datetime(),
		expired: z.boolean(),
	})
	.strict();
export type VehicleDocumentAlert = z.infer<typeof VehicleDocumentAlertSchema>;
