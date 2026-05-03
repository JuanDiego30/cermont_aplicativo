import { z } from "zod";
import { normalizeQueryValue } from "../utils";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";

export const DocumentCategorySchema = z.enum([
	"general",
	"ast",
	"ptw",
	"support",
	"delivery_record",
	"billing_support",
]);
export type DocumentCategory = z.infer<typeof DocumentCategorySchema>;

export const DocumentPhaseSchema = z.enum(["planning", "execution", "closure"]);
export type DocumentPhase = z.infer<typeof DocumentPhaseSchema>;

export const DocumentIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const DocumentListQuerySchema = z
	.object({
		category: z.union([DocumentCategorySchema, z.literal("")]).optional(),
		order_id: z.union([ObjectIdSchema, z.literal("")]).optional(),
		orderId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		phase: z.union([DocumentPhaseSchema, z.literal("")]).optional(),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strict();

export const UploadDocumentSchema = z
	.object({
		title: z.string().min(1).max(200).trim(),
		category: DocumentCategorySchema.default("general"),
		order_id: z.union([ObjectIdSchema, z.literal("")]).optional(),
		orderId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		phase: DocumentPhaseSchema.optional(),
	})
	.strict();

export const CreateDocumentSchema = UploadDocumentSchema;

export const SignDocumentSchema = z
	.object({
		signedBy: ObjectIdSchema,
	})
	.strict();

export const DocumentSchema = z
	.object({
		_id: ObjectIdSchema,
		title: z.string(),
		category: DocumentCategorySchema,
		file_url: z.string(),
		file_size: z.number().int().nonnegative().optional(),
		mime_type: z.string().optional(),
		uploaded_by: ObjectIdSchema,
		order_id: ObjectIdSchema.optional(),
		phase: DocumentPhaseSchema.default("planning"),
		signed: z.boolean().optional(),
		signedBy: ObjectIdSchema.optional(),
		signedAt: z.string().datetime().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type DocumentId = z.infer<typeof DocumentIdSchema>;
export type DocumentListQuery = z.infer<typeof DocumentListQuerySchema>;
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type SignDocumentInput = z.infer<typeof SignDocumentSchema>;
export type Document = z.infer<typeof DocumentSchema>;

/**
 * Mongoose Document representation for Document.
 * Used for type safety in backend services and repositories.
 */
export interface DocumentDocument<TID = string> extends MongooseDocument<TID> {
	title: string;
	category: DocumentCategory;
	file_url: string;
	file_size?: number;
	mime_type?: string;
	uploaded_by: TID;
	order_id?: TID;
	phase: DocumentPhase;
	signed?: boolean;
	signedBy?: TID;
	signedAt?: Date;
}
