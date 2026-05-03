"use client";

import { useId, useMemo } from "react";
import { cn } from "@/_shared/lib/utils";

export interface CreatableSelectOption {
	value: string;
	label: string;
}

interface CreatableSelectFieldProps {
	id?: string;
	label: string;
	value: string;
	options: CreatableSelectOption[];
	onValueChange: (value: string) => void;
	placeholder?: string;
	helperText?: string;
	className?: string;
}

export function CreatableSelectField({
	id,
	label,
	value,
	options,
	onValueChange,
	placeholder = "Buscar o escribir una opción",
	helperText,
	className,
}: CreatableSelectFieldProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const listId = `${inputId}-options`;
	const normalizedValue = value.trim().toLowerCase();
	const hasExactMatch = useMemo(
		() =>
			normalizedValue.length === 0 ||
			options.some(
				(option) =>
					option.value.toLowerCase() === normalizedValue ||
					option.label.toLowerCase() === normalizedValue,
			),
		[normalizedValue, options],
	);

	return (
		<label className={cn("block space-y-1.5", className)} htmlFor={inputId}>
			<span className="block text-xs font-medium text-[var(--text-secondary)]">{label}</span>
			<input
				id={inputId}
				list={listId}
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
				placeholder={placeholder}
				className="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15"
			/>
			<datalist id={listId}>
				{options.map((option) => (
					<option key={option.value} value={option.value} label={option.label} />
				))}
			</datalist>
			{normalizedValue.length > 0 && !hasExactMatch ? (
				<p className="text-xs text-[var(--text-tertiary)]">Usar: {value}</p>
			) : helperText ? (
				<p className="text-xs text-[var(--text-tertiary)]">{helperText}</p>
			) : (
				<span className="sr-only">Seleccione una opción existente o escriba una nueva.</span>
			)}
		</label>
	);
}
