"use client";

import { Activity, CheckCircle2, Package2, Wrench } from "lucide-react";
import { KPICard } from "@/dashboard/ui/KPICard";

interface MaintenanceKPICardsProps {
	totalKits: number;
	activeKits: number;
	toolEntries: number;
	equipmentEntries: number;
}

export function MaintenanceKPICards({
	totalKits,
	activeKits,
	toolEntries,
	equipmentEntries,
}: MaintenanceKPICardsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<KPICard title="Kits visibles" value={totalKits} icon={Package2} />
			<KPICard title="Kits activos" value={activeKits} icon={CheckCircle2} />
			<KPICard title="Herramientas" value={toolEntries} icon={Wrench} />
			<KPICard title="Equipos" value={equipmentEntries} icon={Activity} />
		</div>
	);
}
