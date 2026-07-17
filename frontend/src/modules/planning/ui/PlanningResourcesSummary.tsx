"use client";

/**
 * PlanningResourcesSummary — Displays materials, tools, equipment,
 * safety elements (EPP), and worker requirements for a planning packet.
 */

import type {
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	WorkerRequirements,
} from "@cermont/shared-types";
import { Hammer, HardHat, Package2, Users, Wrench } from "lucide-react";

interface PlanningResourcesSummaryProps {
	materials?: PlanningResourceLine[];
	tools?: PlanningTool[];
	equipment?: PlanningEquipment[];
	safetyElements?: PlanningResourceLine[];
	workerRequirements?: WorkerRequirements;
}

export function PlanningResourcesSummary({
	materials = [],
	tools = [],
	equipment = [],
	safetyElements = [],
	workerRequirements,
}: PlanningResourcesSummaryProps) {
	const totalWorkers = workerRequirements
		? (workerRequirements.electricistas ?? 0) +
			(workerRequirements.tecnicosTelecomunicacion ?? 0) +
			(workerRequirements.instrumentistas ?? 0) +
			(workerRequirements.obreros ?? 0)
		: 0;

	const sections = [
		{
			label: "Materiales",
			icon: Package2,
			count: materials.filter((m) => m.description.trim()).length,
			items: materials.filter((m) => m.description.trim()).slice(0, 8),
			empty: "Sin materiales definidos",
		},
		{
			label: "Herramientas",
			icon: Wrench,
			count: tools.filter((t) => t.name.trim()).length,
			items: tools.filter((t) => t.name.trim()).slice(0, 8),
			empty: "Sin herramientas definidas",
		},
		{
			label: "Equipos",
			icon: Hammer,
			count: equipment.filter((e) => e.name.trim()).length,
			items: equipment.filter((e) => e.name.trim()).slice(0, 8),
			empty: "Sin equipos definidos",
		},
		{
			label: "EPP / Seguridad",
			icon: HardHat,
			count: safetyElements.filter((s) => s.description.trim()).length,
			items: safetyElements.filter((s) => s.description.trim()).slice(0, 8),
			empty: "Sin elementos de seguridad",
		},
	];

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
			<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
				<Users className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
				Recursos
				{totalWorkers > 0 && (
					<span className="rounded-full bg-[var(--color-brand-blue-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand)]">
						{totalWorkers} trabajador(es)
					</span>
				)}
			</h3>

			{workerRequirements && totalWorkers > 0 && (
				<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
					{workerRequirements.electricistas > 0 && (
						<div className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-3 py-2 text-center">
							<p className="text-sm font-bold text-[var(--text-primary)]">
								{workerRequirements.electricistas}
							</p>
							<p className="text-[10px] text-[var(--text-muted)]">Electricistas</p>
						</div>
					)}
					{workerRequirements.tecnicosTelecomunicacion > 0 && (
						<div className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-3 py-2 text-center">
							<p className="text-sm font-bold text-[var(--text-primary)]">
								{workerRequirements.tecnicosTelecomunicacion}
							</p>
							<p className="text-[10px] text-[var(--text-muted)]">Técnicos Telecom</p>
						</div>
					)}
					{workerRequirements.instrumentistas > 0 && (
						<div className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-3 py-2 text-center">
							<p className="text-sm font-bold text-[var(--text-primary)]">
								{workerRequirements.instrumentistas}
							</p>
							<p className="text-[10px] text-[var(--text-muted)]">Instrumentistas</p>
						</div>
					)}
					{workerRequirements.obreros > 0 && (
						<div className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-3 py-2 text-center">
							<p className="text-sm font-bold text-[var(--text-primary)]">
								{workerRequirements.obreros}
							</p>
							<p className="text-[10px] text-[var(--text-muted)]">Obreros</p>
						</div>
					)}
				</div>
			)}

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				{sections.map((section) => (
					<div key={section.label} className="space-y-2">
						<div className="flex items-center gap-2">
							<section.icon className="size-3.5 text-[var(--color-brand)]" aria-hidden="true" />
							<span className="text-[11px] font-semibold text-[var(--text-primary)]">
								{section.label}
								{section.count > 0 && (
									<span className="ml-1 text-[var(--text-muted)]">({section.count})</span>
								)}
							</span>
						</div>
						{section.items.length > 0 ? (
							<ul className="space-y-1">
								{section.items.map((item) => {
									const itemKey =
										"description" in item
											? (item as PlanningResourceLine).description
											: "name" in item
												? (item as PlanningTool).name
												: (item as PlanningEquipment).name;
									return (
										<li
											key={itemKey}
											className="rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-[11px] text-[var(--text-primary)]"
										>
											{itemKey}
											{"quantity" in item && (
												<span className="ml-1 text-[var(--text-muted)]">
													x
													{
														(item as PlanningResourceLine | PlanningTool | PlanningEquipment)
															.quantity
													}
												</span>
											)}
										</li>
									);
								})}
							</ul>
						) : (
							<p className="text-[10px] italic text-[var(--text-muted)]">{section.empty}</p>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
