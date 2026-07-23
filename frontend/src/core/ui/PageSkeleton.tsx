import { Skeleton } from "./Skeleton";

type PageSkeletonVariant = "dashboard" | "table" | "detail";

export function PageSkeleton({ variant = "dashboard" }: { variant?: PageSkeletonVariant }) {
	return (
		<div role="status" aria-busy="true" aria-label="Cargando contenido" className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-7 w-56" />
				<Skeleton className="h-4 w-80 max-w-full" />
			</div>
			{variant === "dashboard" ? (
				<>
					<Skeleton variant="kpi-card" />
					<div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
						<Skeleton variant="chart" height={280} />
						<Skeleton variant="card" className="h-[280px]" />
					</div>
				</>
			) : variant === "table" ? (
				<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
					<Skeleton variant="table-row" rows={6} />
				</div>
			) : (
				<div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
					<Skeleton variant="card" className="h-64" />
					<Skeleton variant="card" className="h-64" />
				</div>
			)}
		</div>
	);
}
