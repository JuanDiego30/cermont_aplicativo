"use client";

import { type UpdateOrderInput, UpdateOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { type FieldErrors, type UseFormRegister, useForm } from "react-hook-form";
import { useOrder, useUpdateOrder } from "..";
import { OrderFormFields } from "./OrderFormFields";

export const editOrderFormSchema = UpdateOrderSchema;
export type EditOrderFormData = UpdateOrderInput;

interface EditOrderFormProps {
	orderId: string;
}

type SharedOrderFormValues = {
	priority: string;
	description: string;
	location: string;
	observations?: string;
};

export function EditOrderForm({ orderId }: EditOrderFormProps) {
	const router = useRouter();
	const { data: order, isLoading, error: fetchError } = useOrder(orderId);
	const mutation = useUpdateOrder(orderId);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EditOrderFormData>({
		resolver: zodResolver(editOrderFormSchema),
		defaultValues: {
			description: "",
			priority: "medium",
			location: "",
			observations: "",
		},
	});

	useEffect(() => {
		if (order) {
			reset({
				description: order.description ?? "",
				priority: order.priority ?? "medium",
				location: order.location ?? "",
				observations: order.observations ?? "",
			});
		}
	}, [order, reset]);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800">
				<span className="text-slate-500">Cargando datos de la orden...</span>
			</div>
		);
	}

	if (fetchError || !order) {
		return (
			<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
				{fetchError?.message ?? "No se pudo cargar la orden"}
			</div>
		);
	}

	async function onSubmit(data: EditOrderFormData) {
		mutation.mutate(data, {
			onSuccess: () => {
				router.push(`/orders/${orderId}`);
			},
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
			<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
				<dl className="grid gap-2 sm:grid-cols-2">
					<div>
						<dt className="text-xs uppercase tracking-wide text-slate-400">Activo</dt>
						<dd className="mt-1 font-medium text-slate-900 dark:text-white">{order.assetName}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-slate-400">Código</dt>
						<dd className="mt-1 font-mono text-slate-900 dark:text-white">{order.code}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-slate-400">Tipo</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{order.type}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-slate-400">Asignado</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
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
					{mutation.error?.message ?? "Error al actualizar la orden"}
				</p>
			) : null}

			<OrderFormFields
				register={register as UseFormRegister<SharedOrderFormValues>}
				errors={errors as FieldErrors<SharedOrderFormValues>}
				fieldIds={{
					priority: "edit-priority",
					description: "edit-description",
					location: "edit-location",
				}}
				includeObservations
				observationsRegister={register as UseFormRegister<SharedOrderFormValues>}
				observationsError={errors.observations?.message as string | undefined}
				observationsFieldId="edit-observations"
			/>

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
				Guardar Cambios
			</button>
		</form>
	);
}
