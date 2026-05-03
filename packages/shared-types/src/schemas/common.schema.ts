import { z } from "zod";

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
export const PASSWORD_MESSAGE =
	"Password must contain at least one uppercase letter, one lowercase letter, and one number";

export const EmailSchema = z.string().trim().toLowerCase().email();

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export type ObjectId = z.infer<typeof ObjectIdSchema>;
export type TID = string;

export const PaginationQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const NoBodySchema = z.preprocess((value) => {
	if (typeof value === "undefined") {
		return {};
	}

	return value;
}, z.object({}).strict());
export type NoBody = z.infer<typeof NoBodySchema>;

export const ArchiveOrdersQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		search: z.string().trim().max(120).default(""),
		period: z
			.union([
				z
					.string()
					.trim()
					.regex(/^\d{4}-\d{2}$/),
				z.literal(""),
			])
			.default(""),
	})
	.strip();

export type ArchiveOrdersQuery = z.infer<typeof ArchiveOrdersQuerySchema>;

export const CursorPaginationSchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(100).default(50),
		cursor: ObjectIdSchema.optional(),
	})
	.strip();

export type CursorPagination = z.infer<typeof CursorPaginationSchema>;

export interface CursorPaginationResult<T> {
	data: T[];
	pagination: {
		nextCursor: string | null;
		hasNextPage: boolean;
	};
}

/**
 * Interface to represent the core structure of a Mongoose document.
 * This is used to define "Document" types in shared-types that can be
 * mapped to actual Mongoose Documents in the backend.
 */
export interface MongooseDocument<TID = string> {
	_id: TID;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Interface for Soft-Delete documents
 */
export interface SoftDeleteDocument<TID = string> extends MongooseDocument<TID> {
	deletedAt?: Date | null;
	deletedBy?: TID | null;
}

/**
 * Interface for Auditable documents (track who created/updated)
 */
export interface AuditableDocument<TID = string> extends MongooseDocument<TID> {
	createdBy: TID;
	updatedBy: TID;
}
