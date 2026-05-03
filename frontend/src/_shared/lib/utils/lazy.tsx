/**
 * Lazy-loaded heavy route components for code splitting.
 *
 * Use `next/dynamic` for client-side heavy components that include
 * large libraries (Recharts, PDF generators, etc.) to reduce
 * initial bundle size and improve First Contentful Paint.
 *
 * @module lib/lazy
 *
 * @example
 * ```tsx
 * // In a page component:
 * import { LazyMonthlyTrendChart } from "@/_shared/lib/lazy";
 *
 * export default function DashboardPage() {
 *   return <LazyMonthlyTrendChart data={data} />;
 * }
 * ```
 */

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

/** Reusable loading spinner for lazy-loaded components */
function ChartLoadingFallback() {
	return (
		<div className="flex h-64 items-center justify-center">
			<Loader2 className="h-6 w-6 animate-spin text-slate-400" />
		</div>
	);
}

/* ───────────── Dashboard Charts ───────────── */

export const LazyMonthlyTrendChart = dynamic(
	() => import("@/dashboard/ui/MonthlyTrendChart").then((m) => m.MonthlyTrendChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyOrdersByStatusChart = dynamic(
	() => import("@/dashboard/ui/OrdersByStatusChart").then((m) => m.OrdersByStatusChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyOrdersTimeSeriesChart = dynamic(
	() => import("@/dashboard/ui/OrdersTimeSeriesChart").then((m) => m.OrdersTimeSeriesChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyCostsByCategoryChart = dynamic(
	() => import("@/dashboard/ui/CostsByCategoryChart").then((m) => m.CostsByCategoryChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyTopAssetsChart = dynamic(
	() => import("@/dashboard/ui/TopAssetsChart").then((m) => m.TopAssetsChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyTechnicianWorkloadHeatmap = dynamic(
	() => import("@/dashboard/ui/TechnicianWorkloadHeatmap").then((m) => m.TechnicianWorkloadHeatmap),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyOrdersByPriorityChart = dynamic(
	() => import("@/dashboard/ui/OrdersByPriorityChart").then((m) => m.OrdersByPriorityChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyRevenueChart = dynamic(
	() => import("@/dashboard/ui/RevenueChart").then((m) => m.RevenueChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyWorkerPerformanceChart = dynamic(
	() => import("@/dashboard/ui/WorkerPerformanceChart").then((m) => m.WorkerPerformanceChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

/* ───────────── Reports Charts ───────────── */

export const LazyReportCycleTimeChart = dynamic(
	() => import("@/reports/ui/ReportCycleTimeChart").then((m) => m.ReportCycleTimeChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyTechnicianRankingChart = dynamic(
	() => import("@/reports/ui/TechnicianRankingChart").then((m) => m.TechnicianRankingChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyBillingVsCostChart = dynamic(
	() => import("@/reports/ui/BillingVsCostChart").then((m) => m.BillingVsCostChart),
	{ loading: ChartLoadingFallback, ssr: false },
);
