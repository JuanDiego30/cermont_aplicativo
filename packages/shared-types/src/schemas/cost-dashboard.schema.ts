import { z } from "zod";

export const PeriodOptionSchema = z.enum(["monthly", "quarterly", "yearly"]);
export type PeriodOption = z.infer<typeof PeriodOptionSchema>;

const CostByCategorySchema = z.object({
	category: z.string(),
	estimated: z.number(),
	actual: z.number(),
	variance: z.number(),
});

const CostDashboardMetricSchema = z.object({
	totalEstimated: z.number().nonnegative().optional(),
	totalBudgeted: z.number().nonnegative(),
	totalActual: z.number().nonnegative(),
	totalBilled: z.number().nonnegative().optional(),
	variance: z.number(),
	variancePercent: z.number(),
	byCategory: z.array(CostByCategorySchema).optional(),
});

const DomainValue = <T extends z.ZodTypeAny>(inner: T) =>
	z.object({ status: z.string(), value: inner });

const CostTopVarianceOrderSchema = z.object({
	orderId: z.string(),
	orderCode: DomainValue(z.string()),
	serviceCaseId: z.string().optional(),
	clientName: DomainValue(z.string()),
	status: DomainValue(z.string()),
	totalEstimated: z.number(),
	budgeted: z.number(),
	actual: z.number(),
	totalActual: z.number(),
	variance: z.number(),
	variancePercent: DomainValue(z.number()),
});
export type CostTopVarianceOrder = z.infer<typeof CostTopVarianceOrderSchema>;

const CostMonthlyTrendSchema = z.object({
	label: z.string(),
	budgeted: z.number().optional(),
	actual: z.number(),
});

export const CostDashboardSchema = z.object({
	summary: CostDashboardMetricSchema,
	topVariance: z.array(CostTopVarianceOrderSchema),
	monthlyTrend: z.array(CostMonthlyTrendSchema),
	byCategory: z.array(CostByCategorySchema),
	period: z.string(),
});
export type CostDashboard = z.infer<typeof CostDashboardSchema>;
