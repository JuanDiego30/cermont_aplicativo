import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

const DELIVERY_RECORD_STATUS_VALUES = [
	"not_created",
	"draft",
	"sent",
	"signed",
	"rejected",
	"cancelled",
] as const;

export const DeliveryRecordStatusSchema = z.enum(DELIVERY_RECORD_STATUS_VALUES);
export type DeliveryRecordStatus = z.infer<typeof DeliveryRecordStatusSchema>;

export const DeliveryAcceptanceStatusSchema = z.enum([
	"pending",
	"accepted",
	"accepted_with_observations",
	"rejected",
]);
export type DeliveryAcceptanceStatus = z.infer<typeof DeliveryAcceptanceStatusSchema>;

export const DeliverySignatureMethodSchema = z.enum(["manual", "digital", "uploaded_document"]);
export type DeliverySignatureMethod = z.infer<typeof DeliverySignatureMethodSchema>;

export const DeliveryRecordSchema = z
	.object({
		_id: ObjectIdSchema,
		workOrderId: ObjectIdSchema,
		technicalReportId: ObjectIdSchema,
		code: z.string().min(1).max(40),
		deliveryDate: z.string().datetime().optional(),
		clientRepresentative: z.string().min(1).max(200).optional(),
		clientContact: z.string().min(1).max(200).optional(),
		acceptanceStatus: DeliveryAcceptanceStatusSchema.default("pending"),
		clientObservations: z.string().max(2000).optional(),
		signedDocumentRef: z.string().min(1).max(500).optional(),
		signatureMethod: DeliverySignatureMethodSchema.optional(),
		signedAt: z.string().datetime().optional(),
		signedBy: z.string().min(1).max(200).optional(),
		sentAt: z.string().datetime().optional(),
		sentBy: ObjectIdSchema.optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectionReason: z.string().min(1).max(1000).optional(),
		status: DeliveryRecordStatusSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type DeliveryRecord = z.infer<typeof DeliveryRecordSchema>;

export const DeliveryRecordNotCreatedSchema = z
	.object({
		workOrderId: ObjectIdSchema,
		status: z.literal("not_created"),
		message: z.string().min(1).max(300),
	})
	.strict();

export type DeliveryRecordNotCreated = z.infer<typeof DeliveryRecordNotCreatedSchema>;

export const DeliveryRecordReadModelSchema = z.union([
	DeliveryRecordSchema,
	DeliveryRecordNotCreatedSchema,
]);
export type DeliveryRecordReadModel = z.infer<typeof DeliveryRecordReadModelSchema>;

export const DeliveryRecordIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type DeliveryRecordIdParams = z.infer<typeof DeliveryRecordIdParamsSchema>;

export const OrderDeliveryRecordParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type OrderDeliveryRecordParams = z.infer<typeof OrderDeliveryRecordParamsSchema>;

export const ListDeliveryRecordsQuerySchema = z
	.object({
		workOrderId: ObjectIdSchema.optional(),
		technicalReportId: ObjectIdSchema.optional(),
		status: DeliveryRecordStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListDeliveryRecordsQuery = z.infer<typeof ListDeliveryRecordsQuerySchema>;

export const CreateDeliveryRecordV2Schema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		deliveryDate: z.string().datetime().optional(),
		clientRepresentative: z.string().min(1).max(200).optional(),
		clientContact: z.string().min(1).max(200).optional(),
		clientObservations: z.string().max(2000).optional(),
	})
	.strict();

export type CreateDeliveryRecordV2Input = z.infer<typeof CreateDeliveryRecordV2Schema>;

export const SendDeliveryRecordSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type SendDeliveryRecordInput = z.infer<typeof SendDeliveryRecordSchema>;

export const SignDeliveryRecordSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		signedDocumentRef: z.string().min(1).max(500),
		signatureMethod: DeliverySignatureMethodSchema,
		signedAt: z.string().datetime(),
		signedBy: z.string().min(1).max(200),
		clientObservations: z.string().max(2000).optional(),
	})
	.strict();

export type SignDeliveryRecordInput = z.infer<typeof SignDeliveryRecordSchema>;

export const RejectDeliveryRecordSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		reason: z.string().min(5).max(1000),
	})
	.strict();

export type RejectDeliveryRecordInput = z.infer<typeof RejectDeliveryRecordSchema>;

export const CancelDeliveryRecordSchema = RejectDeliveryRecordSchema;
export type CancelDeliveryRecordInput = z.infer<typeof CancelDeliveryRecordSchema>;
