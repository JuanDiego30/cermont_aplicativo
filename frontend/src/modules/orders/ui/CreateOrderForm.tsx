"use client";

import { CreateOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, Select, TextArea, TextField } from "@/modules/core";
import { useKitTemplates } from "@/modules/kits/queries";
import { useCreateOrder } from "../queries";

const newOrderFormSchema = CreateOrderSchema.pick({
	type: true,
	priority: true,
	description: true,
	assetId: true,
	assetName: true,
	location: true,
}).extend({
	kitTemplate: z.string().optional(),
	typeOther: z.string().optional(),
});
export type NewOrderFormData = z.infer<typeof newOrderFormSchema>;

const TYPE_OPTIONS = [
	{ value: "maintenance", label: "Mantenimiento" },
	{ value: "inspection", label: "Inspección (HES)" },
	{ value: "installation", label: "Instalación" },
	{ value: "repair", label: "Reparación" },
	{ value: "decommission", label: "Descomisionamiento" },
	{ value: "other", label: "Otro" },
] as const;

export const PRIORITY_OPTIONS = [
	{ value: "low", label: "Baja" },
	{ value: "medium", label: "Media" },
	{ value: "high", label: "Alta" },
	{ value: "critical", label: "Crítica" },
] as const;

export function CreateOrderForm() {
	const { push } = useRouter();
	const mutation = useCreateOrder();
	const { data: kitTemplates } = useKitTemplates();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<NewOrderFormData>({
		resolver: zodResolver(newOrderFormSchema),
		defaultValues: {
			type: "maintenance",
			priority: "medium",
			description: "",
			assetId: "",
			assetName: "",
			location: "",
			typeOther: "",
		},
	});

	const selectedType = watch("type");

	async function onSubmit(data: NewOrderFormData) {
		const customFields: Record<string, string | number | boolean> =
			data.type === "other" && data.typeOther?.trim() ? { typeOther: data.typeOther.trim() } : {};
		mutation.mutate(
			{ ...data, materials: [], executionPhase: { preStartVerification: [] }, customFields },
			{
				onSuccess: () => {
					push("/orders");
				},
			},
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
			{mutation.isError ? (
				<p
					role="alert"
					className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
				>
					{mutation.error instanceof Error ? mutation.error.message : "Error al crear la orden"}
				</p>
			) : null}

			<FormField
				name="type"
				htmlFor="order-type"
				label="Tipo de orden"
				error={errors.type?.message}
				required
			>
				<Select id="order-type" {...register("type")}>
					{TYPE_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</Select>
			</FormField>

			{watch("type") === "other" ? (
				<FormField
					name="typeOther"
					htmlFor="order-typeOther"
					label="Especificar tipo"
					error={errors.typeOther?.message}
					required
				>
					<TextField
						id="order-typeOther"
						placeholder="Describe el tipo de orden"
						{...register("typeOther")}
					/>
				</FormField>
			) : null}

			<FormField
				name="priority"
				htmlFor="order-priority"
				label="Prioridad"
				error={errors.priority?.message}
				required
			>
				<Select id="order-priority" {...register("priority")}>
					{PRIORITY_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</Select>
			</FormField>

			<FormField
				name="description"
				htmlFor="order-description"
				label="Descripción"
				error={errors.description?.message}
				required
			>
				<TextArea
					id="order-description"
					rows={4}
					placeholder="Describe el trabajo a realizar…"
					{...register("description")}
				/>
			</FormField>

			<FormField
				name="assetId"
				htmlFor="order-assetId"
				label="ID del activo"
				error={errors.assetId?.message}
				required
			>
				<TextField
					id="order-assetId"
					placeholder="Código del activo o equipo"
					{...register("assetId")}
				/>
			</FormField>

			<FormField
				name="assetName"
				htmlFor="order-assetName"
				label="Nombre del activo"
				error={errors.assetName?.message}
				required
			>
				<TextField
					id="order-assetName"
					placeholder="Nombre descriptivo del activo"
					{...register("assetName")}
				/>
			</FormField>

			<FormField
				name="location"
				htmlFor="order-location"
				label="Ubicación"
				error={errors.location?.message}
				required
			>
				<TextField
					id="order-location"
					placeholder="Ubicación del trabajo"
					{...register("location")}
				/>
			</FormField>

			<FormField name="kitTemplate" htmlFor="order-kitTemplate" label="Plantilla de kit">
				<Select id="order-kitTemplate" {...register("kitTemplate")}>
					<option value="">Sin kit</option>
					{(kitTemplates || [])
						.filter((kit) => !selectedType || kit.type === selectedType)
						.map((kit) => (
							<option key={kit.id} value={kit.id}>
								{kit.name} - {kit.description}
							</option>
						))}
				</Select>
			</FormField>

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
				Crear Orden de Trabajo
			</button>
		</form>
	);
}
