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
 * import { LazyMonthlyTrendChart } from "@/lib/lazy";
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
			<Loader2 className="size-6 animate-spin text-zinc-400" />
		</div>
	);
}

/* ───────────── Dashboard Charts ───────────── */

export const LazyMonthlyTrendChart = dynamic(
	() => import("@/modules/dashboard/ui/MonthlyTrendChart").then((m) => m.MonthlyTrendChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

export const LazyOrdersByStatusChart = dynamic(
	() => import("@/modules/dashboard/ui/OrdersByStatusChart").then((m) => m.OrdersByStatusChart),
	{ loading: ChartLoadingFallback, ssr: false },
);

/* ───────────── Cost Components ───────────── */

// Cost comparison chart disabled (pending re-implementation)
// export const LazyCostComparisonChart = dynamic(
//     () =>
//         import("@/modules/costs/ui/CostComparisonChart").then(
//             (m) => m.CostComparisonChart,
//         ),
//     { loading: ChartLoadingFallback, ssr: false },
// );

/* ───────────── Chat Modal ───────────── */

// ChatModal component does not exist - commented out
// export const LazyChatModal = dynamic(
//     () =>
//         import("@/modules/core/ui/chat/ChatModal").then((m) => m.ChatModal),
//     { loading: () => null, ssr: false },
// );
