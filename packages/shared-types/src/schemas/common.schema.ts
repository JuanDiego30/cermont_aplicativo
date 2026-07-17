import { z } from "zod";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "../constants";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export type ObjectId = z.infer<typeof ObjectIdSchema>;

export const PaginationQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
		limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
	})
	.strip();

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Mongoose-compatible document shape (used by backend schema definitions)
export interface MongooseDocument<_T = object> {
	_id: string;
	createdAt: string;
	updatedAt: string;
	[key: string]: unknown;
}

// Auditable document with createdBy/updatedBy
export interface AuditableDocument<_T = object> extends MongooseDocument<_T> {
	createdBy: string;
	updatedBy?: string;
}

// Soft-deletable document (deletedAt is optional — absence means not deleted)
export interface SoftDeleteDocument<_T = object> extends AuditableDocument<_T> {
	deletedAt?: string;
	deletedBy?: string;
}

/** Reusable helper: a required string with Spanish "obligatorio" message */
export const requiredString = (fieldName: string) =>
	z.string().min(1, { message: `${fieldName} es obligatorio` });

/** Reusable helper: a required email with Spanish error message */
export const requiredEmail = () => z.string().email({ message: "Correo electrónico no válido" });
