"use client";

import type {
	PlanningBusinessUnit,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	WorkerRequirements,
} from "@cermont/shared-types";
import type { ChangeEvent } from "react";
import { CustomizableSelect } from "@/core/ui/CustomizableSelect";
import { FormField, TextField } from "@/core/ui/FormField";

interface ScheduleStepProps {
	place: string;
	onPlaceChange: (val: string) => void;
	plannedDate: string;
	onPlannedDateChange: (val: string) => void;
	businessUnit: PlanningBusinessUnit;
	onBusinessUnitChange: (val: PlanningBusinessUnit) => void;
	responsibleName: string;
	onResponsibleNameChange: (val: string) => void;
	 scope: string;
	 onScopeChange: (val: string) => void;
	 materials: PlanningResourceLine[];
	 tools: PlanningTool[];
	 equipment: PlanningEquipment[];
	 safetyElements: PlanningResourceLine[];
	 workerReqs: WorkerRequirements;
	 astRequired: boolean;
	 ptwRequired: boolean;
	 requiredSignatureCount: number;
	 inheritedLocation?: string;
	 inheritedWorkTypeName?: string;
}

const BUSINESS_UNIT_OPTIONS = [
	{ value: "IT_MNT", label: "Telecomunicaciones y Sistemas" },
	{ value: "SC", label: "Casos de Servicio" },
	{ value: "GEN", label: "Generación Eléctrica" },
	{ value: "OTROS", label: "Otros Servicios" },
];

export function ScheduleStep({
	place,
	onPlaceChange,
	plannedDate,
	onPlannedDateChange,
	businessUnit,
	onBusinessUnitChange,
	responsibleName,
	onResponsibleNameChange,
	 scope,
	 onScopeChange,
	 materials,
	 tools,
	 equipment,
	 safetyElements,
	 workerReqs,
	 astRequired,
	 ptwRequired,
	 requiredSignatureCount,
	 inheritedLocation,
	 inheritedWorkTypeName,
}: ScheduleStepProps) {
	const resourceCounts = [
		{ label: "Materiales", count: materials.filter((item) => item.description.trim()).length },
		{ label: "Herramientas", count: tools.filter((item) => item.name.trim()).length },
		{ label: "Equipos", count: equipment.filter((item) => item.name.trim()).length },
		{ label: "EPP", count: safetyElements.filter((item) => item.description.trim()).length },
		{
			label: "Personal",
			count:
				(workerReqs.electricistas ?? 0) +
				(workerReqs.tecnicosTelecomunicacion ?? 0) +
				(workerReqs.instrumentistas ?? 0) +
				(workerReqs.obreros ?? 0),
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold text-[var(--text-primary)]">
					Paso 1: Cronograma e Información Básica
				</h2>
				<p className="text-sm text-[var(--text-secondary)]">
					Defina la ubicación, fecha planificada y responsable del paquete de planeación.
				</p>
			</div>

			{inheritedWorkTypeName && (
				<div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-4">
					<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
						Origen del Caso
					</p>
					<p className="mt-1 text-sm text-[var(--text-primary)] font-medium">
						Tipo de Actividad:{" "}
						<span className="text-[var(--color-brand)]">{inheritedWorkTypeName}</span>
					</p>
					{inheritedLocation && (
						<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
							Ubicación Contractual: {inheritedLocation}
						</p>
					)}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField label="Responsable / Inspector HES" required htmlFor="responsibleName">
					<TextField
						id="responsibleName"
						value={responsibleName}
						onChange={(e: ChangeEvent<HTMLInputElement>) => onResponsibleNameChange(e.target.value)}
						placeholder="Ej: Ing. Carlos Mendoza"
					/>
				</FormField>

				<FormField label="Lugar de Trabajo" required htmlFor="place">
					<TextField
						id="place"
						value={place}
						onChange={(e: ChangeEvent<HTMLInputElement>) => onPlaceChange(e.target.value)}
						placeholder="Ej: Estación Banadía, Arauca"
					/>
				</FormField>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField label="Fecha y Hora de Ejecución" required htmlFor="plannedDate">
					<TextField
						id="plannedDate"
						type="datetime-local"
						value={plannedDate}
						onChange={(e: ChangeEvent<HTMLInputElement>) => onPlannedDateChange(e.target.value)}
					/>
				</FormField>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="businessUnit"
						className="text-xs font-semibold text-[var(--text-secondary)]"
					>
						Unidad de Negocio
					</label>
					<CustomizableSelect
						value={businessUnit}
						onChange={(val: string) => onBusinessUnitChange(val as PlanningBusinessUnit)}
						options={BUSINESS_UNIT_OPTIONS}
						className="w-full"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="scope" className="text-xs font-semibold text-[var(--text-secondary)]">
					Alcance Detallado de la Planeación
				</label>
				<textarea
					id="scope"
					value={scope}
					onChange={(e) => onScopeChange(e.target.value)}
					rows={4}
					className="w-full rounded-[var(--radius-input)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-focus-ring)] focus:outline-none transition-colors"
					placeholder="Describa de forma clara y explícita el alcance de las actividades a ejecutar (mínimo 20 caracteres)..."
					required
				/>
					<p className="text-[10px] text-[var(--text-muted)]">
						Caracteres actuales: {scope.length} (Mínimo requerido: 20)
					</p>
				</div>

				<section
					aria-labelledby="planning-summary-title"
					className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-4"
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<h3
								id="planning-summary-title"
								className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
							>
								Resumen de planeación
							</h3>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">
								Visibilidad temprana de recursos y documentos requeridos.
							</p>
						</div>
						<span className="text-xs font-semibold text-[var(--color-brand)]">
							{requiredSignatureCount} firmas requeridas
						</span>
					</div>

					<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
						{resourceCounts.map((resource) => (
							<div
								key={resource.label}
								className="rounded-lg bg-[var(--surface-primary)] px-3 py-2 text-center"
							>
								<p className="text-base font-bold text-[var(--text-primary)]">{resource.count}</p>
								<p className="text-[10px] text-[var(--text-muted)]">{resource.label}</p>
							</div>
						))}
					</div>

					<fieldset className="mt-3 flex flex-wrap gap-2">
						<legend className="sr-only">Documentos requeridos</legend>
						<span
							className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
								astRequired
									? "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
									: "bg-[var(--surface-primary)] text-[var(--text-muted)]"
							}`}
						>
							AST {astRequired ? "requerido" : "no requerido"}
						</span>
						<span
							className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
								ptwRequired
									? "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
									: "bg-[var(--surface-primary)] text-[var(--text-muted)]"
							}`}
						>
							PTW {ptwRequired ? "requerido" : "no requerido"}
						</span>
					</fieldset>
				</section>
			</div>
	);
}
