import type { OptimizedRoute, TechnicianAssignment } from "@cermont/shared-types";

interface DispatchResultsProps {
	route: OptimizedRoute | "idle";
	assignments: TechnicianAssignment[] | "idle";
}

export function DispatchResults({ route, assignments }: DispatchResultsProps) {
	if (route === "idle" && assignments === "idle") {
		return (
			<div className="rounded-xl border border-dashed border-border-default p-8 text-center text-sm text-muted-foreground">
				Agregue ubicaciones para calcular una ruta o distribuir paradas.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{route !== "idle" ? (
				<section className="rounded-xl border border-border-default bg-surface-primary p-4">
					<h2 className="mb-3 text-sm font-semibold text-foreground">Ruta optimizada</h2>
					<div className="grid grid-cols-3 gap-3">
						<ResultMetric label="Distancia" value={`${route.totalDistanceKm} km`} />
						<ResultMetric label="Duracion" value={`${Math.round(route.totalDurationMin)} min`} />
						<ResultMetric label="Paradas" value={String(route.orderedIds.length)} />
					</div>
					<ol className="mt-3 space-y-2">
						{route.stops.map((stop, index) => (
							<li
								key={stop.id}
								className="flex items-center gap-3 rounded-lg bg-surface-secondary px-3 py-2 text-sm"
							>
								<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
									{index + 1}
								</span>
								<div>
									<p className="font-medium text-foreground">{stop.label}</p>
									<p className="text-xs text-muted-foreground">{stop.address}</p>
								</div>
							</li>
						))}
					</ol>
				</section>
			) : null}

			{assignments !== "idle" ? (
				<section className="rounded-xl border border-border-default bg-surface-primary p-4">
					<h2 className="mb-3 text-sm font-semibold text-foreground">Asignacion por tecnico</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{assignments.map((assignment) => (
							<article
								key={assignment.technicianId}
								className="rounded-lg bg-surface-secondary p-3"
							>
								<h3 className="text-sm font-semibold text-foreground">
									{assignment.technicianName}
								</h3>
								<p className="mt-1 text-xs text-muted-foreground">
									{assignment.scheduledStops.length} paradas,{" "}
									{assignment.totalDistanceKm.toFixed(1)} km,{" "}
									{Math.round(assignment.totalDurationMin)} min
								</p>
							</article>
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}

function ResultMetric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg bg-surface-secondary p-3 text-center">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="mt-1 text-lg font-bold text-brand">{value}</p>
		</div>
	);
}
