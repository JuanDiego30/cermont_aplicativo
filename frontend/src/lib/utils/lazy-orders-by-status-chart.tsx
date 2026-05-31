/**
 * Lazy-loaded OrdersByStatusChart for code splitting.
 *
 * @module lib/lazy-orders-by-status-chart
 */

import dynamic from "next/dynamic";
import { ChartLoadingFallback } from "@/lib/utils/lazy";

type OrdersByStatusPoint = { name: string; value: number };

const OrdersByStatusChartComponent = dynamic<{ data: OrdersByStatusPoint[] }>(
	() => import("@/modules/dashboard/ui/OrdersByStatusChart").then((m) => m.OrdersByStatusChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export function LazyOrdersByStatusChart({ data }: { data: OrdersByStatusPoint[] }) {
	return <OrdersByStatusChartComponent data={data} />;
}
