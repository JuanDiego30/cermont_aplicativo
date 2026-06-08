"use client";

import type {
	Cost,
	CostResponse as CostSnapshot,
	CreateCostInput,
	Evidence,
	UpdateCostInput,
} from "@cermont/shared-types";
import { CreateCostSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormField, Select, TextArea, TextField } from "@/modules/core";
import { listEvidences } from "@/modules/evidences/queries";
import { useCreateCost, useUpdateCost } from "../queries";
import { COST_CATEGORY_LABELS, COST_CATEGORY_OPTIONS } from "../utils";

interface CostFormProps {
	orderId: string;
	cost?: Cost | null;
	readOnly?: boolean;
	onSuccess?: (cost: CostSnapshot) => void;
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
		supportEvidenceIds: cost?.supportEvidenceIds ?? [],
		supportDocumentIds: cost?.supportDocumentIds ?? [],
	};
}

export function CostForm({ orderId, cost, readOnly = false, onSuccess, onCancel }: CostFormProps) {
	const createMutation = useCreateCost();
	const updateMutation = useUpdateCost(cost?._id ?? "");
	const isEditing = !!cost;

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<CostFormValues, Record<string, never>, CreateCostInput>({
		resolver: zodResolver(CreateCostSchema),
		defaultValues: buildDefaultValues(orderId, cost),
	});

	const { data: evidencesData = [], isLoading: isEvidencesLoading } = useQuery({
		queryKey: ["evidences", orderId],
		queryFn: () => listEvidences(orderId),
		enabled: !!orderId,
	});
	const selectedEvidenceSupportId = watch("supportEvidenceIds")?.[0] ?? "";
	const isSubmitting = createMutation.isPending || updateMutation.isPending;
	const isSupportSelectorDisabled = readOnly || isSubmitting || isEvidencesLoading;

	function handleSupportEvidenceChange(event: ChangeEvent<HTMLSelectElement>) {
		const selectedId = event.currentTarget.value;
		setValue("supportEvidenceIds", selectedId ? [selectedId] : [], {
			shouldDirty: true,
			shouldValidate: true,
		});
	}

	const onSubmit = handleSubmit(async (data: CreateCostInput) => {
		const result = await submitCostForm({
			data,
			isEditing,
			createMutation,
			updateMutation,
		});

		onSuccess?.(result);

		if (!isEditing) {
			reset(buildDefaultValues(orderId));
		}
	});

	return (
		<form onSubmit={onSubmit} className="space-y-5">
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
					name="supportEvidenceIds"
					htmlFor="cost-support-evidence"
					label="Soporte"
					error={errors.supportEvidenceIds?.message}
					className="md:col-span-2"
				>
					<Select
						id="cost-support-evidence"
						value={selectedEvidenceSupportId}
						onChange={handleSupportEvidenceChange}
						disabled={isSupportSelectorDisabled}
					>
						<option value="">
							{isEvidencesLoading ? "Cargando soportes" : "Seleccionar soporte"}
						</option>
						<CurrentEvidenceSupportOption
							selectedEvidenceSupportId={selectedEvidenceSupportId}
							evidences={evidencesData}
						/>
						{evidencesData.map((evidence) => (
							<option key={evidence._id} value={evidence._id}>
								{formatEvidenceSupportLabel(evidence)}
							</option>
						))}
					</Select>
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

			<CostFormActions
				isEditing={isEditing}
				isSubmitting={isSubmitting}
				readOnly={readOnly}
				onCancel={onCancel}
			/>
		</form>
	);
}

async function submitCostForm({
	data,
	isEditing,
	createMutation,
	updateMutation,
}: {
	data: CreateCostInput;
	isEditing: boolean;
	createMutation: ReturnType<typeof useCreateCost>;
	updateMutation: ReturnType<typeof useUpdateCost>;
}): Promise<CostSnapshot> {
	if (!isEditing) {
		return createMutation.mutateAsync(data);
	}

	return updateMutation.mutateAsync({
		category: data.category,
		description: data.description,
		estimatedAmount: data.estimatedAmount,
		actualAmount: data.actualAmount,
		taxAmount: data.taxAmount,
		taxRate: data.taxRate,
		currency: data.currency,
		notes: data.notes,
		supportEvidenceIds: data.supportEvidenceIds,
		supportDocumentIds: data.supportDocumentIds,
	} satisfies UpdateCostInput);
}

function CurrentEvidenceSupportOption({
	selectedEvidenceSupportId,
	evidences,
}: {
	selectedEvidenceSupportId: string;
	evidences: Evidence[];
}) {
	if (!selectedEvidenceSupportId) {
		return null;
	}

	if (evidences.some((evidence) => evidence._id === selectedEvidenceSupportId)) {
		return null;
	}

	return (
		<option value={selectedEvidenceSupportId}>Soporte vinculado {selectedEvidenceSupportId}</option>
	);
}

function formatEvidenceSupportLabel(evidence: Evidence): string {
	const description = evidence.description?.trim();
	if (description) {
		return `${evidence.type} - ${description}`;
	}

	return `${evidence.type} - ${evidence.filename}`;
}

function CostFormActions({
	isEditing,
	isSubmitting,
	readOnly,
	onCancel,
}: {
	isEditing: boolean;
	isSubmitting: boolean;
	readOnly: boolean;
	onCancel?: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
			{isEditing && onCancel ? (
				<button
					type="button"
					onClick={onCancel}
					disabled={readOnly || isSubmitting}
					className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
				>
					Cancelar
				</button>
			) : null}

			<button
				type="submit"
				disabled={readOnly || isSubmitting}
				className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
			>
				{getSubmitLabel(isSubmitting, isEditing)}
			</button>
		</div>
	);
}

function getSubmitLabel(isSubmitting: boolean, isEditing: boolean): string {
	if (isSubmitting) {
		return "Guardando…";
	}

	return isEditing ? "Guardar cambios" : "Registrar costo";
}
