import { z } from "zod";
import { OrderTypeSchema } from "./order.schema";

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const HistoryOrdersQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		dateFrom: DateOnlySchema.optional(),
		dateTo: DateOnlySchema.optional(),
		client: z.string().trim().max(200).optional(),
		type: OrderTypeSchema.optional(),
		technician: z.string().trim().max(120).optional(),
	})
	.strip();
export type HistoryOrdersQuery = z.infer<typeof HistoryOrdersQuerySchema>;

export const HistoryArchiveRequestSchema = z
	.object({
		days: z.coerce.number().int().min(1).max(3650).default(30),
	})
	.strip();
export type HistoryArchiveRequest = z.infer<typeof HistoryArchiveRequestSchema>;

export const HistoryExportSchema = z
	.object({
		dateFrom: DateOnlySchema.optional(),
		dateTo: DateOnlySchema.optional(),
		client: z.string().trim().max(200).optional(),
		type: OrderTypeSchema.optional(),
		technician: z.string().trim().max(120).optional(),
	})
	.strip();
export type HistoryExportInput = z.infer<typeof HistoryExportSchema>;

export const HistoryOrderRowSchema = z.object({
	_id: z.string(),
	code: z.string(),
	type: z.string(),
	status: z.string(),
	clientName: z.string().nullable(),
	assetName: z.string(),
	location: z.string(),
	technicianName: z.string().nullable(),
	completedAt: z.string().nullable(),
	paidAt: z.string().nullable(),
	archivedAt: z.string().nullable(),
	totalCop: z.number(),
});
export type HistoryOrderRow = z.infer<typeof HistoryOrderRowSchema>;

export const HistoryStatsSchema = z.object({
	archivedOrders: z.number(),
	paidArchivedOrders: z.number(),
	totalArchivedCop: z.number(),
	nextArchiveRuleDays: z.number(),
});
export type HistoryStats = z.infer<typeof HistoryStatsSchema>;
