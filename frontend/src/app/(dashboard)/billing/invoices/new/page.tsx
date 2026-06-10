"use client";

import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useCreateInvoiceFromSES } from "@/modules/billing/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

export default function NewInvoicePage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<NewInvoiceForm />
		</Suspense>
	);
}

function todayDateValue(): string {
	return new Date().toISOString().slice(0, 10);
}

function thirtyDaysFromNowValue(): string {
	const d = new Date();
	d.setDate(d.getDate() + 30);
	return d.toISOString().slice(0, 10);
}

function dateToDatetime(dateStr: string): string {
	return `${dateStr}T00:00:00.000Z`;
}

function NewInvoiceForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const prefilledSesId = searchParams.get("sesId") ?? "";

	const {
		workflow,
		isLoading: isContextLoading,
		inheritedFields,
	} = useServiceCaseContext("step_12_invoice_submission", serviceCaseId);

	// Derive SES ID: prefer URL param → artifacts
	const derivedSesId = prefilledSesId || workflow?.artifacts?.serviceEntrySheet?.id || "";

	const sesId = derivedSesId;
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [issueDate, setIssueDate] = useState(todayDateValue());
	const [dueDate, setDueDate] = useState(thirtyDaysFromNowValue());
	const [notes, setNotes] = useState("");

	const resolvedSesId = sesId || derivedSesId;

	const createMutation = useCreateInvoiceFromSES(resolvedSesId);

	if (!resolvedSesId && !isContextLoading) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-[var(--color-danger)]">Falta SES</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Accede a esta página desde el cockpit del caso o desde el SES aprobado.
				</p>
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/billing/ses"}
					className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] hover:underline"
				>
					{serviceCaseId ? "Volver al caso" : "Ir a SES"}
				</Link>
			</div>
		);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!issueDate) {
			toast.error("La fecha de emisión es requerida");
			return;
		}
		if (!dueDate) {
			toast.error("La fecha de vencimiento es requerida");
			return;
		}

		createMutation.mutate(
			{
				tipoDocumento: "FV",
				invoiceNumber: invoiceNumber.trim() || undefined,
				issueDate: dateToDatetime(issueDate),
				dueDate: dateToDatetime(dueDate),
				notes: notes.trim() || undefined,
			},
			{
				onSuccess: (response) => {
					toast.success("Factura creada");
					const invoiceId = (response as { data?: { _id?: string } }).data?._id;
					if (invoiceId) {
						router.push(`/billing/invoices/${invoiceId}`);
					} else if (serviceCaseId) {
						router.push(`/service-cases/${serviceCaseId}`);
					} else {
						router.push("/billing/invoices");
					}
				},
				onError: (err) => {
					toast.error("Error al crear la factura", { description: err.message });
				},
			},
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-invoice-title">
			<header className="space-y-3">
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : `/billing/ses/${resolvedSesId}`}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 12 / Factura</p>
					<h1
						id="new-invoice-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Nueva factura
					</h1>
					{workflow && (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{workflow.code} — {workflow.clientName}
						</p>
					)}
					{resolvedSesId && (
						<p className="mt-1 text-xs text-[var(--text-muted)]">
							SES: <code className="font-mono">{resolvedSesId}</code>
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
							<div key={field.key} className="rounded-[var(--radius-md)] bg-white/70 px-3 py-2">
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
				className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				noValidate
			>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="invoiceNumber"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Número de factura <span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<input
							id="invoiceNumber"
							type="text"
							value={invoiceNumber}
							onChange={(e) => setInvoiceNumber(e.target.value)}
							placeholder="Ej. FV-2024-001"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm md:max-w-sm"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<label htmlFor="issueDate" className="text-sm font-medium text-[var(--text-primary)]">
								Fecha de emisión <span className="text-red-500">*</span>
							</label>
							<input
								id="issueDate"
								type="date"
								required
								value={issueDate}
								onChange={(e) => setIssueDate(e.target.value)}
								className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="dueDate" className="text-sm font-medium text-[var(--text-primary)]">
								Fecha de vencimiento <span className="text-red-500">*</span>
							</label>
							<input
								id="dueDate"
								type="date"
								required
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
								className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="notes" className="text-sm font-medium text-[var(--text-primary)]">
							Notas <span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<textarea
							id="notes"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Notas o comentarios adicionales..."
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" variant="primary" loading={createMutation.isPending}>
						<Save className="size-4" aria-hidden="true" />
						Crear factura
					</Button>
					<Button asChild type="button" variant="secondary">
						<Link
							href={
								serviceCaseId ? `/service-cases/${serviceCaseId}` : `/billing/ses/${resolvedSesId}`
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
