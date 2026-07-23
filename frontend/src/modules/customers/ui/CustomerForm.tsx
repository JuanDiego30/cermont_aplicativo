"use client";

/**
 * CustomerForm — Alta y edición de clientes (CRM).
 */

import { type Client, type CreateClient, CreateClientSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type CustomerFormInput = z.input<typeof CreateClientSchema>;

const INDUSTRY_OPTIONS = [
	{ value: "hidrocarburos", label: "Hidrocarburos" },
	{ value: "mineria", label: "Minería" },
	{ value: "energia", label: "Energía / Electricidad" },
	{ value: "telecomunicaciones", label: "Telecomunicaciones" },
	{ value: "construccion", label: "Construcción" },
	{ value: "industrial", label: "Industrial / Manufactura" },
	{ value: "gobierno", label: "Gobierno" },
	{ value: "otro", label: "Otro" },
] as const;

const CUSTOMER_FORM_FIELDS: Array<{
	name: keyof CustomerFormInput & string;
	label: string;
	placeholder?: string;
	required?: boolean;
}> = [
	{ name: "name", label: "Razón social", placeholder: "SierraCol Energy", required: true },
	{ name: "nit", label: "NIT", placeholder: "900123456-7", required: true },
	{ name: "contactName", label: "Persona de contacto" },
	{ name: "email", label: "Email" },
	{ name: "phone", label: "Teléfono" },
	{ name: "address", label: "Dirección" },
	{ name: "city", label: "Ciudad" },
	{ name: "industry", label: "Industria", placeholder: "Hidrocarburos" },
];

interface CustomerFormProps {
	initial?: Client;
	isSaving: boolean;
	onSubmit: (input: CreateClient) => void;
	onCancel: () => void;
}

export function CustomerForm({ initial, isSaving, onSubmit, onCancel }: CustomerFormProps) {
	const formId = useId();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CustomerFormInput, Record<string, never>, CreateClient>({
		resolver: zodResolver(CreateClientSchema),
		defaultValues: {
			name: initial?.name ?? "",
			nit: initial?.nit ?? "",
			address: initial?.address ?? "",
			city: initial?.city ?? "",
			industry: initial?.industry ?? "",
			contactName: initial?.contactName ?? "",
			email: initial?.email ?? "",
			phone: initial?.phone ?? "",
			contracts: initial?.contracts ?? [],
			status: initial?.status ?? "active",
			notes: initial?.notes ?? "",
		},
	});

	const inputClasses =
		"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]";

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4"
			aria-label={initial ? "Editar cliente" : "Nuevo cliente"}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				{CUSTOMER_FORM_FIELDS.map((field) => (
					<div key={field.name} className="space-y-1">
						<label
							htmlFor={`${formId}-${field.name}`}
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							{field.label}
							{field.required && (
								<span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
									*
								</span>
							)}
						</label>
						{field.name === "industry" ? (
							<select
								id={`${formId}-${field.name}`}
								{...register(field.name, {
									setValueAs: (value: string) => (value === "" ? undefined : value),
								})}
								className={inputClasses}
								aria-invalid={Boolean(errors[field.name])}
							>
								<option value="">Seleccione una industria</option>
								{INDUSTRY_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						) : (
							<input
								id={`${formId}-${field.name}`}
								{...register(field.name, {
									setValueAs: (value: string) => (value === "" ? undefined : value),
								})}
								placeholder={field.placeholder ?? ""}
								className={inputClasses}
								aria-invalid={Boolean(errors[field.name])}
							/>
						)}
						{errors[field.name] && (
							<p className="text-xs text-[var(--color-danger)]" role="alert">
								{errors[field.name]?.message?.toString() ?? "Campo inválido"}
							</p>
						)}
					</div>
				))}
			</div>

			<div className="space-y-1">
				<label
					htmlFor={`${formId}-notes`}
					className="text-sm font-medium text-[var(--text-primary)]"
				>
					Notas
				</label>
				<textarea
					id={`${formId}-notes`}
					{...register("notes", { setValueAs: (v: string) => (v === "" ? undefined : v) })}
					rows={3}
					className={inputClasses}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={isSaving}
					className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{isSaving ? "Guardando..." : initial ? "Guardar cambios" : "Crear cliente"}
				</button>
			</div>
		</form>
	);
}
