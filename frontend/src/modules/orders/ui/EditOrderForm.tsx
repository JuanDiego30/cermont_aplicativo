"use client";

import { type UpdateOrderInput, UpdateOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { Button } from "@/core/ui/Button";
import { FormField, Select, TextArea, TextField } from "@/modules/core";
import { ORDER_PRIORITY_OPTIONS } from "../model/order-options";
import { useOrder, useUpdateOrder } from "../queries";

const editOrderFormSchema = UpdateOrderSchema;
type EditOrderFormValues = UpdateOrderInput;

interface EditOrderFormProps {
	orderId: string;
}

function focusFirstError(currentErrors: FieldErrors<EditOrderFormValues>): void {
	const firstErrorKey = Object.keys(currentErrors)[0];
	if (firstErrorKey) {
		const errorElement = document.getElementById(`edit-${firstErrorKey}`);
		if (errorElement) {
			errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
			(errorElement as HTMLElement).focus({ preventScroll: true });
		}
	}
}

export function EditOrderForm({ orderId }: EditOrderFormProps) {
	const { push } = useRouter();
	const { data: order, isLoading, error: fetchError } = useOrder(orderId);
	const mutation = useUpdateOrder(orderId);
	const formValues = useMemo<EditOrderFormValues>(
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
	} = useForm<EditOrderFormValues>({
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

	async function onSubmit(data: EditOrderFormValues) {
		mutation.mutate(data, {
			onSuccess: () => {
				push(`/orders/${orderId}`);
			},
		});
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit, focusFirstError)}
			noValidate
			className="flex flex-col gap-6"
		>
			<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-5 text-sm text-[var(--text-secondary)] shadow-sm animate-scale-in">
				<dl className="grid gap-4 sm:grid-cols-2">
					<div>
						<dt className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
							Activo
						</dt>
						<dd className="mt-1 font-semibold text-[var(--text-primary)]">{order.assetName}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
							Código
						</dt>
						<dd className="mt-1 font-mono text-[var(--text-primary)]">{order.code}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
							Tipo
						</dt>
						<dd className="mt-1 text-[var(--text-primary)]">{order.type}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">
							Asignado
						</dt>
						<dd className="mt-1 text-[var(--text-primary)]">
							{order.assignedToName ?? "Sin asignar"}
						</dd>
					</div>
				</dl>
			</div>

			{mutation.isError ? (
				<p
					role="alert"
					className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)] animate-scale-in"
				>
					{mutation.error instanceof Error
						? mutation.error.message
						: "Error al actualizar la orden"}
				</p>
			) : null}

			<fieldset className="border border-[var(--border-subtle)] rounded-2xl p-6 bg-[var(--surface-card)] shadow-sm flex flex-col gap-4 animate-scale-in">
				<legend className="text-xs font-semibold px-3 py-1 bg-[var(--surface-secondary)] text-[var(--color-brand)] font-mono rounded-full border border-[var(--border-subtle)]">
					Modificar Detalles de Orden
				</legend>

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
			</fieldset>

			<Button
				type="submit"
				loading={isSubmitting}
				variant="primary"
				size="lg"
				className="mt-2 w-full shadow-lg"
			>
				Guardar Cambios
			</Button>
		</form>
	);
}
