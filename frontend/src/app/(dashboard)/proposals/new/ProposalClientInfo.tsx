"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProposalFormValues } from "./proposal-form-schema";

interface ProposalClientInfoProps {
	register: UseFormRegister<ProposalFormValues>;
	errors: FieldErrors<ProposalFormValues>;
}

export function ProposalClientInfo({ register, errors }: ProposalClientInfoProps) {
	return (
		<section
			className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
			aria-labelledby="client-section-title"
		>
			<h2 id="client-section-title" className="text-base font-semibold text-[var(--text-primary)]">
				Información del Cliente
			</h2>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<div>
					<label
						htmlFor="clientName"
						className="block text-sm font-medium text-[var(--text-secondary)]"
					>
						Cliente <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id="clientName"
						type="text"
						{...register("clientName")}
						placeholder="Nombre del cliente"
						className="input-field mt-1"
					/>
					{errors.clientName && (
						<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
							{errors.clientName.message}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="clientEmail"
						className="block text-sm font-medium text-[var(--text-secondary)]"
					>
						Email
					</label>
					<input
						id="clientEmail"
						type="email"
						{...register("clientEmail")}
						placeholder="cliente@ejemplo.com"
						className="input-field mt-1"
					/>
					{errors.clientEmail && (
						<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
							{errors.clientEmail.message}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="validUntil"
						className="block text-sm font-medium text-[var(--text-secondary)]"
					>
						Válida hasta <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id="validUntil"
						type="date"
						{...register("validUntil")}
						className="input-field mt-1"
					/>
					{errors.validUntil && (
						<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
							{errors.validUntil.message}
						</p>
					)}
				</div>
			</div>
		</section>
	);
}
