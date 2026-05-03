"use client";

import { type UpdateOrderBillingInput, UpdateOrderBillingSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Clock, Receipt, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { useOrder, useUpdateOrderBilling } from "@/orders/queries";

interface OrderBillingTabProps {
	orderId: string;
}

type BillingFormValues = UpdateOrderBillingInput;

const SES_STATUS_LABELS: Record<string, string> = {
	pending: "Pendiente",
	registered: "Registrada",
	approved: "Aprobada",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
	pending: "Pendiente",
	sent: "Enviada",
	approved: "Aprobada",
	paid: "Pagada",
};

export function OrderBillingTab({ orderId }: OrderBillingTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);
	const updateBilling = useUpdateOrderBilling(orderId);
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<BillingFormValues>({
		resolver: zodResolver(UpdateOrderBillingSchema),
		defaultValues: {
			sesNumber: "",
			sesStatus: "pending",
			invoiceNumber: "",
			invoiceStatus: "pending",
			billingNotes: "",
		},
	});

	useEffect(() => {
		if (!order) {
			return;
		}

		reset({
			sesNumber: order.billing.sesNumber ?? "",
			sesStatus: order.billing.sesStatus,
			invoiceNumber: order.billing.invoiceNumber ?? "",
			invoiceStatus: order.billing.invoiceStatus,
			billingNotes: order.billing.billingNotes ?? "",
		});
	}, [order, reset]);

	const watchedSesStatus = watch("sesStatus");
	const watchedInvoiceStatus = watch("invoiceStatus");

	const pipelineSteps = [
		{ label: "OT completada", complete: Boolean(order?.completedAt) },
		{ label: "Informe generado", complete: Boolean(order?.reportGenerated) },
		{ label: "Informe aprobado", complete: Boolean(order?.hasApprovedReport) },
		{ label: "Lista para facturar", complete: order?.status === "ready_for_invoicing" },
		{ label: "SES registrada", complete: watchedSesStatus !== "pending" },
		{ label: "SES aprobada", complete: watchedSesStatus === "approved" },
		{ label: "Factura enviada", complete: watchedInvoiceStatus !== "pending" },
		{
			label: "Factura aprobada",
			complete: ["approved", "paid"].includes(watchedInvoiceStatus ?? ""),
		},
		{ label: "Pago registrado", complete: watchedInvoiceStatus === "paid" },
	];

	const onSubmit = handleSubmit(async (values) => {
		try {
			await updateBilling.mutateAsync(values);
			toast.success("Facturación actualizada");
		} catch (submissionError) {
			toast.error(
				submissionError instanceof Error
					? submissionError.message
					: "No se pudo actualizar la facturación",
			);
		}
	});

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	if (error || !order) {
		return (
			<section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
				No se pudo cargar la facturación de la orden.
			</section>
		);
	}

	const expectedAmount = order.commercial?.nteAmount ?? order.costBaseline?.total ?? 0;
	const overdueSes = order.completedAt
		? Math.floor((Date.now() - new Date(order.completedAt).getTime()) / 86_400_000) > 7 &&
			order.billing.sesStatus === "pending"
		: false;

	return (
		<section aria-label="Facturación de la orden" className="space-y-6">
			<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="space-y-6">
					<section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-lg font-semibold text-slate-950 dark:text-white">
									Pipeline SES → factura → pago
								</h2>
								<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
									Seguimiento administrativo de la orden con el mismo origen de datos del módulo
									global de facturación.
								</p>
							</div>
							<div className="rounded-lg bg-slate-50 px-3 py-2 text-right dark:bg-slate-900">
								<p className="text-xs text-slate-500 dark:text-slate-400">Valor esperado</p>
								<p className="text-sm font-semibold text-slate-950 dark:text-white">
									{formatCurrency(expectedAmount)}
								</p>
							</div>
						</div>

						<ol className="mt-5 grid gap-2 sm:grid-cols-3">
							{pipelineSteps.map((step, index) => (
								<li
									key={step.label}
									className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
										step.complete
											? "border-green-200 bg-green-50 text-green-900 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-300"
											: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
									}`}
								>
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold dark:bg-slate-950">
										{step.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
									</span>
									{step.label}
								</li>
							))}
						</ol>
					</section>

					<form
						onSubmit={onSubmit}
						className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6"
					>
						<section className="grid gap-4 sm:grid-cols-2">
							<FieldBlock label="Número SES" error={errors.sesNumber?.message}>
								<input
									{...register("sesNumber")}
									placeholder="SES-000000"
									className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
								/>
							</FieldBlock>
							<FieldBlock label="Estado SES" error={errors.sesStatus?.message}>
								<select
									{...register("sesStatus")}
									className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
								>
									{Object.entries(SES_STATUS_LABELS).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
							</FieldBlock>
							<FieldBlock label="Número factura" error={errors.invoiceNumber?.message}>
								<input
									{...register("invoiceNumber")}
									placeholder="FV-000000"
									className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
								/>
							</FieldBlock>
							<FieldBlock label="Estado factura" error={errors.invoiceStatus?.message}>
								<select
									{...register("invoiceStatus")}
									className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
								>
									{Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
							</FieldBlock>
							<div className="sm:col-span-2">
								<FieldBlock label="Notas de facturación" error={errors.billingNotes?.message}>
									<textarea
										{...register("billingNotes")}
										rows={3}
										className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
									/>
								</FieldBlock>
							</div>
						</section>

						<div className="flex justify-end">
							<button
								type="submit"
								disabled={updateBilling.isPending}
								className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								{updateBilling.isPending ? "Guardando..." : "Guardar facturación"}
							</button>
						</div>
					</form>
				</div>

				<aside className="space-y-3">
					<StatusCard
						label="SES"
						value={SES_STATUS_LABELS[order.billing.sesStatus] ?? order.billing.sesStatus}
						icon={<Receipt className="h-4 w-4" />}
					/>
					<StatusCard
						label="Factura"
						value={
							INVOICE_STATUS_LABELS[order.billing.invoiceStatus] ?? order.billing.invoiceStatus
						}
						icon={<Receipt className="h-4 w-4" />}
					/>
					<StatusCard
						label="Pago"
						value={order.billing.paidAt ? formatDate(order.billing.paidAt) : "Pendiente"}
						icon={<Clock className="h-4 w-4" />}
					/>
					{overdueSes ? (
						<div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
							<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
							<p>La OT lleva más de 7 días sin SES registrada.</p>
						</div>
					) : null}
				</aside>
			</div>
		</section>
	);
}

function FieldBlock({
	label,
	error,
	children,
}: {
	label: string;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div className="block space-y-2">
			<span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
			{children}
			{error ? (
				<span className="block text-xs text-red-600 dark:text-red-400" role="alert">
					{error}
				</span>
			) : null}
		</div>
	);
}

function StatusCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
			<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{icon}
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
		</div>
	);
}
