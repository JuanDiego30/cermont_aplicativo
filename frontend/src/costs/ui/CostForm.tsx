"use client";

import type { Cost, CostResponse, UpdateCostInput } from "@cermont/shared-types";
import { CreateCostSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormField, Select, TextArea, TextField } from "@/core";
import { COST_CATEGORY_LABELS, COST_CATEGORY_OPTIONS, useCreateCost, useUpdateCost } from "..";

interface CostFormProps {
	orderId: string;
	cost?: Cost | null;
	readOnly?: boolean;
	onSuccess?: (cost: CostResponse) => void;
	onCancel?: () => void;
}

type CostFormValues = z.input<typeof CreateCostSchema>;

function buildDefaultValues(orderId: string, cost?: Cost | null): CostFormValues {
	return {
		orderId,
		category: cost?.category ?? "labor",
		description: cost?.description ?? "",
		estimatedAmount: cost?.estimatedAmount ?? 0,
		actualAmount: cost?.actualAmount ?? 0,
		taxAmount: cost?.taxAmount ?? 0,
		taxRate: cost?.taxRate ?? 0,
		currency: cost?.currency ?? "COP",
		notes: cost?.notes,
	};
}

export function CostForm({ orderId, cost, readOnly = false, onSuccess, onCancel }: CostFormProps) {
	const isEditing = !!cost;
	const createMutation = useCreateCost();
	const updateMutation = useUpdateCost(cost?._id ?? "");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CostFormValues>({
		resolver: zodResolver(CreateCostSchema),
		defaultValues: buildDefaultValues(orderId, cost),
	});

	useEffect(() => {
		reset(buildDefaultValues(orderId, cost));
	}, [cost, orderId, reset]);

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const onSubmit = async (data: CostFormValues) => {
		const result = isEditing
			? await updateMutation.mutateAsync({
					category: data.category,
					description: data.description,
					estimatedAmount: data.estimatedAmount,
					actualAmount: data.actualAmount,
					taxAmount: data.taxAmount,
					taxRate: data.taxRate,
					currency: data.currency,
					notes: data.notes,
				} satisfies UpdateCostInput)
			: await createMutation.mutateAsync({
					...data,
					taxAmount: data.taxAmount ?? 0,
					taxRate: data.taxRate ?? 0,
					currency: data.currency ?? "COP",
				});

		onSuccess?.(result);

		if (!isEditing) {
			reset(buildDefaultValues(orderId));
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			<input type="hidden" {...register("orderId")} />

			<div className="grid gap-4 md:grid-cols-2">
				<FormField
					name="description"
					htmlFor="cost-description"
					label="Descripción"
					error={errors.description?.message}
					className="md:col-span-2"
				>
					<TextField
						id="cost-description"
						{...register("description")}
						disabled={readOnly || isSubmitting}
						placeholder="Describe el concepto del costo"
					/>
				</FormField>

				<FormField
					name="category"
					htmlFor="cost-category"
					label="Categoría"
					error={errors.category?.message}
				>
					<Select id="cost-category" {...register("category")} disabled={readOnly || isSubmitting}>
						{COST_CATEGORY_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{COST_CATEGORY_LABELS[option]}
							</option>
						))}
					</Select>
				</FormField>

				<FormField
					name="currency"
					htmlFor="cost-currency"
					label="Moneda"
					error={errors.currency?.message}
				>
					<TextField
						id="cost-currency"
						{...register("currency")}
						disabled={readOnly || isSubmitting}
						placeholder="COP"
					/>
				</FormField>

				<FormField
					name="estimatedAmount"
					htmlFor="cost-estimatedAmount"
					label="Estimado"
					error={errors.estimatedAmount?.message}
				>
					<TextField
						id="cost-estimatedAmount"
						type="number"
						min={0}
						step="0.01"
						{...register("estimatedAmount", { valueAsNumber: true })}
						disabled={readOnly || isSubmitting}
						placeholder="0"
					/>
				</FormField>

				<FormField
					name="actualAmount"
					htmlFor="cost-actualAmount"
					label="Real"
					error={errors.actualAmount?.message}
				>
					<TextField
						id="cost-actualAmount"
						type="number"
						min={0}
						step="0.01"
						{...register("actualAmount", { valueAsNumber: true })}
						disabled={readOnly || isSubmitting}
						placeholder="0"
					/>
				</FormField>

				<FormField
					name="taxAmount"
					htmlFor="cost-taxAmount"
					label="Impuestos"
					error={errors.taxAmount?.message}
				>
					<TextField
						id="cost-taxAmount"
						type="number"
						min={0}
						step="0.01"
						{...register("taxAmount", { valueAsNumber: true })}
						disabled={readOnly || isSubmitting}
						placeholder="0"
					/>
				</FormField>

				<FormField
					name="taxRate"
					htmlFor="cost-taxRate"
					label="Tasa de impuesto"
					error={errors.taxRate?.message}
				>
					<TextField
						id="cost-taxRate"
						type="number"
						min={0}
						max={1}
						step="0.01"
						{...register("taxRate", { valueAsNumber: true })}
						disabled={readOnly || isSubmitting}
						placeholder="0"
					/>
				</FormField>

				<FormField
					name="notes"
					htmlFor="cost-notes"
					label="Observaciones"
					error={errors.notes?.message}
					className="md:col-span-2"
				>
					<TextArea
						id="cost-notes"
						{...register("notes")}
						disabled={readOnly || isSubmitting}
						rows={4}
						placeholder="Notas sobre la ejecución, proveedor o justificación del costo"
					/>
				</FormField>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
				{isEditing && onCancel ? (
					<button
						type="button"
						onClick={onCancel}
						disabled={readOnly || isSubmitting}
						className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
					>
						Cancelar
					</button>
				) : null}

				<button
					type="submit"
					disabled={readOnly || isSubmitting}
					className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
				>
					{isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar costo"}
				</button>
			</div>
		</form>
	);
}
