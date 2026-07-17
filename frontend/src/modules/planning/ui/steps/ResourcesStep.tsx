"use client";

import type {
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	WorkerRequirements,
} from "@cermont/shared-types";
import { Hammer, Package, Shield, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { AppIcon } from "@/core/ui/AppIcon";
import { EquipmentTab } from "./tabs/EquipmentTab";
import { MaterialsTab } from "./tabs/MaterialsTab";
import { SafetyTab } from "./tabs/SafetyTab";
import { ToolsTab } from "./tabs/ToolsTab";
import { WorkersTab } from "./tabs/WorkersTab";

interface ResourcesStepProps {
	materials: PlanningResourceLine[];
	onMaterialsChange: (value: PlanningResourceLine[]) => void;
	tools: PlanningTool[];
	onToolsChange: (value: PlanningTool[]) => void;
	equipment: PlanningEquipment[];
	onEquipmentChange: (value: PlanningEquipment[]) => void;
	safetyElements: PlanningResourceLine[];
	onSafetyElementsChange: (value: PlanningResourceLine[]) => void;
	workerReqs: WorkerRequirements;
	onWorkerReqsChange: (value: WorkerRequirements) => void;
}

const TAB_DEFINITIONS = [
	{ id: "materials", label: "Materiales", icon: Package },
	{ id: "tools", label: "Herramientas", icon: Wrench },
	{ id: "equipment", label: "Equipos", icon: Hammer },
	{ id: "safety", label: "EPP / Seguridad", icon: Shield },
	{ id: "workers", label: "Personal", icon: Users },
] as const;

type TabType = (typeof TAB_DEFINITIONS)[number]["id"];

export function ResourcesStep({
	materials,
	onMaterialsChange,
	tools,
	onToolsChange,
	equipment,
	onEquipmentChange,
	safetyElements,
	onSafetyElementsChange,
	workerReqs,
	onWorkerReqsChange,
}: ResourcesStepProps) {
	const [activeTab, setActiveTab] = useState<TabType>("materials");
	const tabCounts: Record<TabType, number> = {
		materials: materials.length,
		tools: tools.length,
		equipment: equipment.length,
		safety: safetyElements.length,
		workers: Object.values(workerReqs).reduce((total, count) => total + count, 0),
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold text-[var(--text-primary)]">
					Paso 2: Asignación de Recursos
				</h2>
				<p className="text-sm text-[var(--text-secondary)]">
					Defina materiales, herramientas, equipos, EPP y personal necesarios para la ejecución.
				</p>
			</div>

			<div className="flex flex-wrap gap-1 border-b border-[var(--border-subtle)] pb-px">
				{TAB_DEFINITIONS.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							aria-pressed={isActive}
							className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all duration-250 ${isActive ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
						>
							<AppIcon icon={tab.icon} size="sm" variant={isActive ? "brand" : "default"} aria-hidden="true" />
							<span>{tab.label}</span>
							{tabCounts[tab.id] > 0 && (
								<span
									className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? "bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]" : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"}`}
								>
									{tabCounts[tab.id]}
								</span>
							)}
						</button>
					);
				})}
			</div>

			<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
				{activeTab === "materials" && (
					<MaterialsTab materials={materials} onMaterialsChange={onMaterialsChange} />
				)}
				{activeTab === "tools" && <ToolsTab tools={tools} onToolsChange={onToolsChange} />}
				{activeTab === "equipment" && (
					<EquipmentTab equipment={equipment} onEquipmentChange={onEquipmentChange} />
				)}
				{activeTab === "safety" && (
					<SafetyTab
						safetyElements={safetyElements}
						onSafetyElementsChange={onSafetyElementsChange}
					/>
				)}
				{activeTab === "workers" && (
					<WorkersTab workerReqs={workerReqs} onWorkerReqsChange={onWorkerReqsChange} />
				)}
			</div>
		</div>
	);
}
