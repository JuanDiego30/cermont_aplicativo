"use client";

/**
 * CustomFieldEditor — Formulario admin para crear/editar definiciones
 * de campos personalizados por tipo de entidad.
 */

import type { CreateCustomFieldDefinitionDto, CustomFieldDefinition } from "@cermont/shared-types";
import { useId, useReducer } from "react";

const DATA_TYPE_LABELS: Record<string, string> = {
	text: "Texto",
	number: "Número",
	boolean: "Sí / No",
	select: "Lista de opciones",
	date: "Fecha",
};

interface CustomFieldFormState {
	name: string;
	label: string;
	description: string;
	dataType: CreateCustomFieldDefinitionDto["dataType"];
	optionsText: string;
	required: boolean;
	order: number;
	isActive: boolean;
	formError: string;
}

type CustomFieldFormAction =
	| {
			type: "SET";
			field: keyof Omit<CustomFieldFormState, "formError">;
			value: string | number | boolean;
	  }
	| { type: "SET_ERROR"; message: string };

function customFieldReducer(
	state: CustomFieldFormState,
	action: CustomFieldFormAction,
): CustomFieldFormState {
	switch (action.type) {
		case "SET":
			return { ...state, [action.field]: action.value };
		case "SET_ERROR":
			return { ...state, formError: action.message };
	}
}

function createCustomFieldInitialState(initial?: CustomFieldDefinition): CustomFieldFormState {
	return {
		name: initial?.name ?? "",
		label: initial?.label ?? "",
		description: initial?.description ?? "",
		dataType: initial?.dataType ?? "text",
		optionsText: (initial?.options ?? []).join("\n"),
		required: initial?.validation?.required ?? false,
		order: initial?.order ?? 0,
		isActive: initial?.isActive ?? true,
		formError: "",
	};
}

interface CustomFieldEditorProps {
	entityType: CreateCustomFieldDefinitionDto["entityType"];
	initial?: CustomFieldDefinition;
	isSaving: boolean;
	onSave: (input: CreateCustomFieldDefinitionDto) => void;
	onCancel: () => void;
}

export function CustomFieldEditor({
	entityType,
	initial,
	isSaving,
	onSave,
	onCancel,
}: CustomFieldEditorProps) {
	const formId = useId();
	const [form, dispatch] = useReducer(customFieldReducer, initial, createCustomFieldInitialState);

	const { name, label, description, dataType, optionsText, required, order, isActive, formError } =
		form;

	const inputClasses =
		"w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]";

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		dispatch({ type: "SET_ERROR", message: "" });

		if (!/^[a-zA-Z0-9_]{2,50}$/.test(name)) {
			dispatch({
				type: "SET_ERROR",
				message: "El nombre interno debe tener 2-50 caracteres: letras, números o guion bajo.",
			});
			return;
		}
		if (label.trim().length < 2) {
			dispatch({ type: "SET_ERROR", message: "La etiqueta debe tener al menos 2 caracteres." });
			return;
		}
		const options = optionsText
			.split("\n")
			.map((opt) => opt.trim())
			.filter((opt) => opt.length > 0);
		if (dataType === "select" && options.length === 0) {
			dispatch({
				type: "SET_ERROR",
				message: "Una lista de opciones requiere al menos una opción.",
			});
			return;
		}

		onSave({
			entityType,
			name,
			label: label.trim(),
			...(description.trim() ? { description: description.trim() } : {}),
			dataType,
			...(dataType === "select" ? { options } : {}),
			validation: { required },
			isActive,
			order,
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
			aria-label={initial ? "Editar campo personalizado" : "Nuevo campo personalizado"}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-name`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Nombre interno
					</label>
					<input
						id={`${formId}-name`}
						value={name}
						onChange={(e) => dispatch({ type: "SET", field: "name", value: e.target.value })}
						placeholder="numero_contrato"
						disabled={Boolean(initial)}
						className={`${inputClasses} disabled:opacity-60`}
						aria-label="Nombre interno"
						required
					/>
				</div>
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-label`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Etiqueta visible
					</label>
					<input
						id={`${formId}-label`}
						value={label}
						onChange={(e) => dispatch({ type: "SET", field: "label", value: e.target.value })}
						placeholder="Número de contrato"
						className={inputClasses}
						aria-label="Etiqueta visible"
						required
					/>
				</div>
			</div>

			<div className="space-y-1">
				<label
					htmlFor={`${formId}-description`}
					className="text-sm font-medium text-[var(--text-primary)]"
				>
					Descripción (opcional)
				</label>
				<input
					id={`${formId}-description`}
					value={description}
					onChange={(e) => dispatch({ type: "SET", field: "description", value: e.target.value })}
					className={inputClasses}
					aria-label="Descripción (opcional)"
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-dataType`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Tipo de dato
					</label>
					<select
						id={`${formId}-dataType`}
						value={dataType}
						onChange={(e) =>
							dispatch({
								type: "SET",
								field: "dataType",
								value: e.target.value as CreateCustomFieldDefinitionDto["dataType"],
							})
						}
						className={inputClasses}
					>
						{Object.entries(DATA_TYPE_LABELS).map(([value, typeLabel]) => (
							<option key={value} value={value}>
								{typeLabel}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-order`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Orden
					</label>
					<input
						id={`${formId}-order`}
						type="number"
						inputMode="numeric"
						value={order}
						onChange={(e) =>
							dispatch({ type: "SET", field: "order", value: Number(e.target.value) })
						}
						className={inputClasses}
						aria-label="Orden"
					/>
				</div>
				<fieldset className="space-y-2 pt-6">
					<label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
						<input
							type="checkbox"
							checked={required}
							onChange={(e) =>
								dispatch({ type: "SET", field: "required", value: e.target.checked })
							}
							className="size-4 rounded border-[var(--border-default)]"
						/>
						Obligatorio
					</label>
					<label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
						<input
							type="checkbox"
							checked={isActive}
							onChange={(e) =>
								dispatch({ type: "SET", field: "isActive", value: e.target.checked })
							}
							className="size-4 rounded border-[var(--border-default)]"
						/>
						Activo
					</label>
				</fieldset>
			</div>

			{dataType === "select" && (
				<div className="space-y-1">
					<label
						htmlFor={`${formId}-options`}
						className="text-sm font-medium text-[var(--text-primary)]"
					>
						Opciones (una por línea)
					</label>
					<textarea
						id={`${formId}-options`}
						value={optionsText}
						onChange={(e) => dispatch({ type: "SET", field: "optionsText", value: e.target.value })}
						rows={4}
						className={inputClasses}
						aria-label="Opciones (una por línea)"
					/>
				</div>
			)}

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
					{isSaving ? "Guardando..." : initial ? "Guardar cambios" : "Crear campo"}
				</button>
			</div>
		</form>
	);
}
