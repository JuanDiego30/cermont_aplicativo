"use client";

import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useReducer } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useRegisterPaymentForInvoice } from "@/modules/billing/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

export default function NewPaymentPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<NewPaymentForm />
		</Suspense>
	);
}

function nowDatetimeLocal(): string {
	const now = new Date();
	const offset = now.getTimezoneOffset();
	const local = new Date(now.getTime() - offset * 60000);
	return local.toISOString().slice(0, 16);
}

function datetimeLocalToIso(value: string): string {
	return new Date(value).toISOString();
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
	bank_transfer: "Transferencia bancaria",
	check: "Cheque",
	electronic: "Pago electrónico",
	cash: "Efectivo",
	other: "Otro",
};

type PaymentMethod = "bank_transfer" | "check" | "electronic" | "cash" | "other";

interface PaymentFormState {
	paymentReference: string;
	paidAt: string;
	amount: string;
	paymentMethod: PaymentMethod;
	bankReference: string;
}

type PaymentFormAction =
	| { type: "SET_PAYMENT_REFERENCE"; payload: string }
	| { type: "SET_PAID_AT"; payload: string }
	| { type: "SET_AMOUNT"; payload: string }
	| { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod }
	| { type: "SET_BANK_REFERENCE"; payload: string };

function paymentFormReducer(state: PaymentFormState, action: PaymentFormAction): PaymentFormState {
	switch (action.type) {
		case "SET_PAYMENT_REFERENCE":
			return { ...state, paymentReference: action.payload };
		case "SET_PAID_AT":
			return { ...state, paidAt: action.payload };
		case "SET_AMOUNT":
			return { ...state, amount: action.payload };
		case "SET_PAYMENT_METHOD":
			return { ...state, paymentMethod: action.payload };
		case "SET_BANK_REFERENCE":
			return { ...state, bankReference: action.payload };
		default:
			return state;
	}
}

const initialFormState: PaymentFormState = {
	paymentReference: "",
	paidAt: nowDatetimeLocal(),
	amount: "",
	paymentMethod: "bank_transfer",
	bankReference: "",
};

function NewPaymentForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const prefilledInvoiceId = searchParams.get("invoiceId") ?? "";

	const {
		workflow,
		isLoading: isContextLoading,
		inheritedFields,
	} = useServiceCaseContext("step_14_payment_closure", serviceCaseId);

	// Derive invoice ID: prefer URL param → artifacts
	const derivedInvoiceId = prefilledInvoiceId || workflow?.artifacts?.invoice?.id || "";

	const invoiceId = derivedInvoiceId;
	const [formState, dispatch] = useReducer(paymentFormReducer, initialFormState);
	const { paymentReference, paidAt, amount, paymentMethod, bankReference } = formState;

	const resolvedInvoiceId = invoiceId || derivedInvoiceId;

	const registerMutation = useRegisterPaymentForInvoice(resolvedInvoiceId);

	if (!resolvedInvoiceId && !isContextLoading) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-[var(--color-danger)]">Falta factura</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Accede a esta página desde el cockpit del caso o desde la factura aprobada.
				</p>
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/billing/invoices"}
					className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] hover:underline"
				>
					{serviceCaseId ? "Volver al caso" : "Ir a facturas"}
				</Link>
			</div>
		);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!paymentReference.trim()) {
			toast.error("La referencia de pago es requerida");
			return;
		}
		const amountNum = parseFloat(amount);
		if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
			toast.error("El monto debe ser un valor positivo");
			return;
		}

		registerMutation.mutate(
			{
				paymentReference: paymentReference.trim(),
				paidAt: datetimeLocalToIso(paidAt),
				amount: amountNum,
				paymentMethod,
				bankReference: bankReference.trim() || undefined,
			},
			{
				onSuccess: (response) => {
					toast.success("Pago registrado — caso cerrado");
					const paymentId = (response as { data?: { _id?: string } }).data?._id;
					if (paymentId) {
						router.push(`/payments/${paymentId}`);
					} else if (serviceCaseId) {
						router.push(`/service-cases/${serviceCaseId}`);
					} else {
						router.push("/payments");
					}
				},
				onError: (err) => {
					toast.error("Error al registrar el pago", { description: err.message });
				},
			},
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-payment-title">
			<header className="space-y-3">
				<Link
					href={
						serviceCaseId
							? `/service-cases/${serviceCaseId}`
							: `/billing/invoices/${resolvedInvoiceId}`
					}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 14 / Pago y cierre</p>
					<h1
						id="new-payment-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Registrar pago
					</h1>
					{workflow && (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{workflow.code} — {workflow.clientName}
						</p>
					)}
					{resolvedInvoiceId && (
						<p className="mt-1 text-xs text-[var(--text-muted)]">
							Factura: <code className="font-mono">{resolvedInvoiceId}</code>
						</p>
					)}
				</div>
			</header>

			{/* Inherited context banner */}
			{!isContextLoading && inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<div className="mb-2 flex items-center gap-2">
						<Info className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
						<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
							Datos heredados del caso
						</p>
					</div>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{inheritedFields.slice(0, 6).map((field) => (
							<div
								key={field.key}
								className="rounded-[var(--radius-md)] bg-background/70 px-3 py-2"
							>
								<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
									{field.label}
								</p>
								<p className="mt-0.5 truncate text-sm font-semibold text-[var(--text-primary)]">
									{field.value}
								</p>
								<p className="text-[9px] text-[var(--color-brand)]">↑ {field.sourceStepLabel}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				noValidate
			>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="paymentReference"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Referencia de pago <span className="text-brand-error">*</span>
						</label>
						<input
							id="paymentReference"
							type="text"
							required
							value={paymentReference}
							onChange={(e) => dispatch({ type: "SET_PAYMENT_REFERENCE", payload: e.target.value })}
							placeholder="Ej. TXN-2024-001"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<label htmlFor="paidAt" className="text-sm font-medium text-[var(--text-primary)]">
								Fecha y hora de pago <span className="text-brand-error">*</span>
							</label>
							<input
								id="paidAt"
								type="datetime-local"
								required
								value={paidAt}
								onChange={(e) => dispatch({ type: "SET_PAID_AT", payload: e.target.value })}
								className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="amount" className="text-sm font-medium text-[var(--text-primary)]">
								Monto (COP) <span className="text-brand-error">*</span>
							</label>
							<input
								id="amount"
								type="number"
								required
								min="0.01"
								step="1"
								value={amount}
								onChange={(e) => dispatch({ type: "SET_AMOUNT", payload: e.target.value })}
								placeholder="0"
								className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="paymentMethod"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Método de pago
						</label>
						<select
							id="paymentMethod"
							value={paymentMethod}
							onChange={(e) =>
								dispatch({ type: "SET_PAYMENT_METHOD", payload: e.target.value as PaymentMethod })
							}
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
						>
							{Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="bankReference"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Referencia bancaria{" "}
							<span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<input
							id="bankReference"
							type="text"
							value={bankReference}
							onChange={(e) => dispatch({ type: "SET_BANK_REFERENCE", payload: e.target.value })}
							placeholder="Número de comprobante o referencia bancaria"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" variant="primary" loading={registerMutation.isPending}>
						<Save className="size-4" aria-hidden="true" />
						Registrar pago
					</Button>
					<Button asChild type="button" variant="secondary">
						<Link
							href={
								serviceCaseId
									? `/service-cases/${serviceCaseId}`
									: `/billing/invoices/${resolvedInvoiceId}`
							}
						>
							Cancelar
						</Link>
					</Button>
				</div>
			</form>
		</section>
	);
}
