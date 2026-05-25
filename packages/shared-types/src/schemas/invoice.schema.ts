import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const InvoiceStatusSchema = z.enum([
	"draft",
	"issued",
	"sent",
	"submitted",
	"approved",
	"accepted",
	"rejected",
	"cancelled",
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export const InvoiceSchema = z
	.object({
		_id: ObjectIdSchema,
		sesId: ObjectIdSchema,
		invoiceNumber: z.string().min(1).max(50),
		value: z.number().nonnegative(),
		currency: z.string().default("COP"),
		issueDate: z.string().datetime().optional(),
		sentAt: z.string().datetime().optional(),
		approvedAt: z.string().datetime().optional(),
		status: InvoiceStatusSchema,
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type Invoice = z.infer<typeof InvoiceSchema>;

export const CreateInvoiceSchema = z
	.object({
		sesId: ObjectIdSchema,
		value: z.number().nonnegative(),
		invoiceNumber: z.string().min(1).max(50),
		notes: z.string().max(500).optional(),
	})
	.strict();
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
