import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ErrorDashboardQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(100).default(10),
	})
	.strict();

export const NotificationIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const AnalyticsPeriodSchema = z.enum(["day", "week", "month", "quarter", "year"]);
export type AnalyticsPeriod = z.infer<typeof AnalyticsPeriodSchema>;

export const ExtendedKpisQuerySchema = z
	.object({
		period: z.enum(["7d", "30d", "90d"]).default("30d"),
		compare: z.coerce.boolean().default(true),
	})
	.strict();

export const DashboardTopAssetsQuerySchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(50).default(10),
	})
	.strict();

export const DashboardTechnicianWorkloadQuerySchema = z
	.object({
		days: z.coerce.number().int().min(1).max(60).default(14),
	})
	.strict();

export type ErrorDashboardQuery = z.infer<typeof ErrorDashboardQuerySchema>;
export type NotificationId = z.infer<typeof NotificationIdSchema>;
export type ExtendedKpisQuery = z.infer<typeof ExtendedKpisQuerySchema>;
export type DashboardTopAssetsQuery = z.infer<typeof DashboardTopAssetsQuerySchema>;
export type DashboardTechnicianWorkloadQuery = z.infer<
	typeof DashboardTechnicianWorkloadQuerySchema
>;
