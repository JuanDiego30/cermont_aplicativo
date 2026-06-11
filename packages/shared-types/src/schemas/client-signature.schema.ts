import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Client Signature — Paso 10: Firma digital del cliente
// Digital signature using HTML5 canvas, supports touch + mouse,
// stores as PNG with metadata, linked to DeliveryRecord and TechnicalReport.
// ──────────────────────────────────────────────────────────────────────────────

export const SignatureCaptureMethodSchema = z.enum([
	"canvas_touch",
	"canvas_mouse",
	"fingerprint_scanner",
	"uploaded_image",
]);
export type SignatureCaptureMethod = z.infer<typeof SignatureCaptureMethodSchema>;

export const SignatureStatusSchema = z.enum([
	"pending",
	"captured",
	"verified",
	"rejected",
	"expired",
]);
export type SignatureStatus = z.infer<typeof SignatureStatusSchema>;

export const SignatureContextTypeSchema = z.enum([
	"delivery_record",
	"technical_report",
	"site_visit",
	"proposal_approval",
	"ses_approval",
	"work_order_acceptance",
]);
export type SignatureContextType = z.infer<typeof SignatureContextTypeSchema>;

/**
 * GPS location metadata for signature
 */
export const SignatureGpsMetadataSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
		accuracy: z.number().positive().optional(),
		capturedAt: z.string().datetime().optional(),
	})
	.strict();

export type SignatureGpsMetadata = z.infer<typeof SignatureGpsMetadataSchema>;

/**
 * Client Signature — Main entity
 */
export const ClientSignatureSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().min(1).max(40),
		// Who signed
		clientId: ObjectIdSchema.optional(),
		clientName: z.string().min(1).max(200),
		clientDocumentType: z.enum(["NIT", "CC", "CE", "PASAPORTE"]).optional(),
		clientDocumentNumber: z.string().max(30).optional(),
		clientEmail: z.email().optional(),
		clientPhone: z.string().max(30).optional(),
		// Context — what this signature is for
		contextType: SignatureContextTypeSchema,
		contextId: ObjectIdSchema,
		contextCode: z.string().max(40).optional(),
		// Signature data
		captureMethod: SignatureCaptureMethodSchema,
		imageUrl: z.string().url(),
		imageDocumentId: ObjectIdSchema.optional(),
		imageHash: z.string().max(128).optional(),
		encrypted: z.boolean().default(false),
		encryptionKeyRef: z.string().max(200).optional(),
		// Metadata
		ipAddress: z.string().max(45).optional(),
		userAgent: z.string().max(500).optional(),
		gpsLocation: SignatureGpsMetadataSchema.optional(),
		deviceId: z.string().max(120).optional(),
		// Status
		status: SignatureStatusSchema,
		verifiedAt: z.string().datetime().optional(),
		verifiedBy: ObjectIdSchema.optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectionReason: z.string().max(500).optional(),
		expiresAt: z.string().datetime().optional(),
		// Audit
		signedAt: z.string().datetime(),
		signedBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type ClientSignature = z.infer<typeof ClientSignatureSchema>;

// ─── Input Schemas ──────────────────────────────────────────────────────────

export const CreateClientSignatureSchema = z
	.object({
		clientName: z.string().min(1).max(200),
		clientDocumentType: z.enum(["NIT", "CC", "CE", "PASAPORTE"]).optional(),
		clientDocumentNumber: z.string().max(30).optional(),
		clientEmail: z.email().optional(),
		contextType: SignatureContextTypeSchema,
		contextId: ObjectIdSchema,
		captureMethod: SignatureCaptureMethodSchema,
		imageData: z.string().min(1), // base64 PNG data
		ipAddress: z.string().max(45).optional(),
		userAgent: z.string().max(500).optional(),
		gpsLocation: SignatureGpsMetadataSchema.optional(),
		deviceId: z.string().max(120).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type CreateClientSignatureInput = z.infer<typeof CreateClientSignatureSchema>;

export const VerifyClientSignatureSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type VerifyClientSignatureInput = z.infer<typeof VerifyClientSignatureSchema>;

export const RejectClientSignatureSchema = z
	.object({
		reason: z.string().min(5).max(500),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RejectClientSignatureInput = z.infer<typeof RejectClientSignatureSchema>;

export const ClientSignatureIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export type ClientSignatureIdParams = z.infer<typeof ClientSignatureIdParamsSchema>;

export const ListClientSignaturesQuerySchema = z
	.object({
		clientId: ObjectIdSchema.optional(),
		contextType: SignatureContextTypeSchema.optional(),
		contextId: ObjectIdSchema.optional(),
		status: SignatureStatusSchema.optional(),
		dateFrom: z.string().datetime().optional(),
		dateTo: z.string().datetime().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListClientSignaturesQuery = z.infer<typeof ListClientSignaturesQuerySchema>;

// ─── Mongoose Document interface ────────────────────────────────────────────

export interface ClientSignatureDocument<TID = string> {
	_id: TID;
	code: string;
	clientId?: TID;
	clientName: string;
	clientDocumentType?: string;
	clientDocumentNumber?: string;
	clientEmail?: string;
	clientPhone?: string;
	contextType: SignatureContextType;
	contextId: TID;
	contextCode?: string;
	captureMethod: SignatureCaptureMethod;
	imageUrl: string;
	imageDocumentId?: TID;
	imageHash?: string;
	encrypted: boolean;
	encryptionKeyRef?: string;
	ipAddress?: string;
	userAgent?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt?: Date;
	};
	deviceId?: string;
	status: SignatureStatus;
	verifiedAt?: Date;
	verifiedBy?: TID;
	rejectedAt?: Date;
	rejectedBy?: TID;
	rejectionReason?: string;
	expiresAt?: Date;
	signedAt: Date;
	signedBy: TID;
	createdAt: Date;
	updatedAt: Date;
}
