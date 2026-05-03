"use client";

import type { DashboardTechnicianWorkloadRow } from "@cermont/shared-types";
import { memo } from "react";
import { ChartCard } from "./ChartCard";

interface TechnicianWorkloadHeatmapProps {
	data: DashboardTechnicianWorkloadRow[];
	loading?: boolean;
}

function getIntensityClass(value: number, max: number): string {
	if (value === 0 || max === 0) {
		return "bg-[var(--surface-muted)] text-[var(--text-tertiary)]";
	}

	const ratio = value / max;
	if (ratio >= 0.75) {
		return "bg-[var(--color-danger-bg)] text-[var(--color-danger)]";
	}
	if (ratio >= 0.45) {
		return "bg-[var(--color-warning-bg)] text-[var(--color-warning)]";
	}
	return "bg-[var(--color-success-bg)] text-[var(--color-success)]";
}

function formatDayLabel(date: string): string {
	return new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "2-digit" }).format(
		new Date(`${date}T00:00:00.000Z`),
	);
}

export const TechnicianWorkloadHeatmap = memo(function TechnicianWorkloadHeatmap({
	data,
	loading,
}: TechnicianWorkloadHeatmapProps) {
	const dayKeys = Array.from(new Set(data.flatMap((row) => Object.keys(row.days)))).sort();
	const maxValue = data.reduce((max, row) => {
		const rowMax = Math.max(...Object.values(row.days), 0);
		return Math.max(max, rowMax);
	}, 0);

	if (data.length === 0 || dayKeys.length === 0) {
		return (
			<ChartCard title="Carga por técnico" subtitle="Mapa de calor operativo" loading={loading}>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin asignaciones recientes
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard title="Carga por técnico" subtitle="Distribución de OTs asignadas por día">
			<div className="overflow-x-auto">
				<table className="min-w-[720px] border-separate border-spacing-2">
					<caption className="sr-only">Carga de trabajo por técnico</caption>
					<thead>
						<tr className="text-xs font-semibold text-[var(--text-secondary)]">
							<th scope="col" className="w-44 text-left">
								Técnico
							</th>
							{dayKeys.map((day) => (
								<th key={day} scope="col" className="min-w-10 text-center capitalize">
									{formatDayLabel(day)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.slice(0, 8).map((row) => (
							<tr key={row.technicianId}>
								<th
									scope="row"
									className="max-w-44 truncate text-left text-sm font-medium text-[var(--text-primary)]"
								>
									{row.technicianName}
								</th>
								{dayKeys.map((day) => {
									const value = row.days[day] ?? 0;
									return (
										<td
											key={`${row.technicianId}-${day}`}
											className={`h-9 rounded-[var(--radius-md)] text-center text-xs font-bold align-middle ${getIntensityClass(value, maxValue)}`}
											aria-label={`${row.technicianName}, ${formatDayLabel(day)}: ${value} órdenes`}
										>
											{value}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ChartCard>
	);
});
