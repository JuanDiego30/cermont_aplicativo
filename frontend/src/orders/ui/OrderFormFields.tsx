"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField, Select, TextArea, TextField } from "@/core";

export const PRIORITY_OPTIONS = [
	{ value: "low", label: "Baja" },
	{ value: "medium", label: "Media" },
	{ value: "high", label: "Alta" },
	{ value: "critical", label: "Crítica" },
] as const;

export const TYPE_OPTIONS = [
	{ value: "maintenance", label: "Mantenimiento" },
	{ value: "inspection", label: "Inspección (HES)" },
	{ value: "installation", label: "Instalación" },
	{ value: "repair", label: "Reparación" },
	{ value: "decommission", label: "Descomisionamiento" },
] as const;

interface OrderFormValues {
	priority: string;
	description: string;
	location: string;
	observations?: string;
}

interface OrderFormFieldsProps {
	errors: FieldErrors<OrderFormValues>;
	register: UseFormRegister<OrderFormValues>;
	fieldIds?: {
		priority?: string;
		description?: string;
		location?: string;
	};
	includeObservations?: boolean;
	observationsRegister?: UseFormRegister<OrderFormValues>;
	observationsError?: string;
	observationsFieldId?: string;
}

export function OrderFormFields({
	errors,
	register,
	fieldIds = {},
	includeObservations = false,
	observationsRegister,
	observationsError,
	observationsFieldId,
}: OrderFormFieldsProps) {
	const priorityId = fieldIds.priority ?? "order-priority";
	const descriptionId = fieldIds.description ?? "order-description";
	const locationId = fieldIds.location ?? "order-location";

	return (
		<>
			<FormField
				name="priority"
				htmlFor={priorityId}
				label="Prioridad"
				error={errors.priority?.message as string | undefined}
				required
			>
				<Select id={priorityId} {...register("priority")}>
					{PRIORITY_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</Select>
			</FormField>

			<FormField
				name="description"
				htmlFor={descriptionId}
				label="Descripción"
				error={errors.description?.message as string | undefined}
				required
			>
				<TextArea
					id={descriptionId}
					rows={4}
					placeholder="Describe el trabajo a realizar..."
					{...register("description")}
				/>
			</FormField>

			<FormField
				name="location"
				htmlFor={locationId}
				label="Ubicación"
				error={errors.location?.message as string | undefined}
			>
				<TextField id={locationId} placeholder="Ubicación del trabajo" {...register("location")} />
			</FormField>

			{includeObservations && observationsRegister && (
				<FormField
					name="observations"
					htmlFor={observationsFieldId ?? "order-observations"}
					label="Observaciones"
					error={observationsError}
				>
					<TextArea
						id={observationsFieldId ?? "order-observations"}
						rows={3}
						placeholder="Notas adicionales..."
						{...observationsRegister("observations")}
					/>
				</FormField>
			)}
		</>
	);
}
