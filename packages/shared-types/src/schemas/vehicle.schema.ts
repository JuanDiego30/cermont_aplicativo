import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { FileAssetRefSchema } from "./file-asset.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Fleet / Vehicle — Parque automotor con documentos obligatorios colombianos
// (SOAT, tecnomecánica, póliza, tarjeta de propiedad) y control de mantenimiento.
// ──────────────────────────────────────────────────────────────────────────────

export const VehicleTypeSchema = z.enum(["camioneta", "camion", "moto", "van", "otro"]);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const VehicleStatusSchema = z.enum(["active", "maintenance", "out_of_service"]);
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;

export const VehiclePrimaryPhotoSchema = z.discriminatedUnion("status", [
	z.object({ status: z.literal("absent") }).strict(),
	z.object({ status: z.literal("present"), fileAssetId: z.string().min(1).max(64) }).strict(),
]);
export type VehiclePrimaryPhoto = z.infer<typeof VehiclePrimaryPhotoSchema>;

export const VehiclePhotoSchema = z
	.object({
		id: z.string().min(1).max(64),
		url: z.string().min(1).max(2048),
		title: z.string().min(1).max(100),
		isPrimary: z.boolean(),
		uploadedAt: z.string().datetime(),
	})
	.strict();
export type VehiclePhoto = z.infer<typeof VehiclePhotoSchema>;

export const VehiclePhotoUploadFormSchema = z
	.object({
		title: z.string().trim().min(1).max(100).optional(),
	})
	.strict();
export type VehiclePhotoUploadForm = z.infer<typeof VehiclePhotoUploadFormSchema>;

export const VehiclePhotoParamsSchema = z
	.object({
		id: ObjectIdSchema,
		photoId: z.string().min(1).max(64),
	})
	.strict();

// ─── Vehicle Document Types ─────────────────────────────────────────────────

export const VehicleDocumentTypeSchema = z.enum([
	"soat",
	"tecnomecanica",
	"poliza",
	"tarjeta_propiedad",
]);
export type VehicleDocumentType = z.infer<typeof VehicleDocumentTypeSchema>;

export const VehicleDocumentExpiryStatusSchema = z.enum([
	"valid",
	"expiring",
	"expired",
	"missing",
]);
export type VehicleDocumentExpiryStatus = z.infer<typeof VehicleDocumentExpiryStatusSchema>;

export const VehicleDocumentSchema = z
	.object({
		documentType: VehicleDocumentTypeSchema,
		documentNumber: z.string().min(1).max(60),
		issueDate: z.string().datetime(),
		expiryDate: z.string().datetime(),
		status: VehicleDocumentExpiryStatusSchema,
		fileUrl: z.string().url().max(2048).optional(),
		verifiedAt: z.string().datetime().optional(),
	})
	.strict();
export type VehicleDocument = z.infer<typeof VehicleDocumentSchema>;

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
		documents: z.array(VehicleDocumentSchema).default([]),
		soatExpiry: z.string().datetime().optional(),
		technoMechanicalExpiry: z.string().datetime().optional(),
		insuranceExpiry: z.string().datetime().optional(),
		lastMaintenanceAt: z.string().datetime().optional(),
		nextMaintenanceKm: z.number().int().nonnegative().optional(),
		kilometers: z.number().int().nonnegative().default(0),
		status: VehicleStatusSchema.default("active"),
		notes: z.string().max(500).optional(),
		fileAssets: z.array(FileAssetRefSchema).default([]),
		primaryPhoto: VehiclePrimaryPhotoSchema.default({ status: "absent" }),
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
	})
	.strict();
export type Vehicle = z.infer<typeof VehicleSchema>;

export const CreateVehicleSchema = VehicleSchema.omit({
	_id: true,
	fileAssets: true,
	primaryPhoto: true,
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
		documentType: VehicleDocumentTypeSchema,
		expiresAt: z.string().datetime(),
		daysUntilExpiry: z.number().int(),
		expired: z.boolean(),
	})
	.strict();
export type VehicleDocumentAlert = z.infer<typeof VehicleDocumentAlertSchema>;

export const FleetReadinessSchema = z
	.object({
		totalVehicles: z.number().int().nonnegative(),
		readyVehicles: z.number().int().nonnegative(),
		blockedVehicles: z.number().int().nonnegative(),
		readinessPercent: z.number().min(0).max(100),
		expiringSoonCount: z.number().int().nonnegative(),
		expiredCount: z.number().int().nonnegative(),
		missingDocumentCount: z.number().int().nonnegative(),
	})
	.strict();
export type FleetReadiness = z.infer<typeof FleetReadinessSchema>;

export const AddVehicleDocumentSchema = z
	.object({
		documentType: VehicleDocumentTypeSchema,
		documentNumber: z.string().min(1).max(60),
		issueDate: z.string().datetime(),
		expiryDate: z.string().datetime(),
		fileUrl: z.string().url().max(2048).optional(),
	})
	.strict();
export type AddVehicleDocumentInput = z.infer<typeof AddVehicleDocumentSchema>;

export const VehicleAssignmentStatusSchema = z.enum(["pending", "active", "completed"]);
export type VehicleAssignmentStatus = z.infer<typeof VehicleAssignmentStatusSchema>;

export const VehicleCheckoutSchema = z
	.object({
		mileage: z.number().int().nonnegative(),
		fuelLevel: z.number().int().min(0).max(100),
		photos: z.array(z.string().min(1).max(64)),
		notes: z.string().max(500).optional(),
	})
	.strict();
export type VehicleCheckout = z.infer<typeof VehicleCheckoutSchema>;

export const VehicleCheckinSchema = z
	.object({
		mileage: z.number().int().nonnegative(),
		fuelLevel: z.number().int().min(0).max(100),
		photos: z.array(z.string().min(1).max(64)),
		notes: z.string().max(500).optional(),
	})
	.strict();
export type VehicleCheckin = z.infer<typeof VehicleCheckinSchema>;

export const VehicleAssignmentSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		vehicleId: ObjectIdSchema,
		driverId: ObjectIdSchema,
		driverName: z.string().max(200).optional(),
		assignedBy: ObjectIdSchema,
		assignedAt: z.string().datetime(),
		startedAt: z.string().datetime().optional(),
		endedAt: z.string().datetime().optional(),
		status: VehicleAssignmentStatusSchema.default("pending"),
		checkout: VehicleCheckoutSchema.optional(),
		checkin: VehicleCheckinSchema.optional(),
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
	})
	.strict();
export type VehicleAssignment = z.infer<typeof VehicleAssignmentSchema>;

export const CreateVehicleAssignmentSchema = z
	.object({
		vehicleId: ObjectIdSchema,
		driverId: ObjectIdSchema,
	})
	.strict();
export type CreateVehicleAssignmentInput = z.infer<typeof CreateVehicleAssignmentSchema>;

export const CheckoutVehicleAssignmentSchema = z
	.object({
		checkout: VehicleCheckoutSchema,
	})
	.strict();
export type CheckoutVehicleAssignmentInput = z.infer<typeof CheckoutVehicleAssignmentSchema>;

export const CheckinVehicleAssignmentSchema = z
	.object({
		checkin: VehicleCheckinSchema,
	})
	.strict();
export type CheckinVehicleAssignmentInput = z.infer<typeof CheckinVehicleAssignmentSchema>;
