import { Skeleton } from "@/core/ui/Skeleton";

/**
 * DashboardSkeleton — Full-page loading skeleton matching dashboard layout
 *
 * Renders skeleton placeholders for:
 * - Header (title + subtitle)
 * - 4 KPI cards (2-col → 4-col responsive grid)
 * - Chart row (two columns)
 * - Bottom row (3 columns)
 */
export function DashboardSkeleton() {
	return (
		<output className="space-y-6" aria-label="Cargando dashboard">
			{/* ── Header skeleton ── */}
			<div className="space-y-2">
				<Skeleton variant="text" height={32} className="w-64" />
				<Skeleton variant="text" height={16} className="w-96" />
			</div>

			{/* ── KPI cards skeleton (reuses existing Skeleton kpi-card variant) ── */}
			<Skeleton variant="kpi-card" />

			{/* ── Charts row (2 columns) ── */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="rounded-xl border border-hairline bg-canvas p-5">
					<Skeleton variant="text" height={18} className="mb-4 w-48" />
					<Skeleton variant="chart" height={240} />
				</div>
				<div className="rounded-xl border border-hairline bg-canvas p-5">
					<Skeleton variant="text" height={18} className="mb-4 w-48" />
					<Skeleton variant="chart" height={240} />
				</div>
			</div>

			{/* ── Bottom row (3 columns) ── */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
			{["left", "center", "right"].map((pos) => (
				<div
					key={`bottom-skeleton-${pos}`}
						className="rounded-xl border border-hairline bg-canvas p-5"
					>
						<Skeleton variant="text" height={18} className="mb-4 w-32" />
						<Skeleton variant="list-item" rows={3} />
					</div>
				))}
			</div>
		</output>
	);
}
