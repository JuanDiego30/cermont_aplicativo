"use client";

import type { PlanningBusinessUnit } from "@cermont/shared-types";
import { Loader2, Package } from "lucide-react";
import { BUSINESS_UNIT_OPTIONS, KIT_SUGGESTIONS } from "./constants";
import { FormField } from "./shared-components";

export interface InheritedFieldDef {
	key: string;
	label: string;
	value: string;
	sourceStepLabel: string;
}

interface PlanningPacketBasicInfoProps {
	responsibleName: string;
	onResponsibleNameChange: (value: string) => void;
	place: string;
	onPlaceChange: (value: string) => void;
	plannedDate: string;
	onPlannedDateChange: (value: string) => void;
	businessUnit: PlanningBusinessUnit;
	onBusinessUnitChange: (value: PlanningBusinessUnit) => void;
	scope: string;
	onScopeChange: (value: string) => void;
	inheritedLocation: string;
	inheritedWorkTypeName: string;
	isContextLoading: boolean;
	autoSuggestedKey: string;
	kitSuggestionKey: string;
	onApplyKitSuggestion: () => void;
	inheritedFields: InheritedFieldDef[];
}

export function PlanningPacketBasicInfo({
	responsibleName,
	onResponsibleNameChange,
	place,
	onPlaceChange,
	plannedDate,
	onPlannedDateChange,
	businessUnit,
	onBusinessUnitChange,
	scope,
	onScopeChange,
	inheritedLocation,
	inheritedWorkTypeName,
	isContextLoading,
	autoSuggestedKey,
	kitSuggestionKey,
	onApplyKitSuggestion,
	inheritedFields,
}: PlanningPacketBasicInfoProps) {
	if (isContextLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
			</div>
		);
	}

	return (
		<>
			{/* Inherited context banner */}
			{inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
						Datos heredados del caso
					</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{inheritedFields.map((f) => (
							<div key={f.key} className="rounded-[var(--radius-md)] bg-background/70 px-3 py-2">
								<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
									{f.label}
								</p>
								<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)] truncate">
									{f.value}
								</p>
								<p className="text-[9px] text-[var(--color-brand)]">↑ {f.sourceStepLabel}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Kit suggestion banner */}
			{(autoSuggestedKey || kitSuggestionKey) && (
				<div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-4">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-sm font-semibold text-amber-900">
								Kit típico sugerido para: {inheritedWorkTypeName}
							</p>
							<p className="mt-0.5 text-xs text-amber-700">
								{KIT_SUGGESTIONS[autoSuggestedKey || kitSuggestionKey]?.label}
							</p>
						</div>
						<button
							type="button"
							onClick={onApplyKitSuggestion}
							className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
						>
							<Package className="size-3.5" />
							Aplicar kit
						</button>
					</div>
				</div>
			)}

			{/* General data */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
				<h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Datos generales</h2>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="Responsable de inspección" required htmlFor="responsible-name">
						<input
							id="responsible-name"
							type="text"
							value={responsibleName}
							onChange={(e) => onResponsibleNameChange(e.target.value)}
							placeholder="ING. RESIDENTE / SUPERVISOR"
							className="field-input"
							aria-label="Responsable de inspección"
						/>
					</FormField>
					<FormField label="Lugar / sitio" required htmlFor="place">
						<input
							id="place"
							type="text"
							value={place}
							onChange={(e) => onPlaceChange(e.target.value)}
							placeholder={inheritedLocation || "Ubicación de ejecución"}
							className="field-input"
							aria-label="Lugar / sitio"
						/>
					</FormField>
					<FormField label="Fecha planeada" htmlFor="planned-date">
						<input
							id="planned-date"
							type="datetime-local"
							value={plannedDate}
							onChange={(e) => onPlannedDateChange(e.target.value)}
							className="field-input"
							aria-label="Fecha planeada"
						/>
					</FormField>
					<FormField label="Unidad de negocio" required>
						<select
							id="businessUnit"
							value={businessUnit}
							onChange={(e) => onBusinessUnitChange(e.target.value as PlanningBusinessUnit)}
							className="field-input"
							aria-label="Unidad de negocio"
						>
							{BUSINESS_UNIT_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</FormField>
				</div>
				<div className="mt-4">
					<FormField label="Alcance de la actividad" required htmlFor="scope">
						<textarea
							id="scope"
							value={scope}
							onChange={(e) => onScopeChange(e.target.value)}
							rows={3}
							placeholder="Descripción detallada del alcance de la obra/actividad..."
							className="field-input resize-none"
							aria-label="Alcance de la actividad"
						/>
						<p className="mt-1 text-xs text-[var(--text-muted)]">
							Mínimo 20 caracteres. {scope.length}/3000
						</p>
					</FormField>
				</div>
			</div>
		</>
	);
}
