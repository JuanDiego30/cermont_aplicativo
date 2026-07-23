"use client";

import { Target, Timer, Users, Wrench } from "lucide-react";
import { KPIStatCard } from "./KPIStatCard";

interface Props {
	mttr: number;
	mtbf: number;
	ftr: number;
	utilization: number;
}

export function DashboardKPIWidgets({ mttr, mtbf, ftr, utilization }: Props) {
	return (
		<div data-testid="dashboard-kpi-widgets" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<KPIStatCard
				icon={Timer}
				value={mttr === 0 ? "N/A" : `${mttr} min`}
				label="MTTR — Tiempo medio de reparación"
				tooltip="Mean Time To Repair: tiempo promedio para resolver una orden desde que se reporta"
				trend={mttr > 0 && mttr < 60 ? { value: 10, isPositive: true } : undefined}
			/>
			<KPIStatCard
				icon={Wrench}
				value={mtbf === 0 ? "N/A" : `${mtbf} días`}
				label="MTBF — Tiempo medio entre fallos"
				tooltip="Mean Time Between Failures: días promedio entre intervenciones correctivas"
				trend={mtbf > 0 && mtbf > 90 ? { value: 5, isPositive: true } : undefined}
			/>
			<KPIStatCard
				icon={Target}
				value={`${ftr}%`}
				label="FTR — First Time Fix Rate"
				tooltip="Porcentaje de órdenes resueltas en la primera visita, sin retornos"
				trend={ftr > 0 ? (ftr >= 75 ? { value: 3, isPositive: true } : { value: 5, isPositive: false }) : undefined}
			/>
			<KPIStatCard
				icon={Users}
				value={`${utilization}%`}
				label="Utilización de técnicos"
				tooltip="Porcentaje de tiempo productivo del equipo técnico sobre el total disponible"
			/>
		</div>
	);
}
