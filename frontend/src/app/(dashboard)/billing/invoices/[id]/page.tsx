"use client";

import type { Invoice } from "@cermont/shared-types";
import { ArrowLeft, Ban, CheckCircle2, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { RejectForm } from "@/core/ui/RejectForm";
import {
	useApproveInvoice,
	useCancelInvoice,
	useInvoice,
	useRejectInvoice,
	useSubmitInvoice,
} from "@/modules/billing/queries";

function invoiceStatusTone(status: Invoice["status"]): string {
	if (status === "approved" || status === "accepted" || status === "paid") {
		return "border-success/30 bg-success/5 text-success";
	}
	if (status === "rejected" || status === "cancelled") {
		return "border-destructive/30 bg-destructive/5 text-destructive";
	}
	if (status === "submitted" || status === "sent" || status === "issued" || status === "draft") {
		return "border-warning/30 bg-warning/5 text-warning";
	}
	return "border-border bg-surface-secondary text-muted-foreground";
}

export default function InvoiceDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<InvoiceDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando factura">
			<div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
		</section>
	);
}

function InvoiceDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useInvoice(id);
	const invoice = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="invoice-detail-title">
			<BackLink />

			{isLoading && <DetailSkeleton />}

			{isError && <ErrorCard onRetry={refetch} />}

			{!isLoading && !isError && !invoice && <EmptyCard />}

			{invoice && <InvoiceContent invoice={invoice} />}
		</section>
	);
}

function BackLink() {
	return (
		<Link
			href="/billing/invoices"
			className="inline-flex items-center gap-2 text-sm font-medium text-brand"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a Facturas
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-5">
			<h2 className="text-base font-semibold text-foreground">No se pudo cargar la factura</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Ocurri&oacute;n un error al obtener los datos.
			</p>
			<button
				type="button"
				onClick={onRetry}
				className="mt-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
			>
				Reintentar
			</button>
		</div>
	);
}

function EmptyCard() {
	return (
		<div className="rounded-lg border border-dashed border-border bg-card p-6">
			<h2 className="text-base font-semibold text-foreground">Factura no encontrada</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				El identificador no corresponde a ninguna factura registrada.
			</p>
			<Link
				href="/billing/invoices"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
			>
				<ArrowLeft className="size-4" />
				Volver al listado
			</Link>
		</div>
	);
}

function InvoiceContent({ invoice }: { invoice: Invoice }) {
	const [activeAction, setActiveAction] = useState<string>("none");

	const submitMutation = useSubmitInvoice(invoice._id);
	const approveMutation = useApproveInvoice(invoice._id);
	const rejectMutation = useRejectInvoice(invoice._id);
	const cancelMutation = useCancelInvoice(invoice._id);

	const handleSubmit = async () => {
		try {
			await submitMutation.mutateAsync();
			toast.success("Factura enviada correctamente");
			setActiveAction("none");
		} catch {
			toast.error("Error al enviar la factura");
		}
	};

	const handleApprove = async () => {
		try {
			await approveMutation.mutateAsync();
			toast.success("Factura aprobada correctamente");
			setActiveAction("none");
		} catch {
			toast.error("Error al aprobar la factura");
		}
	};

	const handleReject = async (reason: string) => {
		try {
			await rejectMutation.mutateAsync({ reason, clientMutationId: uuidv4() });
			toast.success("Factura rechazada");
			setActiveAction("none");
		} catch {
			toast.error("Error al rechazar la factura");
		}
	};

	const handleCancel = async () => {
		try {
			await cancelMutation.mutateAsync();
			toast.success("Factura cancelada");
			setActiveAction("none");
		} catch {
			toast.error("Error al cancelar la factura");
		}
	};

	const canSubmit = invoice.status === "draft" || invoice.status === "issued";
	const canApprove = invoice.status === "submitted" || invoice.status === "sent";
	const canReject = invoice.status === "submitted" || invoice.status === "sent";
	const canCancel =
		invoice.status === "draft" || invoice.status === "issued" || invoice.status === "rejected";

	const showAction = (name: string) => activeAction === name;
	const toggleAction = (name: string) => setActiveAction(activeAction === name ? "none" : name);

	return (
		<>
			<InvoiceInfo invoice={invoice} />

			{canSubmit || canApprove || canReject || canCancel ? (
				<div className="flex flex-wrap gap-3">
					{canSubmit && activeAction !== "submit" && (
						<button
							type="button"
							onClick={() => toggleAction("submit")}
							disabled={submitMutation.isPending}
							className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<Send className="size-4" />
							Enviar
						</button>
					)}
					{canApprove && activeAction !== "approve" && (
						<button
							type="button"
							onClick={() => toggleAction("approve")}
							disabled={approveMutation.isPending}
							className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<CheckCircle2 className="size-4" />
							Aprobar
						</button>
					)}
					{canReject && activeAction !== "reject" && (
						<button
							type="button"
							onClick={() => toggleAction("reject")}
							disabled={rejectMutation.isPending}
							className="inline-flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
						>
							<XCircle className="size-4" />
							Rechazar
						</button>
					)}
					{canCancel && activeAction !== "cancel" && (
						<button
							type="button"
							onClick={() => toggleAction("cancel")}
							disabled={cancelMutation.isPending}
							className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
						>
							<Ban className="size-4" />
							Cancelar
						</button>
					)}
				</div>
			) : null}

			{showAction("submit") && (
				<ConfirmSubmit onSubmit={handleSubmit} pending={submitMutation.isPending} />
			)}
			{showAction("approve") && (
				<ConfirmApprove onApprove={handleApprove} pending={approveMutation.isPending} />
			)}
			{showAction("reject") && (
				<RejectForm
					title="Rechazar factura"
					onReject={handleReject}
					pending={rejectMutation.isPending}
					minChars={10}
				/>
			)}
			{showAction("cancel") && (
				<ConfirmCancel onCancel={handleCancel} pending={cancelMutation.isPending} />
			)}
		</>
	);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

function formatInvoiceDate(value?: string): string {
	return value ? DATE_FORMATTER.format(new Date(value)) : "Sin fecha";
}

function InvoiceInfo({ invoice }: { invoice: Invoice }) {
	const currencyFmt = useMemo(
		() =>
			new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: invoice.currency,
				maximumFractionDigits: 0,
			}),
		[invoice.currency],
	);

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-border bg-card p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="invoice-detail-title" className="text-xl font-semibold text-foreground">
							{invoice.invoiceNumber || invoice.code}
						</h2>
						<p className="text-sm text-muted-foreground">
							{invoice.clientName} &middot; Orden {invoice.workOrderId}
							{invoice.serviceEntrySheetCode && ` &middot; SES ${invoice.serviceEntrySheetCode}`}
						</p>
					</div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${invoiceStatusTone(invoice.status)}`}
					>
						{invoice.status}
					</span>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<FieldCard title="Cliente" value={invoice.clientName} />
				<FieldCard
					title="Cuenta de facturaci&oacute;n"
					value={invoice.billingAccount || "Sin asignar"}
				/>
				<FieldCard
					title="N&uacute;mero de factura"
					value={invoice.invoiceNumber || "Sin n&uacute;mero"}
				/>
				<FieldCard
					title="Subtotal"
					value={currencyFmt.format(invoice.subtotal ?? invoice.amount ?? 0)}
				/>
				<FieldCard title="Impuestos" value={currencyFmt.format(invoice.taxAmount)} />
				<FieldCard
					title="Total"
					value={currencyFmt.format(invoice.totalAmount)}
					valueClass="text-brand font-semibold"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FieldCard title="Fecha de emisi&oacute;n" value={formatInvoiceDate(invoice.issuedAt)} />
				<FieldCard title="Fecha de vencimiento" value={formatInvoiceDate(invoice.dueDate)} />
				<FieldCard title="Enviada" value={formatInvoiceDate(invoice.sentAt)} />
				<FieldCard title="Enviada por" value={formatInvoiceDate(invoice.submittedAt)} />
				<FieldCard title="Aceptada" value={formatInvoiceDate(invoice.acceptedAt)} />
				<FieldCard title="Pagada" value={formatInvoiceDate(invoice.paidAt)} />
			</div>

			{invoice.rejectionReason && (
				<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
					<h3 className="text-sm font-semibold text-destructive">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-muted-foreground">{invoice.rejectionReason}</p>
				</div>
			)}

			{invoice.notes && (
				<div className="rounded-lg border border-border bg-card p-4 shadow-card">
					<h3 className="text-sm font-semibold text-foreground">Notas</h3>
					<p className="mt-2 text-sm text-muted-foreground">{invoice.notes}</p>
				</div>
			)}

			{invoice.invoiceLines && invoice.invoiceLines.length > 0 && (
				<div className="rounded-lg border border-border bg-card p-4 shadow-card">
					<h3 className="text-sm font-semibold text-foreground">L&iacute;neas de factura</h3>
					<table className="mt-3 w-full text-sm">
						<thead>
							<tr className="border-b border-border/50">
								<th className="py-2 text-left text-xs font-medium text-muted-foreground">
									Descripci&oacute;n
								</th>
								<th className="py-2 text-right text-xs font-medium text-muted-foreground">Cant.</th>
								<th className="py-2 text-right text-xs font-medium text-muted-foreground">
									P. Unit.
								</th>
								<th className="py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
							</tr>
						</thead>
						<tbody>
							{invoice.invoiceLines.map((line) => (
								<tr key={line.description} className="border-b border-border/50">
									<td className="py-2">{line.description}</td>
									<td className="py-2 text-right">
										{line.quantity} {line.unit}
									</td>
									<td className="py-2 text-right">{currencyFmt.format(line.unitPrice)}</td>
									<td className="py-2 text-right font-medium">{currencyFmt.format(line.total)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-muted">
				<span>Creado: {formatInvoiceDate(invoice.createdAt)}</span>
				<span>Actualizado: {formatInvoiceDate(invoice.updatedAt)}</span>
			</div>
		</div>
	);
}

function FieldCard({
	title,
	value,
	valueClass,
}: {
	title: string;
	value: string;
	valueClass?: string;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-card">
			<p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
			<p className={`mt-1 text-sm text-foreground ${valueClass ?? ""}`}>{value}</p>
		</div>
	);
}

function ConfirmSubmit({ onSubmit, pending }: { onSubmit: () => void; pending: boolean }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4">
			<h3 className="text-sm font-semibold text-[var(--color-warning)]">Enviar factura</h3>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				&iquest;Desea enviar esta factura?
			</p>
			<button
				type="button"
				onClick={onSubmit}
				disabled={pending}
				className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Enviando..." : "Confirmar env&iacute;o"}
			</button>
		</div>
	);
}

function ConfirmApprove({ onApprove, pending }: { onApprove: () => void; pending: boolean }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-4">
			<h3 className="text-sm font-semibold text-[var(--color-success)]">Aprobar factura</h3>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				&iquest;Confirma la aprobaci&oacute;n de esta factura?
			</p>
			<button
				type="button"
				onClick={onApprove}
				disabled={pending}
				className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Aprobando..." : "Confirmar aprobaci&oacute;n"}
			</button>
		</div>
	);
}

function ConfirmCancel({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {
	return (
		<div className="space-y-3 rounded-lg border border-border-default bg-surface-primary p-4 shadow-card">
			<h3 className="text-sm font-semibold text-(--text-primary)">Cancelar factura</h3>
			<p className="text-sm text-(--text-secondary)">
				&iquest;Est&aacute; seguro de que desea cancelar esta factura? Esta acci&oacute;n no se
				puede deshacer.
			</p>
			<button
				type="button"
				onClick={onCancel}
				disabled={pending}
				className="rounded-md border border-danger bg-danger/5 px-4 py-2 text-sm font-medium text-danger disabled:opacity-50"
			>
				{pending ? "Cancelando..." : "Confirmar cancelaci&oacute;n"}
			</button>
		</div>
	);
}
