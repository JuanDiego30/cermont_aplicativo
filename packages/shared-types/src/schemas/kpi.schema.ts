import { z } from "zod";

export const KpiTimeRangeSchema = z.enum(["7d", "30d", "90d", "12m"]);
export type KpiTimeRange = z.infer<typeof KpiTimeRangeSchema>;

export const MttrKpiSchema = z
	.object({
		period: KpiTimeRangeSchema,
		totalRepairHours: z.number().nonnegative(),
		totalRepairEvents: z.number().int().nonnegative(),
		mttrHours: z.number().nonnegative(),
		trend: z.number(),
	})
	.strict();

export const MtbfKpiSchema = z
	.object({
		period: KpiTimeRangeSchema,
		totalOperationalHours: z.number().nonnegative(),
		totalFailures: z.number().int().nonnegative(),
		mtbfHours: z.number().nonnegative(),
		trend: z.number(),
	})
	.strict();

export const FirstTimeFixRateKpiSchema = z
	.object({
		period: KpiTimeRangeSchema,
		totalJobs: z.number().int().nonnegative(),
		firstTimeFixes: z.number().int().nonnegative(),
		rate: z.number().min(0).max(100),
		trend: z.number(),
	})
	.strict();

export const TechnicianUtilizationKpiSchema = z
	.object({
		period: KpiTimeRangeSchema,
		totalAvailableHours: z.number().nonnegative(),
		totalBilledHours: z.number().nonnegative(),
		utilizationRate: z.number().min(0).max(100),
		trend: z.number(),
	})
	.strict();

export const DashboardKpiSummarySchema = z
	.object({
		mttr: MttrKpiSchema,
		mtbf: MtbfKpiSchema,
		firstTimeFixRate: FirstTimeFixRateKpiSchema,
		technicianUtilization: TechnicianUtilizationKpiSchema,
		period: KpiTimeRangeSchema,
		calculatedAt: z.string().datetime(),
	})
	.strict();

export type DashboardKpiSummary = z.infer<typeof DashboardKpiSummarySchema>;
