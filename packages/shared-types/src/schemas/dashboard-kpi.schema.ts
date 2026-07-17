import { z } from "zod";

export const DashboardKpiEntrySchema = z.object({
	label: z.string(),
	value: z.number(),
	change: z.number().optional(),
	changeType: z.enum(["increase", "decrease", "neutral"]).optional(),
	icon: z.string().optional(),
});

export const DashboardKPIResponseSchema = z.object({
	kpis: z.array(DashboardKpiEntrySchema),
	period: z.string().optional(),
});
export type DashboardKPIResponse = z.infer<typeof DashboardKPIResponseSchema>;
