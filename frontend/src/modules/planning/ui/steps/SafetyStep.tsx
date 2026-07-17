"use client";

import { FileWarning, Shield } from "lucide-react";
import { AppIcon } from "@/core/ui/AppIcon";

interface SafetyStepProps {
	astRequired: boolean;
	onAstRequiredChange: (val: boolean) => void;
	ptwRequired: boolean;
	onPtwRequiredChange: (val: boolean) => void;
	planningNotes: string;
	onPlanningNotesChange: (val: string) => void;
}

export function SafetyStep({
	astRequired,
	onAstRequiredChange,
	ptwRequired,
	onPtwRequiredChange,
	planningNotes,
	onPlanningNotesChange,
}: SafetyStepProps) {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold text-[var(--text-primary)]">
					Paso 3: Seguridad Industrial (HSE)
				</h2>
				<p className="text-sm text-[var(--text-secondary)]">
					Indique los requisitos de seguridad obligatorios, permisos de trabajo y análisis de
					riesgos en campo.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{/* AST Box */}
				<button
					type="button"
					onClick={() => onAstRequiredChange(!astRequired)}
					className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
						astRequired
							? "border-[var(--color-success)] bg-[var(--color-success-bg)]/30"
							: "border-[var(--border-subtle)] bg-[var(--surface-primary)]"
					}`}
				>
					<span
						className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
							astRequired
								? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
								: "bg-[var(--surface-secondary)] text-[var(--text-muted)]"
						}`}
					>
						<AppIcon icon={Shield} size="md" variant={astRequired ? "success" : "default"} />
					</span>
					<div>
						<h3 className="text-sm font-semibold text-[var(--text-primary)]">AST Requerido</h3>
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							Análisis Seguro de Trabajo. Requerido para la identificación de peligros y control de
							riesgos específicos.
						</p>
						<span
							className={`mt-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
								astRequired ? "text-[var(--color-success)]" : "text-[var(--text-muted)]"
							}`}
						>
							{astRequired ? "Habilitado" : "No Requerido"}
						</span>
					</div>
				</button>

				{/* PTW Box */}
				<button
					type="button"
					onClick={() => onPtwRequiredChange(!ptwRequired)}
					className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
						ptwRequired
							? "border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)]/40"
							: "border-[var(--border-subtle)] bg-[var(--surface-primary)]"
					}`}
				>
					<span
						className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
							ptwRequired
								? "bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]"
								: "bg-[var(--surface-secondary)] text-[var(--text-muted)]"
						}`}
					>
						<AppIcon icon={FileWarning} size="md" variant={ptwRequired ? "brand" : "default"} />
					</span>
					<div>
						<h3 className="text-sm font-semibold text-[var(--text-primary)]">
							Permiso de Trabajo (PTW)
						</h3>
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							Permiso de Trabajo en Caliente, Frío, Altura, Espacio Confinado o Excavación.
						</p>
						<span
							className={`mt-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
								ptwRequired ? "text-[var(--color-brand)]" : "text-[var(--text-muted)]"
							}`}
						>
							{ptwRequired ? "Habilitado" : "No Requerido"}
						</span>
					</div>
				</button>
			</div>

			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="planningNotes"
					className="text-sm font-semibold text-[var(--text-secondary)]"
				>
					Observaciones y Recomendaciones HES / HSE
				</label>
				<textarea
					id="planningNotes"
					value={planningNotes}
					onChange={(e) => onPlanningNotesChange(e.target.value)}
					rows={4}
					className="w-full rounded-[var(--radius-input)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-focus-ring)] focus:outline-none transition-colors"
					placeholder="Ingrese notas adicionales de seguridad, precauciones particulares, uso de EPP especial o condiciones ambientales..."
				/>
			</div>
		</div>
	);
}
