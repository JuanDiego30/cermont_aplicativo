"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
	FieldArrayWithId,
	FieldError,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseFormRegister,
} from "react-hook-form";
import { FormField, TextField } from "@/core/ui/FormField";

interface KitItemSectionProps<TFieldValues extends FieldValues> {
	name: keyof TFieldValues & string;
	label: string;
	description: string;
	emptyMessage: string;
	addButtonLabel: string;
	fields: FieldArrayWithId<TFieldValues>[];
	register: UseFormRegister<TFieldValues>;
	errors: FieldErrors<TFieldValues>;
	onAppend: () => void;
	onRemove: (index: number) => void;
	minItems?: number;
	showDescription?: boolean;
}

function getItemError<TFieldValues extends FieldValues>(
	errors: FieldErrors<TFieldValues>,
	sectionName: keyof TFieldValues & string,
	index: number,
): Record<string, FieldError | undefined> | undefined {
	const section = errors[sectionName];
	if (!section || typeof section === "string" || !Array.isArray(section)) {
		return undefined;
	}
	return section[index] as Record<string, FieldError | undefined> | undefined;
}

export function KitItemSection<TFieldValues extends FieldValues>({
	name,
	label,
	description,
	emptyMessage,
	addButtonLabel,
	fields,
	register,
	errors,
	onAppend,
	onRemove,
	minItems = 0,
	showDescription = false,
}: KitItemSectionProps<TFieldValues>) {
	const sectionAccess = errors[name as keyof FieldErrors<TFieldValues>];
	const rootError =
		sectionAccess && typeof sectionAccess === "object" && "message" in sectionAccess
			? (sectionAccess as { message?: string }).message
			: null;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">{label}</h3>
					{description ? (
						<p className="text-xs text-[var(--text-secondary)]">{description}</p>
					) : null}
				</div>
				<button
					type="button"
					onClick={onAppend}
					className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--border-medium)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-cermont-blue-bg)]"
				>
					<Plus className="size-3.5" />
					{addButtonLabel}
				</button>
			</div>

			{fields.length === 0 ? (
				<p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-medium)] px-4 py-6 text-sm text-[var(--text-tertiary)]">
					{emptyMessage}
				</p>
			) : (
				<div className="space-y-3">
					{fields.map((field, index) => {
						const fieldErrors = getItemError(errors, name, index);
						return (
							<div
								key={field.id}
								className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-4"
							>
								<div className="flex items-start justify-between gap-2">
									<div
										className={`grid flex-1 gap-3 ${
											showDescription
												? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
												: "grid-cols-1 sm:grid-cols-3"
										}`}
									>
										<FormField label="Nombre" required error={fieldErrors?.name?.message}>
											<TextField
												placeholder="Nombre del ítem"
												error={Boolean(fieldErrors?.name)}
												{...register(`${String(name)}.${index}.name` as FieldPath<TFieldValues>)}
											/>
										</FormField>

										<FormField label="Cant." required error={fieldErrors?.quantity?.message}>
											<TextField
												type="number"
												min={1}
												error={Boolean(fieldErrors?.quantity)}
												{...register(
													`${String(name)}.${index}.quantity` as FieldPath<TFieldValues>,
												)}
											/>
										</FormField>

										<FormField label="Unidad" required error={fieldErrors?.unit?.message}>
											<TextField
												placeholder="unidad, metro, kg"
												error={Boolean(fieldErrors?.unit)}
												{...register(`${String(name)}.${index}.unit` as FieldPath<TFieldValues>)}
											/>
										</FormField>

										{showDescription ? (
											<FormField label="Descripción" error={fieldErrors?.description?.message}>
												<TextField
													placeholder="Opcional"
													{...register(
														`${String(name)}.${index}.description` as FieldPath<TFieldValues>,
													)}
												/>
											</FormField>
										) : null}
									</div>

									<button
										type="button"
										onClick={() => onRemove(index)}
										disabled={fields.length <= minItems}
										className="mt-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--color-danger)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
										aria-label="Eliminar"
									>
										<Trash2 className="size-4" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{rootError ? (
				<p role="alert" className="text-sm text-[var(--color-danger)]">
					{rootError}
				</p>
			) : null}
		</div>
	);
}
