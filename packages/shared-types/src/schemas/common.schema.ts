import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export type ObjectId = z.infer<typeof ObjectIdSchema>;

export const PaginationQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Mongoose-compatible document shape (used by backend schema definitions)
export interface MongooseDocument<_T = Record<string, unknown>> {
	_id: string;
	createdAt: string;
	updatedAt: string;
	[key: string]: unknown;
}

// Auditable document with createdBy/updatedBy
export interface AuditableDocument<_T = Record<string, unknown>> extends MongooseDocument<_T> {
	createdBy: string;
	updatedBy?: string;
}

// Soft-deletable document
export interface SoftDeleteDocument<_T = Record<string, unknown>> extends AuditableDocument<_T> {
	deletedAt?: string | null;
	deletedBy?: string;
}
