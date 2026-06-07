"use client";

import { CreateOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/core/ui/Button";
import { FormField, Select, TextArea, TextField } from "@/modules/core";
import { useKitTemplates } from "@/modules/kits/queries";
import { ORDER_PRIORITY_OPTIONS } from "../model/order-options";
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
type NewOrderFormData = z.infer<typeof newOrderFormSchema>;

const TYPE_OPTIONS = [
	{ value: "maintenance", label: "Mantenimiento" },
	{ value: "inspection", label: "Inspección (HES)" },
	{ value: "installation", label: "Instalación" },
	{ value: "repair", label: "Reparación" },
	{ value: "decommission", label: "Descomisionamiento" },
	{ value: "other", label: "Otro" },
] as const;

interface CreateOrderFormProps {
	proposalId?: string;
	serviceCaseId?: string;
	workRequestId?: string;
}

export function CreateOrderForm({
	proposalId = "",
	serviceCaseId = "",
	workRequestId = "",
}: CreateOrderFormProps) {
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

	useEffect(() => {
		const firstErrorKey = Object.keys(errors)[0];
		if (firstErrorKey) {
			const errorElement = document.getElementById(`order-${firstErrorKey}`);
			if (errorElement) {
				errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
				(errorElement as HTMLElement).focus({ preventScroll: true });
			}
		}
	}, [errors]);

	async function onSubmit(data: NewOrderFormData) {
		const customFields: Record<string, string | number | boolean> = {
			...(serviceCaseId ? { serviceCaseId } : {}),
			...(workRequestId ? { workRequestId } : {}),
		};
		const orderTypeCustomField: Record<string, string | number | boolean> =
			data.type === "other" && data.typeOther?.trim() ? { typeOther: data.typeOther.trim() } : {};
		const proposalLink = proposalId ? { proposalId } : {};
		mutation.mutate(
			{
				...data,
				...proposalLink,
				materials: [],
				executionPhase: { preStartVerification: [] },
				customFields: { ...customFields, ...orderTypeCustomField },
			},
			{
				onSuccess: () => {
					push("/orders");
				},
			},
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
			{mutation.isError ? (
				<p
					role="alert"
					className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)] animate-scale-in"
				>
					{mutation.error instanceof Error ? mutation.error.message : "Error al crear la orden"}
				</p>
			) : null}

			{/* Sección 1: Información General de la Orden */}
			<fieldset className="border border-[var(--border-subtle)] rounded-2xl p-6 bg-[var(--surface-card)] shadow-sm flex flex-col gap-4 animate-scale-in">
				<legend className="text-xs font-semibold px-3 py-1 bg-[var(--surface-secondary)] text-[var(--color-brand)] font-mono rounded-full border border-[var(--border-subtle)]">
					1. Información del Trabajo
				</legend>

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

				{selectedType === "other" ? (
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
						{ORDER_PRIORITY_OPTIONS.map((opt) => (
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
					name="kitTemplate"
					htmlFor="order-kitTemplate"
					label="Plantilla de kit (Opcional)"
				>
					<Select id="order-kitTemplate" {...register("kitTemplate")}>
						<option value="">Sin kit</option>
						{(kitTemplates || []).reduce<React.ReactNode[]>((acc, kit) => {
							if (!selectedType || kit.type === selectedType) {
								acc.push(
									<option key={kit.id} value={kit.id}>
										{kit.name} - {kit.description}
									</option>,
								);
							}
							return acc;
						}, [])}
					</Select>
				</FormField>
			</fieldset>

			{/* Sección 2: Detalles del Activo y Ubicación */}
			<fieldset className="border border-[var(--border-subtle)] rounded-2xl p-6 bg-[var(--surface-card)] shadow-sm flex flex-col gap-4 animate-scale-in">
				<legend className="text-xs font-semibold px-3 py-1 bg-[var(--surface-secondary)] text-[var(--color-brand)] font-mono rounded-full border border-[var(--border-subtle)]">
					2. Detalles del Activo & Ubicación
				</legend>

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
			</fieldset>

			<Button
				type="submit"
				loading={isSubmitting}
				variant="primary"
				size="lg"
				className="mt-2 w-full shadow-lg"
			>
				Crear Orden de Trabajo
			</Button>
		</form>
	);
}
