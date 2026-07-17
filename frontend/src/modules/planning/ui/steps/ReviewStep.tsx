"use client";

import type {
	PlanningEquipment,
	PlanningResourceLine,
	PlanningResponsible,
	PlanningTool,
	RequiredCertification,
	WorkerRequirements,
} from "@cermont/shared-types";
import { Calendar, MapPin, Tag, UserCheck } from "lucide-react";
import { AppIcon } from "@/core/ui/AppIcon";
import { PlanningReadinessGate } from "../PlanningReadinessGate";
import { localeDateTime } from "@/lib/utils/format-date";

interface ReviewStepProps {
	place: string;
	plannedDate: string;
	businessUnit: string;
	responsibleName: string;
	scope: string;
	materials: PlanningResourceLine[];
	tools: PlanningTool[];
	equipment: PlanningEquipment[];
	safetyElements: PlanningResourceLine[];
	workerReqs: WorkerRequirements;
	responsibles: PlanningResponsible[];
	certifications: RequiredCertification[];
	astRequired: boolean;
	ptwRequired: boolean;
	planningNotes: string;
}

export function ReviewStep({
	place,
	plannedDate,
	businessUnit,
	responsibleName,
	scope,
	materials,
	tools,
	equipment,
	safetyElements,
	workerReqs,
	responsibles,
	certifications,
	astRequired,
	ptwRequired,
	planningNotes,
}: ReviewStepProps) {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold text-[var(--text-primary)]">
					Paso 5: Revisión de Readiness y Envío
				</h2>
				<p className="text-sm text-[var(--text-secondary)]">
					Examine el resumen del paquete de planeación antes de guardarlo en el sistema.
				</p>
			</div>

			{/* Dynamic Readiness Gate */}
			<PlanningReadinessGate
				place={place}
				plannedDate={plannedDate}
				scope={scope}
				materials={materials}
				tools={tools}
				equipment={equipment}
				safetyElements={safetyElements}
				workerReqs={workerReqs}
				responsibles={responsibles}
				certifications={certifications}
				astRequired={astRequired}
				ptwRequired={ptwRequired}
				isLoading={false}
			/>

			{/* Summary Details Grid */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Basic Info Summary */}
				<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 space-y-3">
					<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
						Información Básica
					</h3>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
							<AppIcon icon={MapPin} size="xs" />
							<span>
								Lugar:{" "}
								<strong className="text-[var(--text-primary)]">{place || "No definido"}</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
							<AppIcon icon={Calendar} size="xs" />
							<span>
								Fecha Planificada:{" "}
								<strong className="text-[var(--text-primary)]">
									{plannedDate ? localeDateTime(plannedDate) : "No definida"}
								</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
							<AppIcon icon={Tag} size="xs" />
							<span>
								Unidad de Negocio:{" "}
								<strong className="text-[var(--text-primary)]">{businessUnit}</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
							<AppIcon icon={UserCheck} size="xs" />
							<span>
								Inspector HES:{" "}
								<strong className="text-[var(--text-primary)]">
									{responsibleName || "No definido"}
								</strong>
							</span>
						</div>
					</div>

					<div className="border-t border-[var(--border-subtle)] pt-2 mt-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
							Alcance Detallado
						</p>
						<p className="text-xs text-[var(--text-secondary)] line-clamp-3 italic">
							{scope || "Sin alcance definido"}
						</p>
					</div>
				</div>

				{/* Resource Summaries */}
				<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 space-y-3">
					<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
						Resumen de Recursos
					</h3>

					<div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
						<div className="rounded-xl bg-[var(--surface-secondary)]/50 p-2.5">
							<p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
								Materiales
							</p>
							<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
								{materials.filter((m) => m.description).length} ítems
							</p>
						</div>
						<div className="rounded-xl bg-[var(--surface-secondary)]/50 p-2.5">
							<p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
								Herramientas
							</p>
							<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
								{tools.filter((t) => t.name).length} ítems
							</p>
						</div>
						<div className="rounded-xl bg-[var(--surface-secondary)]/50 p-2.5">
							<p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
								Equipos
							</p>
							<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
								{equipment.filter((e) => e.name).length} ítems
							</p>
						</div>
						<div className="rounded-xl bg-[var(--surface-secondary)]/50 p-2.5">
							<p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
								EPP
							</p>
							<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
								{safetyElements.filter((s) => s.description).length} ítems
							</p>
						</div>
					</div>

					<div className="border-t border-[var(--border-subtle)] pt-2 mt-2">
						<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
							Observaciones HES
						</p>
						<p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">
							{planningNotes || "Ninguna observación adicional."}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
