"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/_shared/lib/utils";
import type { NewOrderFormData } from "./types";

export interface Option {
	value: string;
	label: string;
}

export function SectionPanel({
	title,
	children,
	description,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
			<header>
				<h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
				{description ? (
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
				) : null}
			</header>
			{children}
		</section>
	);
}

export function FieldGrid({ children }: { children: ReactNode }) {
	return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

export function getError(errors: unknown, path: string): string | undefined {
	const value = path.split(".").reduce<unknown>((current, key) => {
		if (!current || typeof current !== "object") {
			return undefined;
		}
		return (current as Record<string, unknown>)[key];
	}, errors);

	if (!value || typeof value !== "object") {
		return undefined;
	}

	const message = (value as Record<string, unknown>).message;
	return typeof message === "string" ? message : undefined;
}

export function CheckboxGroup({
	name,
	options,
	className,
	legend,
	required,
	"aria-required": ariaRequired,
}: {
	name: keyof NewOrderFormData | string;
	options: Option[];
	className?: string;
	legend?: ReactNode;
	required?: boolean;
	"aria-required"?: boolean | "true" | "false";
}) {
	const { watch, setValue } = useFormContext<NewOrderFormData>();
	const selected = (watch(name as keyof NewOrderFormData) as unknown as string[] | undefined) ?? [];
	const isRequired = required || ariaRequired === true || ariaRequired === "true";
	const fieldName = String(name);
	const fieldId = fieldName.replace(/[^A-Za-z0-9_-]/g, "-");

	return (
		<fieldset>
			{legend ? (
				<legend className="sr-only">
					{legend}
					{isRequired ? " (obligatorio)" : ""}
				</legend>
			) : null}
			<ul className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
				{options.map((option) => {
					const checked = selected.includes(option.value);
					return (
						<li key={option.value}>
							<label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
								<input
									id={`order-${fieldId}-${option.value}`}
									name={fieldName}
									type="checkbox"
									value={option.value}
									checked={checked}
									onChange={() => {
										const next = checked
											? selected.filter((value) => value !== option.value)
											: [...selected, option.value];
										setValue(name as keyof NewOrderFormData, next as never, {
											shouldDirty: true,
											shouldValidate: true,
										});
									}}
									className="h-4 w-4 rounded border-slate-300"
								/>
								<span>{option.label}</span>
							</label>
						</li>
					);
				})}
			</ul>
		</fieldset>
	);
}
