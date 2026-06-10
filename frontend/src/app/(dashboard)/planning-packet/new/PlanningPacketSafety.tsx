"use client";

import type { PlanningResourceLine } from "@cermont/shared-types";
import { Shield } from "lucide-react";
import { emptySafetyEl } from "./constants";
import { CollapsibleSection, FormField, ResourceTable } from "./shared-components";

interface PlanningPacketSafetyProps {
	safetyElements: PlanningResourceLine[];
	onSafetyElementsChange: (elements: PlanningResourceLine[]) => void;
	astRequired: boolean;
	onAstRequiredChange: (value: boolean) => void;
	ptwRequired: boolean;
	onPtwRequiredChange: (value: boolean) => void;
	planningNotes: string;
	onPlanningNotesChange: (value: string) => void;
	expandedSections: Record<string, boolean>;
	onToggleSection: (key: string) => void;
}

export function PlanningPacketSafety({
	safetyElements,
	onSafetyElementsChange,
	astRequired,
	onAstRequiredChange,
	ptwRequired,
	onPtwRequiredChange,
	planningNotes,
	onPlanningNotesChange,
	expandedSections,
	onToggleSection,
}: PlanningPacketSafetyProps) {
	return (
		<>
			{/* Safety elements */}
			<CollapsibleSection
				icon={<Shield className="size-4" />}
				title="Elementos de seguridad (EPP)"
				count={safetyElements.length}
				expanded={expandedSections.safety}
				onToggle={() => onToggleSection("safety")}
			>
				<ResourceTable
					rows={safetyElements}
					columns={["Descripción", "Cantidad", "Unidad"]}
					onAdd={() => onSafetyElementsChange([...safetyElements, emptySafetyEl()])}
					onRemove={(i) => onSafetyElementsChange(safetyElements.filter((_, idx) => idx !== i))}
					renderRow={(row, i) => (
						<>
							<input
								type="text"
								value={row.description}
								onChange={(e) => {
									const updated = [...safetyElements];
									updated[i] = { ...row, description: e.target.value };
									onSafetyElementsChange(updated);
								}}
								placeholder="EPP / Elemento de seguridad"
								className="field-input text-sm"
								aria-label={`EPP, fila ${i + 1} — descripción`}
							/>
							<input
								type="number"
								min={1}
								value={row.quantity}
								onChange={(e) => {
									const updated = [...safetyElements];
									updated[i] = { ...row, quantity: Number(e.target.value) };
									onSafetyElementsChange(updated);
								}}
								className="field-input w-20 text-sm"
								aria-label={`EPP, fila ${i + 1} — cantidad`}
							/>
							<input
								type="text"
								value={row.unit ?? "und"}
								onChange={(e) => {
									const updated = [...safetyElements];
									updated[i] = { ...row, unit: e.target.value };
									onSafetyElementsChange(updated);
								}}
								placeholder="und"
								className="field-input w-20 text-sm"
								aria-label={`EPP, fila ${i + 1} — unidad`}
							/>
						</>
					)}
				/>
			</CollapsibleSection>

			{/* Documents required */}
			<CollapsibleSection
				icon={<Shield className="size-4" />}
				title="Documentos de apoyo requeridos"
				expanded={expandedSections.docs}
				onToggle={() => onToggleSection("docs")}
			>
				<div className="grid gap-3 sm:grid-cols-2">
					<label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3 cursor-pointer">
						<input
							type="checkbox"
							checked={astRequired}
							onChange={(e) => onAstRequiredChange(e.target.checked)}
							className="size-4 rounded"
						/>
						<div>
							<p className="text-sm font-medium text-[var(--text-primary)]">
								ATS (Análisis de Trabajo Seguro)
							</p>
							<p className="text-xs text-[var(--text-muted)]">Requerido para tareas de riesgo</p>
						</div>
					</label>
					<label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3 cursor-pointer">
						<input
							type="checkbox"
							checked={ptwRequired}
							onChange={(e) => onPtwRequiredChange(e.target.checked)}
							className="size-4 rounded"
						/>
						<div>
							<p className="text-sm font-medium text-[var(--text-primary)]">
								PTW (Permiso de Trabajo)
							</p>
							<p className="text-xs text-[var(--text-muted)]">Permiso formal de trabajo</p>
						</div>
					</label>
				</div>
			</CollapsibleSection>

			{/* Notes */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
				<FormField label="Observaciones adicionales" htmlFor="planning-notes">
					<textarea
						id="planning-notes"
						value={planningNotes}
						onChange={(e) => onPlanningNotesChange(e.target.value)}
						rows={3}
						placeholder="Notas, consideraciones especiales, restricciones del sitio..."
						className="field-input resize-none"
						aria-label="Observaciones adicionales"
					/>
				</FormField>
			</div>
		</>
	);
}
