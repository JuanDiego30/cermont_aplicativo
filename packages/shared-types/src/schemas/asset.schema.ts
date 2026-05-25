import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Asset / Equipment ────────────────────────────────────────────────────────

export const AssetTypeEnum = z.enum([
	"tool",
	"equipment",
	"vehicle",
	"device",
	"infrastructure",
	"other",
]);
export type AssetType = z.infer<typeof AssetTypeEnum>;

export const AssetStatusEnum = z.enum([
	"available",
	"in_use",
	"maintenance",
	"damaged",
	"retired",
	"lost",
]);
export type AssetStatus = z.infer<typeof AssetStatusEnum>;

export const AssetSchema = z.object({
	_id: ObjectIdSchema,
	code: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	type: AssetTypeEnum,
	status: AssetStatusEnum,
	serialNumber: z.string().optional(),
	model: z.string().optional(),
	brand: z.string().optional(),
	purchaseDate: z.string().datetime().optional(),
	lastMaintenanceAt: z.string().datetime().optional(),
	nextMaintenanceAt: z.string().datetime().optional(),
	specifications: z.record(z.string(), z.unknown()).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type Asset = z.infer<typeof AssetSchema>;

// ─── Certificates ──────────────────────────────────────────────────────────────

export const CertificateStatusEnum = z.enum([
	"active",
	"expiring",
	"expired",
	"revoked",
	"archived",
]);

export const CertificateSchema = z.object({
	_id: ObjectIdSchema,
	title: z.string().min(1),
	entityType: z.enum(["asset", "user", "company"]),
	entityId: ObjectIdSchema,
	certificateType: z.string().min(1),
	issuer: z.string().min(1),
	issueDate: z.string().datetime(),
	expiryDate: z.string().datetime().optional(),
	documentUrl: z.string().optional(),
	status: CertificateStatusEnum,
	notes: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type Certificate = z.infer<typeof CertificateSchema>;

// ─── Asset History ────────────────────────────────────────────────────────────

export const AssetHistoryTypeEnum = z.enum([
	"maintenance",
	"inspection",
	"assignment",
	"return",
	"status_change",
	"repair",
]);

export const AssetHistorySchema = z.object({
	_id: ObjectIdSchema,
	assetId: ObjectIdSchema,
	type: AssetHistoryTypeEnum,
	date: z.string().datetime(),
	actorId: ObjectIdSchema,
	description: z.string().min(1),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AssetHistory = z.infer<typeof AssetHistorySchema>;

// ─── Input Schemas ───────────────────────────────────────────────────────────

export const CreateAssetSchema = z.object({
	code: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	type: AssetTypeEnum,
	status: AssetStatusEnum.default("available"),
	serialNumber: z.string().optional(),
	model: z.string().optional(),
	brand: z.string().optional(),
	purchaseDate: z.string().datetime().optional(),
	specifications: z.record(z.string(), z.unknown()).optional(),
});

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;

export const UpdateAssetSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	type: AssetTypeEnum.optional(),
	status: AssetStatusEnum.optional(),
	serialNumber: z.string().optional(),
	model: z.string().optional(),
	brand: z.string().optional(),
	purchaseDate: z.string().datetime().optional(),
	lastMaintenanceAt: z.string().datetime().optional(),
	nextMaintenanceAt: z.string().datetime().optional(),
	specifications: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;

export const AssetIdSchema = z.object({
	id: ObjectIdSchema,
});

export type AssetId = z.infer<typeof AssetIdSchema>;

export const ListAssetsQuerySchema = z.object({
	page: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	status: AssetStatusEnum.optional(),
	type: AssetTypeEnum.optional(),
	assignedToId: ObjectIdSchema.optional(),
});

export type ListAssetsQuery = z.infer<typeof ListAssetsQuerySchema>;

export const CreateCertificateSchema = z.object({
	title: z.string().min(1),
	certificateType: z.string().min(1),
	issuer: z.string().min(1),
	issueDate: z.string().datetime(),
	expiryDate: z.string().datetime().optional(),
	documentUrl: z.string().optional(),
	notes: z.string().optional(),
});

export type CreateCertificateInput = z.infer<typeof CreateCertificateSchema>;
