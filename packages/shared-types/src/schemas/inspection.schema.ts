import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const InspectionTypeEnum = z.enum([
	"pulidora",
	"arnes",
	"electrico",
	"extintor",
	"vehiculo",
	"generico",
]);

export type InspectionType = z.infer<typeof InspectionTypeEnum>;

export const InspectionStatusEnum = z.enum(["pending", "approved", "rejected", "conditional"]);

export type InspectionStatus = z.infer<typeof InspectionStatusEnum>;

export const InspectionIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const InspectionOrderIdParamsSchema = z
	.object({
		order_id: ObjectIdSchema,
	})
	.strict();

export const InspectionItemInputSchema = z
	.object({
		code: z.string().min(1).max(50).trim(),
		description: z.string().min(1).max(500).trim(),
		passed: z.boolean().default(false),
		notes: z.string().max(1000).optional(),
		evidenceUrl: z.string().url().optional(),
	})
	.strict();

export type InspectionItemInput = z.infer<typeof InspectionItemInputSchema>;

export const InspectionItemSchema = z
	.object({
		code: z.string().min(1).max(50).trim(),
		description: z.string().min(1).max(500).trim(),
		passed: z.boolean().default(false),
		notes: z.string().max(1000).optional(),
		evidence_url: z.string().url().optional(),
	})
	.strict();

export type InspectionItem = z.infer<typeof InspectionItemSchema>;

export const CreateInspectionSchema = z
	.object({
		orderId: ObjectIdSchema,
		inspectionType: InspectionTypeEnum,
		inspectorId: ObjectIdSchema.optional(),
		inspectionDate: z.string().datetime().optional(),
		items: z.array(InspectionItemInputSchema).min(1),
		photos: z.array(z.string().url()).default([]),
		observations: z.string().max(2000).optional(),
	})
	.strict();

export type CreateInspection = z.infer<typeof CreateInspectionSchema>;

export const UpdateInspectionSchema = z
	.object({
		status: InspectionStatusEnum,
		approvedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		nextInspectionDate: z.string().datetime().optional(),
	})
	.strict();

export type UpdateInspection = z.infer<typeof UpdateInspectionSchema>;

export const UpdateInspectionStatusSchema = z
	.object({
		status: InspectionStatusEnum,
	})
	.strict();

export type UpdateInspectionStatus = z.infer<typeof UpdateInspectionStatusSchema>;

export const InspectionSchema = z
	.object({
		_id: ObjectIdSchema,
		order_id: ObjectIdSchema,
		inspection_type: InspectionTypeEnum,
		status: InspectionStatusEnum,
		inspector_id: ObjectIdSchema,
		inspection_date: z.string().datetime(),
		items: z.array(InspectionItemSchema),
		photos: z.array(z.string()),
		observations: z.string().optional(),
		next_inspection_date: z.string().datetime().optional(),
		approved_by: ObjectIdSchema.optional(),
		approved_at: z.string().datetime().optional(),
		created_by: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Inspection = z.infer<typeof InspectionSchema>;
