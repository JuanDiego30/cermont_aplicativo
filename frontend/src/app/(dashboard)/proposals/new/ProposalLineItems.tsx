"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FieldArrayWithId, FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProposalFormValues } from "./proposal-form-schema";

interface ProposalLineItemsProps {
	fields: FieldArrayWithId<ProposalFormValues, "items", "id">[];
	watchedItems: ProposalFormValues["items"] | undefined;
	register: UseFormRegister<ProposalFormValues>;
	errors: FieldErrors<ProposalFormValues>;
	append: (value: ProposalFormValues["items"][number]) => void;
	remove: (index: number) => void;
	formatCOP: (value: number) => string;
	calcItemTotal: (quantity: number, unitCost: number) => number;
}

export function ProposalLineItems({
	fields,
	watchedItems,
	register,
	errors,
	append,
	remove,
	formatCOP,
	calcItemTotal,
}: ProposalLineItemsProps) {
	return (
		<section
			className="rounded-xl border border-border bg-card p-6 shadow-sm"
			aria-labelledby="items-section-title"
		>
			<div className="flex items-center justify-between">
				<h2 id="items-section-title" className="text-base font-semibold text-foreground">
					Items de la Propuesta
				</h2>
				<button
					type="button"
					onClick={() => append({ description: "", unit: "lote", quantity: 1, unitCost: 0 })}
					className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
				>
					<Plus aria-hidden="true" className="size-3.5" />
					Agregar item
				</button>
			</div>

			{errors.items && (
				<p className="mt-2 text-xs text-destructive" role="alert">
					{errors.items.message ?? errors.items.root?.message}
				</p>
			)}

			<div className="mt-4 space-y-3">
				{fields.map((field, index) => {
					const qty = watchedItems?.[index]?.quantity ?? 0;
					const cost = watchedItems?.[index]?.unitCost ?? 0;
					const itemTotal = calcItemTotal(qty, cost);

					return (
						<div
							key={field.id}
							className="rounded-lg border border-border-subtle bg-surface-secondary p-4"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 space-y-3">
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="sm:col-span-2">
											<label
												htmlFor={`items.${index}.description`}
												className="block text-xs font-medium text-[var(--text-tertiary)]"
											>
												Descripción
											</label>
											<input
												id={`items.${index}.description`}
												type="text"
												{...register(`items.${index}.description`)}
												placeholder="Descripción del item"
												className="input-field mt-0.5"
											/>
											{errors.items?.[index]?.description && (
												<p className="mt-0.5 text-xs text-[var(--color-danger)]">
													{errors.items[index]?.description?.message}
												</p>
											)}
										</div>
										<div>
											<label
												htmlFor={`items.${index}.unit`}
												className="block text-xs font-medium text-[var(--text-tertiary)]"
											>
												Unidad
											</label>
											<input
												id={`items.${index}.unit`}
												type="text"
												{...register(`items.${index}.unit`)}
												placeholder="lote"
												className="input-field mt-0.5"
											/>
										</div>
										<div>
											<label
												htmlFor={`items.${index}.quantity`}
												className="block text-xs font-medium text-[var(--text-tertiary)]"
											>
												Cantidad
											</label>
											<input
												id={`items.${index}.quantity`}
												type="number"
												min={0.01}
												step={0.01}
												{...register(`items.${index}.quantity`, { valueAsNumber: true })}
												className="input-field mt-0.5"
											/>
										</div>
										<div>
											<label
												htmlFor={`items.${index}.unitCost`}
												className="block text-xs font-medium text-[var(--text-tertiary)]"
											>
												Valor unitario (COP)
											</label>
											<input
												id={`items.${index}.unitCost`}
												type="number"
												min={0}
												step={1000}
												{...register(`items.${index}.unitCost`, { valueAsNumber: true })}
												className="input-field mt-0.5"
											/>
										</div>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									<p className="whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">
										{formatCOP(itemTotal)}
									</p>
									{fields.length > 1 && (
										<button
											type="button"
											onClick={() => remove(index)}
											className="rounded p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
											aria-label={`Eliminar item ${index + 1}`}
										>
											<Trash2 aria-hidden="true" className="size-4" />
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
