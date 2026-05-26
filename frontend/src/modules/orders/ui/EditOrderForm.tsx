"use client";

import { type UpdateOrderInput, UpdateOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormField, Select, TextArea, TextField } from "@/modules/core";
import { ORDER_PRIORITY_OPTIONS } from "../model/order-options";
import { useOrder, useUpdateOrder } from "../queries";

const editOrderFormSchema = UpdateOrderSchema;
type EditOrderFormData = UpdateOrderInput;

interface EditOrderFormProps {
	orderId: string;
}

export function EditOrderForm({ orderId }: EditOrderFormProps) {
	const { push } = useRouter();
	const { data: order, isLoading, error: fetchError } = useOrder(orderId);
	const mutation = useUpdateOrder(orderId);
	const formValues = useMemo<EditOrderFormData>(
		() => ({
			description: order?.description ?? "",
			priority: order?.priority ?? "medium",
			location: order?.location ?? "",
			observations: order?.observations ?? "",
		}),
		[order],
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<EditOrderFormData>({
		resolver: zodResolver(editOrderFormSchema),
		values: formValues,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
				<span className="text-zinc-500">Cargando datos de la orden…</span>
			</div>
		);
	}

	if (fetchError || !order) {
		return (
			<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
				{fetchError instanceof Error ? fetchError.message : "No se pudo cargar la orden"}
			</div>
		);
	}

	async function onSubmit(data: EditOrderFormData) {
		mutation.mutate(data, {
			onSuccess: () => {
				push(`/orders/${orderId}`);
			},
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
			<div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
				<dl className="grid gap-2 sm:grid-cols-2">
					<div>
						<dt className="text-xs uppercase tracking-wide text-zinc-400">Activo</dt>
						<dd className="mt-1 font-medium text-zinc-900 dark:text-white">{order.assetName}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-zinc-400">Código</dt>
						<dd className="mt-1 font-mono text-zinc-900 dark:text-white">{order.code}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-zinc-400">Tipo</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">{order.type}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-zinc-400">Asignado</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{order.assignedToName ?? "Sin asignar"}
						</dd>
					</div>
				</dl>
			</div>

			{mutation.isError ? (
				<p
					role="alert"
					className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
				>
					{mutation.error instanceof Error
						? mutation.error.message
						: "Error al actualizar la orden"}
				</p>
			) : null}

			<FormField
				name="priority"
				htmlFor="edit-priority"
				label="Prioridad"
				error={errors.priority?.message}
				required
			>
				<Select id="edit-priority" {...register("priority")}>
					{ORDER_PRIORITY_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</Select>
			</FormField>

			<FormField
				name="description"
				htmlFor="edit-description"
				label="Descripción"
				error={errors.description?.message}
				required
			>
				<TextArea id="edit-description" rows={4} {...register("description")} />
			</FormField>

			<FormField
				name="location"
				htmlFor="edit-location"
				label="Ubicación"
				error={errors.location?.message}
			>
				<TextField id="edit-location" {...register("location")} />
			</FormField>

			<FormField
				name="observations"
				htmlFor="edit-observations"
				label="Observaciones"
				error={errors.observations?.message}
			>
				<TextArea
					id="edit-observations"
					rows={3}
					placeholder="Notas adicionales…"
					{...register("observations")}
				/>
			</FormField>

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
				Guardar Cambios
			</button>
		</form>
	);
}
