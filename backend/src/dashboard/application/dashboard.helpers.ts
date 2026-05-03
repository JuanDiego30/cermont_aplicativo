import type { AnalyticsPeriod } from "@cermont/shared-types";
import type { PipelineStage } from "mongoose";
import { container } from "../../_shared/config/container";
import type {
	DateWindow,
	FinancialAggregateRow,
	GroupCount,
	KpiFilters,
	KpiFinancial,
	KpiLeadTime,
	LeadTimeAggregateRow,
} from "./dashboard.types";

export const CLOSED_STATUSES = ["closed", "cancelled"] as const;
export const COMPLETED_STATUSES = [
	"completed",
	"ready_for_invoicing",
	"acta_signed",
	"ses_sent",
	"invoice_approved",
	"paid",
	"closed",
] as const;
export const ACTIVE_TECHNICIAN_STATUSES = ["assigned", "in_progress", "report_pending"] as const;
export const MS_PER_DAY = 1_000 * 60 * 60 * 24;

const DEFAULT_CURRENCY = "COP";

export function toCountMap(groups: GroupCount[]): Record<string, number> {
	return Object.fromEntries(groups.map(({ _id, count }) => [_id, count]));
}

export function calcCompletionRate(completed: number, total: number): number {
	return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function roundMetric(value: number): number {
	return Math.round(value * 10) / 10;
}

export function getPeriodDays(period: AnalyticsPeriod): number {
	if (period === "7d") {
		return 7;
	}

	if (period === "90d") {
		return 90;
	}

	return 30;
}

export function getPeriodWindow(period: AnalyticsPeriod, offset = 0): DateWindow {
	const days = getPeriodDays(period);
	const end = new Date(Date.now() - offset * days * MS_PER_DAY);
	const start = new Date(end.getTime() - days * MS_PER_DAY);

	return { start, end };
}

export function buildWindowFilter(
	field: string,
	dateWindow: DateWindow,
): Record<string, Record<string, Date>> {
	return {
		[field]: {
			$gte: dateWindow.start,
			$lte: dateWindow.end,
		},
	};
}

export function toDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function buildDateKeys(days: number): string[] {
	const start = new Date(Date.now() - (days - 1) * MS_PER_DAY);
	return Array.from({ length: days }, (_value, index) => {
		const date = new Date(start.getTime() + index * MS_PER_DAY);
		return toDateKey(date);
	});
}

export function buildFinancial(raw: FinancialAggregateRow | undefined): KpiFinancial {
	const defaults: KpiFinancial = {
		total_actual: 0,
		count: 0,
		currency: DEFAULT_CURRENCY,
	};
	if (!raw) {
		return defaults;
	}
	const { _id, ...rest } = raw;
	return { ...rest, currency: DEFAULT_CURRENCY };
}

export function buildLeadTime(raw: LeadTimeAggregateRow | undefined): KpiLeadTime {
	if (!raw) {
		return {
			avg_lead_time_days: null,
			min_lead_time_days: null,
			max_lead_time_days: null,
			count: 0,
		};
	}
	const { _id, ...rest } = raw;
	return rest;
}

export function getDateBounds(filters: KpiFilters): {
	start?: Date;
	end?: Date;
} {
	const start = filters.startDate ? new Date(`${filters.startDate}T00:00:00.000Z`) : undefined;
	const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999Z`) : undefined;

	return {
		start: start && !Number.isNaN(start.getTime()) ? start : undefined,
		end: end && !Number.isNaN(end.getTime()) ? end : undefined,
	};
}

export function buildDateRangeFilter(field: string, filters: KpiFilters): Record<string, unknown> {
	const { start, end } = getDateBounds(filters);
	const range: Record<string, Date> = {};

	if (start) {
		range.$gte = start;
	}

	if (end) {
		range.$lte = end;
	}

	return Object.keys(range).length > 0 ? { [field]: range } : {};
}

export async function resolveClientUserIds(clientName: string): Promise<string[]> {
	const escaped = clientName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const users = await container.userRepository.find({ name: { $regex: escaped, $options: "i" } });
	return users.map((u) => u._id.toString());
}

export function mergeFilters(
	base: Record<string, unknown>,
	extra: Record<string, unknown>,
): Record<string, unknown> {
	return { ...base, ...extra };
}

export function buildGroupedCountPipeline(
	field: string,
	filters: KpiFilters,
	clientIds?: string[],
): PipelineStage[] {
	const dateMatch = buildDateRangeFilter("createdAt", filters);
	const clientMatch = clientIds?.length ? { createdBy: { $in: clientIds } } : {};
	const match = mergeFilters(dateMatch, clientMatch);
	return [
		...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
		{ $group: { _id: `$${field}`, count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
	];
}

export function toDateOrNull(value: Date | string | null): Date | null {
	if (!value) {
		return null;
	}

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function getClosureDays(
	completedAt: Date | string | null,
	approvedAt: Date | string | null,
): number | null {
	const completedDate = toDateOrNull(completedAt);
	const approvedDate = toDateOrNull(approvedAt);

	if (!completedDate || !approvedDate) {
		return null;
	}

	return Math.max((approvedDate.getTime() - completedDate.getTime()) / MS_PER_DAY, 0);
}
