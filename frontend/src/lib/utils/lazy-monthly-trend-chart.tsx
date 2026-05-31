/**
 * Lazy-loaded MonthlyTrendChart for code splitting.
 *
 * @module lib/lazy-monthly-trend-chart
 */

import dynamic from "next/dynamic";
import { ChartLoadingFallback } from "@/lib/utils/lazy";

type MonthlyTrendPoint = { month: string; creadas: number; completadas: number };

const MonthlyTrendChartComponent = dynamic<{
	data: MonthlyTrendPoint[];
	loading?: boolean;
}>(
	() => import("@/modules/dashboard/ui/MonthlyTrendChart").then((m) => m.MonthlyTrendChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export function LazyMonthlyTrendChart({
	data,
	loading,
}: {
	data: MonthlyTrendPoint[];
	loading?: boolean;
}) {
	return <MonthlyTrendChartComponent data={data} loading={loading} />;
}
