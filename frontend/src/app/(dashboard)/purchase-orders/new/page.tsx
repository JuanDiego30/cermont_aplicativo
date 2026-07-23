"use client";

import type { ApiEnvelope, Proposal, PurchaseOrderAuthorization } from "@cermont/shared-types";
import { RegisterPurchaseOrderSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/core/ui/Button";
import { apiClient } from "@/lib/http/api-client";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";
import { PurchaseOrderFormFields } from "./PurchaseOrderFormFields";

export const RegisterPOFormSchema = RegisterPurchaseOrderSchema.omit({
	attachments: true,
	receivedAt: true,
}).extend({
	proposalId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
		message: "Selecciona una propuesta aprobada.",
	}),
	receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, {
		message: "Use the local date-time format.",
	}),
});

export type FormValues = z.infer<typeof RegisterPOFormSchema>;

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
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
				</div>
			}
		>
			<NewPurchaseOrderContent />
		</Suspense>
	);
}

function NewPurchaseOrderContent() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";

	// Load inherited context (gets proposal ID from artifacts)
	const { inheritedFields, isLoading: isContextLoading } = useServiceCaseContext(
		"step_04_purchase_order",
		serviceCaseId,
	);

	const inheritedProposalId = inheritedFields.find((f) => f.key === "proposalId")?.value ?? "";

	const approvedProposalsQuery = useQuery({
		queryKey: ["proposals", "approved"],
		queryFn: async () => {
			const response = await apiClient.get<{ success: boolean; data: Proposal[] }>(
				"/proposals?status=approved",
			);
			return response.data;
		},
	});

	const approvedProposalsMap = useMemo(() => {
		const map = new Map<string, Proposal>();
		for (const p of approvedProposalsQuery.data ?? []) {
			map.set(p._id, p);
		}
		return map;
	}, [approvedProposalsQuery.data]);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<FormValues>({
		resolver: zodResolver(RegisterPOFormSchema),
		defaultValues: {
			proposalId: inheritedProposalId,
			poNumber: "",
			contractReference: "",
			serviceAccount: "",
			billingAccount: "",
			approvedAmount: 0,
			currency: "COP",
			receivedAt: toDateTimeLocalValue(new Date()),
		},
		mode: "onBlur",
	});

	const selectedProposalId = watch("proposalId");

	// Auto-fill fields when proposal selection changes
	useEffect(() => {
		if (!selectedProposalId || !approvedProposalsMap.has(selectedProposalId)) {
			return;
		}
		const proposal = approvedProposalsMap.get(selectedProposalId);
		if (!proposal) {
			return;
		}
		setValue("approvedAmount", proposal.total);
		setValue("currency", "COP");
	}, [selectedProposalId, approvedProposalsMap, setValue]);

	const mutation = useMutation<
		ApiEnvelope<PurchaseOrderAuthorization>,
		Error & { code?: string; message?: string },
		FormValues
	>({
		mutationFn: async (values) => {
			const payload = toPurchaseOrderPayload(values);
			return apiClient.post<ApiEnvelope<PurchaseOrderAuthorization>>("/purchase-orders", payload);
		},
		onSuccess: (response) => {
			void queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
			const created = response.data;
			// Navigate back to cockpit if we have a serviceCaseId, otherwise to PO detail
			if (serviceCaseId) {
				router.push(`/service-cases/${serviceCaseId}`);
			} else {
				router.push(`/purchase-orders/${created._id}`);
			}
		},
		onError: (error) => {
			setError("root", {
				type: "server",
				message: error.message ?? "No se pudo registrar la orden de compra.",
			});
		},
	});

	function onSubmit(values: FormValues) {
		mutation.mutate(values);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-po-title">
			<header className="space-y-3">
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/purchase-orders"}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-slate">Paso 4 / Orden de compra</p>
					<h1 id="new-po-title" className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
						Registrar orden de compra
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Vincula la orden de compra a la propuesta aprobada para avanzar al paso de planeación.
					</p>
				</div>
			</header>

			{/* Inherited context banner */}
			{!isContextLoading && inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
						Datos heredados del caso
					</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{inheritedFields.slice(0, 4).map((field) => (
							<div
								key={field.key}
								className="rounded-[var(--radius-md)] bg-background/70 px-3 py-2"
							>
								<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
									{field.label}
								</p>
								<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)] truncate">
									{field.value}
								</p>
								<p className="text-[9px] text-[var(--color-brand)]">↑ {field.sourceStepLabel}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<ErrorBoundary>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
					noValidate
				>
					<div className="grid gap-4 md:grid-cols-2">
						<PurchaseOrderFormFields
							register={register}
							errors={errors}
							approvedProposals={approvedProposalsQuery.data ?? []}
							isLoadingProposals={approvedProposalsQuery.isLoading}
						/>
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
									No se pudo registrar la orden de compra
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
								Orden de compra registrada. Redirigiendo…
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
							<Link href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/purchase-orders"}>
								Cancelar
							</Link>
						</Button>
						{mutation.isPending ? (
							<span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
								Enviando…
							</span>
						) : null}
					</div>
				</form>
			</ErrorBoundary>
		</section>
	);
}
