"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ActivityChartEntry {
	name: string;
	value: number;
	color: string;
}

interface MaintenanceChartsProps {
	activityCounts: ActivityChartEntry[];
	canCreate: boolean;
	canEdit: boolean;
	canDelete: boolean;
}

export function MaintenanceCharts({
	activityCounts,
	canCreate,
	canEdit,
	canDelete,
}: MaintenanceChartsProps) {
	return (
		<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h2 className="text-xl font-bold text-[var(--text-primary)]">
							Distribución por actividad
						</h2>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							Conteo del conjunto filtrado actual.
						</p>
					</div>

					<span className="rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
						{activityCounts.length} actividades representadas
					</span>
				</div>

				<div className="mt-5 h-[280px]">
					{activityCounts.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={activityCounts}
									dataKey="value"
									nameKey="name"
									innerRadius={72}
									outerRadius={110}
									paddingAngle={4}
								>
									{activityCounts.map((entry) => (
										<Cell key={entry.name} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									formatter={(value) => [`${value} kits`, "Cantidad"]}
									contentStyle={{
										borderRadius: 16,
										borderColor: "rgba(148,163,184,0.2)",
										boxShadow: "0 16px 32px rgba(15,23,42,0.12)",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div className="flex h-full items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] text-sm text-[var(--text-secondary)]">
							Aún no hay datos para mostrar.
						</div>
					)}
				</div>
			</section>

			<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
				<h2 className="text-xl font-bold text-[var(--text-primary)]">Resumen operativo</h2>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					La vista está respaldada por el contrato real de kits típicos y sus acciones autorizadas.
				</p>

				<ul className="mt-5 space-y-3 text-sm">
					<li className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3">
						<p className="font-semibold text-[var(--text-primary)]">Creación</p>
						<p className="mt-1 text-[var(--text-secondary)]">
							{canCreate
								? "Disponible para gerente, residente y HES."
								: "No tienes permisos de creación."}
						</p>
					</li>
					<li className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3">
						<p className="font-semibold text-[var(--text-primary)]">Edición</p>
						<p className="mt-1 text-[var(--text-secondary)]">
							{canEdit
								? "Solo gerente y residente pueden actualizar kits."
								: "No tienes permisos de edición."}
						</p>
					</li>
					<li className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3">
						<p className="font-semibold text-[var(--text-primary)]">Desactivación</p>
						<p className="mt-1 text-[var(--text-secondary)]">
							{canDelete
								? "La desactivación es exclusiva de gerente."
								: "No tienes permisos para desactivar kits."}
						</p>
					</li>
				</ul>
			</section>
		</div>
	);
}
