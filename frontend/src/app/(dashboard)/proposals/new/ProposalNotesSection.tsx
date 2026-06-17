"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProposalFormValues } from "./proposal-form-schema";

interface ProposalNotesSectionProps {
	register: UseFormRegister<ProposalFormValues>;
	errors: FieldErrors<ProposalFormValues>;
}

export function ProposalNotesSection({ register, errors }: ProposalNotesSectionProps) {
	return (
		<section
			className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
			aria-labelledby="notes-section-title"
		>
			<h2 id="notes-section-title" className="text-base font-semibold text-[var(--text-primary)]">
				Notas y Términos
			</h2>
			<div className="mt-4">
				<label htmlFor="notes" className="block text-sm font-medium text-[var(--text-secondary)]">
					Notas adicionales
				</label>
				<textarea
					id="notes"
					rows={4}
					{...register("notes")}
					placeholder="Condiciones de pago, tiempo de entrega, garantías, etc."
					className="input-field mt-1"
				/>
				{errors.notes?.message && (
					<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
						{errors.notes.message}
					</p>
				)}
			</div>
		</section>
	);
}
