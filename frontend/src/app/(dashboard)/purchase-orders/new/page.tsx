"use client";

import type { ApiEnvelope, PurchaseOrderAuthorization } from "@cermont/shared-types";
import { RegisterPurchaseOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/core/ui/Button";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import { apiClient } from "@/lib/http/api-client";

// Form schema mirrors the canonical RegisterPurchaseOrderSchema but omits
// `attachments` (the form does not yet provide an upload widget) so that
// input type === output type. This avoids the .default([]) input/output
// split that would otherwise break react-hook-form generics.
const RegisterPOFormSchema = RegisterPurchaseOrderSchema.omit({
	attachments: true,
	receivedAt: true,
}).extend({
	receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, {
		message: "Use the local date-time format.",
	}),
});
type FormValues = z.infer<typeof RegisterPOFormSchema>;

const CURRENCY_OPTIONS = [
	{ value: "COP", label: "COP — Peso colombiano" },
	{ value: "USD", label: "USD — Dólar estadounidense" },
	{ value: "EUR", label: "EUR — Euro" },
] as const;

function defaultValues(): FormValues {
	const now = toDateTimeLocalValue(new Date());
	return {
		proposalId: "",
		poNumber: "",
		contractReference: "",
		serviceAccount: "",
		billingAccount: "",
		approvedAmount: 0,
		currency: "COP",
		receivedAt: now,
	};
}

function toDateTimeLocalValue(date: Date): string {
	const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function toPurchaseOrderPayload(values: FormValues): z.input<typeof RegisterPurchaseOrderSchema> {
	return {
		...values,
		receivedAt: new Date(values.receivedAt).toISOString(),
	};
}

export default function NewPurchaseOrderPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<FormValues>({
		resolver: zodResolver(RegisterPOFormSchema),
		defaultValues: defaultValues(),
		mode: "onBlur",
	});

	const mutation = useMutation<
		ApiEnvelope<PurchaseOrderAuthorization>,
		Error & { code?: string; message?: string },
		FormValues
	>({
		mutationFn: async (values) => {
			const payload = toPurchaseOrderPayload(values);
			const response = await apiClient.post<ApiEnvelope<PurchaseOrderAuthorization>>(
				"/purchase-orders",
				payload,
			);
			return response;
		},
		onSuccess: (response) => {
			void queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
			const created = response.data;
			router.push(`/purchase-orders/${created._id}`);
		},
		onError: (error) => {
			setError("root", {
				type: "server",
				message: error.message ?? "Unable to register the purchase order.",
			});
		},
	});

	function onSubmit(values: FormValues) {
		mutation.mutate(values);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-po-title">
			<header className="space-y-3">
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 4 / Operación</p>
					<h1 id="new-po-title" className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
						Register purchase order
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Link the purchase order to an approved proposal. The PO remains pending until it is
						validated or rejected.
					</p>
				</div>
				<Link
					href="/purchase-orders"
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver a órdenes
				</Link>
			</header>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				noValidate
			>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						name="proposalId"
						label="Proposal ID"
						helperText="ObjectId of the approved proposal (24 characters)."
						required
						error={errors.proposalId?.message}
					>
						<TextField
							id="proposalId"
							{...register("proposalId")}
							error={Boolean(errors.proposalId)}
							placeholder="6700abcd1234567890abcdef"
							autoComplete="off"
							inputMode="text"
						/>
					</FormField>

					<FormField name="poNumber" label="Número de PO" required error={errors.poNumber?.message}>
						<TextField
							id="poNumber"
							{...register("poNumber")}
							error={Boolean(errors.poNumber)}
							placeholder="PO-2026-0001"
							autoComplete="off"
						/>
					</FormField>

					<FormField
						name="contractReference"
						label="Referencia de contrato"
						helperText="Opcional. Referencia interna del contrato."
						error={errors.contractReference?.message}
					>
						<TextField
							id="contractReference"
							{...register("contractReference")}
							error={Boolean(errors.contractReference)}
							placeholder="CT-2026-001"
							autoComplete="off"
						/>
					</FormField>

					<FormField
						name="serviceAccount"
						label="Cuenta de servicio"
						required
						error={errors.serviceAccount?.message}
					>
						<TextField
							id="serviceAccount"
							{...register("serviceAccount")}
							error={Boolean(errors.serviceAccount)}
							placeholder="Servicio-001"
							autoComplete="off"
						/>
					</FormField>

					<FormField
						name="billingAccount"
						label="Cuenta de facturación"
						required
						error={errors.billingAccount?.message}
					>
						<TextField
							id="billingAccount"
							{...register("billingAccount")}
							error={Boolean(errors.billingAccount)}
							placeholder="Facturación-001"
							autoComplete="off"
						/>
					</FormField>

					<FormField
						name="approvedAmount"
						label="Monto aprobado"
						helperText="Valor numérico positivo en la moneda seleccionada."
						required
						error={errors.approvedAmount?.message}
					>
						<TextField
							id="approvedAmount"
							type="number"
							min="0"
							step="0.01"
							{...register("approvedAmount", { valueAsNumber: true })}
							error={Boolean(errors.approvedAmount)}
							placeholder="0.00"
							autoComplete="off"
						/>
					</FormField>

					<FormField name="currency" label="Moneda" required error={errors.currency?.message}>
						<Select
							id="currency"
							{...register("currency")}
							error={Boolean(errors.currency)}
							defaultValue="COP"
						>
							{CURRENCY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
					</FormField>

					<FormField
						name="receivedAt"
						label="Fecha de recepción"
						helperText="Fecha y hora local; se guarda en formato ISO 8601."
						required
						error={errors.receivedAt?.message}
					>
						<TextField
							id="receivedAt"
							type="datetime-local"
							{...register("receivedAt")}
							error={Boolean(errors.receivedAt)}
							autoComplete="off"
						/>
					</FormField>
				</div>

				{errors.root ? (
					<div
						className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4"
						role="alert"
					>
						<AlertTriangle
							className="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]"
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-semibold text-[var(--text-primary)]">
								Unable to register purchase order
							</p>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">{errors.root.message}</p>
						</div>
					</div>
				) : null}

				{mutation.isSuccess ? (
					<output
						className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-4"
						aria-live="polite"
					>
						<CheckCircle2
							className="mt-0.5 size-5 shrink-0 text-[var(--color-success)]"
							aria-hidden="true"
						/>
						<p className="text-sm text-[var(--text-primary)]">
							Purchase order registered. Redirecting to detail…
						</p>
					</output>
				) : null}

				<div className="flex flex-wrap items-center gap-3">
					<Button
						type="submit"
						variant="primary"
						loading={isSubmitting || mutation.isPending}
						disabled={isSubmitting || mutation.isPending}
					>
						<Save className="size-4" aria-hidden="true" />
						Registrar PO
					</Button>
					<Button asChild type="button" variant="secondary" disabled={mutation.isPending}>
						<Link href="/purchase-orders">Cancelar</Link>
					</Button>
					{mutation.isPending ? (
						<span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
							<Loader2 className="size-4 animate-spin" aria-hidden="true" />
							Enviando…
						</span>
					) : null}
				</div>
			</form>
		</section>
	);
}
