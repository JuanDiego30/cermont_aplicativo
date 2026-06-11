"use client";

/**
 * ASTForm — Creación de un AST paso a paso con peligros y controles.
 */

import type { CreateAST } from "@cermont/shared-types";
import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";

interface ASTStepDraft {
	taskDescription: string;
	hazards: string;
	controls: string;
}

interface ASTFormProps {
	orderId: string;
	isSaving: boolean;
	onSubmit: (input: CreateAST) => void;
	onCancel: () => void;
}

export function ASTForm({ orderId, isSaving, onSubmit, onCancel }: ASTFormProps) {
	const formId = useId();
	const [workDescription, setWorkDescription] = useState("");
	const [location, setLocation] = useState("");
	const [crewLeader, setCrewLeader] = useState("");
	const [crewMembersText, setCrewMembersText] = useState("");
	const [ppeText, setPpeText] = useState("");
	const [steps, setSteps] = useState<ASTStepDraft[]>([
		{ taskDescription: "", hazards: "", controls: "" },
	]);
	const [formError, setFormError] = useState("");

	const inputClasses =
		"w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]";

	function splitList(value: string): string[] {
		return value
			.split(/[;,\n]/)
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");

		if (!workDescription.trim() || !location.trim() || !crewLeader.trim()) {
			setFormError("Descripción del trabajo, lugar y líder de cuadrilla son obligatorios.");
			return;
		}
		const validSteps = steps.filter((step) => step.taskDescription.trim().length > 0);
		if (validSteps.length === 0) {
			setFormError("Agrega al menos un paso de la tarea.");
			return;
		}

		onSubmit({
			orderId,
			workDescription: workDescription.trim(),
			location: location.trim(),
			date: new Date().toISOString(),
			crewLeader: crewLeader.trim(),
			crewMembers: splitList(crewMembersText),
			steps: validSteps.map((step, index) => ({
				stepNumber: index + 1,
				taskDescription: step.taskDescription.trim(),
				hazards: splitList(step.hazards),
				controls: splitList(step.controls),
			})),
			ppeRequired: splitList(ppeText),
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
			aria-label="Nuevo AST"
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1 sm:col-span-2">
					<label
						htmlFor={`${formId}-work`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Descripción del trabajo
					</label>
					<input
						id={`${formId}-work`}
						value={workDescription}
						onChange={(e) => setWorkDescription(e.target.value)}
						placeholder="Mantenimiento preventivo CCTV torre 9"
						className={inputClasses}
						required
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-location`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Lugar
					</label>
					<input
						id={`${formId}-location`}
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder="Caño Limón"
						className={inputClasses}
						required
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-leader`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Líder de cuadrilla
					</label>
					<input
						id={`${formId}-leader`}
						value={crewLeader}
						onChange={(e) => setCrewLeader(e.target.value)}
						className={inputClasses}
						required
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-crew`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Cuadrilla (separados por coma)
					</label>
					<input
						id={`${formId}-crew`}
						value={crewMembersText}
						onChange={(e) => setCrewMembersText(e.target.value)}
						className={inputClasses}
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-ppe`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						EPP requerido (separados por coma)
					</label>
					<input
						id={`${formId}-ppe`}
						value={ppeText}
						onChange={(e) => setPpeText(e.target.value)}
						placeholder="Casco, arnés, guantes dieléctricos"
						className={inputClasses}
					/>
				</div>
			</div>

			<fieldset className="space-y-3">
				<legend className="text-sm font-medium text-[var(--text-primary)]">
					Pasos de la tarea
				</legend>
				{steps.map((step, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no stable id until saved
						key={index}
						className="space-y-2 rounded-[var(--radius-md)] border border-[var(--border-default)] p-3"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-[var(--text-secondary)]">
								Paso {index + 1}
							</span>
							{steps.length > 1 && (
								<button
									type="button"
									onClick={() => setSteps((prev) => prev.filter((_, i) => i !== index))}
									className="rounded-full p-1 text-[var(--text-tertiary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
									aria-label={`Eliminar paso ${index + 1}`}
								>
									<Trash2 className="size-3.5" aria-hidden="true" />
								</button>
							)}
						</div>
						<input
							value={step.taskDescription}
							onChange={(e) =>
								setSteps((prev) =>
									prev.map((s, i) => (i === index ? { ...s, taskDescription: e.target.value } : s)),
								)
							}
							placeholder="Descripción del paso"
							aria-label={`Descripción del paso ${index + 1}`}
							className={inputClasses}
						/>
						<div className="grid gap-2 sm:grid-cols-2">
							<input
								value={step.hazards}
								onChange={(e) =>
									setSteps((prev) =>
										prev.map((s, i) => (i === index ? { ...s, hazards: e.target.value } : s)),
									)
								}
								placeholder="Peligros (separados por ;)"
								aria-label={`Peligros del paso ${index + 1}`}
								className={inputClasses}
							/>
							<input
								value={step.controls}
								onChange={(e) =>
									setSteps((prev) =>
										prev.map((s, i) => (i === index ? { ...s, controls: e.target.value } : s)),
									)
								}
								placeholder="Controles (separados por ;)"
								aria-label={`Controles del paso ${index + 1}`}
								className={inputClasses}
							/>
						</div>
					</div>
				))}
				<button
					type="button"
					onClick={() =>
						setSteps((prev) => [...prev, { taskDescription: "", hazards: "", controls: "" }])
					}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					<Plus className="size-3.5" aria-hidden="true" />
					Agregar paso
				</button>
			</fieldset>

			{formError && (
				<p className="text-sm text-[var(--color-danger)]" role="alert">
					{formError}
				</p>
			)}

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-[var(--radius-lg)] border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={isSaving}
					className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{isSaving ? "Guardando..." : "Crear AST"}
				</button>
			</div>
		</form>
	);
}
