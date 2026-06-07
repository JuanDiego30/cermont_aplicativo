"use client";

import type { Payment, PaymentMethod } from "@cermont/shared-types";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { RejectForm } from "@/core/ui/RejectForm";
import { usePayment, useReconcilePayment, useRejectPayment } from "@/modules/billing/queries";

const DATE_FMT = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const fmtDate = (v?: string) => (v ? DATE_FMT.format(new Date(v)) : "Sin fecha");

export default function PaymentDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<PaymentDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando pago">
			<div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
		</section>
	);
}

function PaymentDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = usePayment(id);
	const payment = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="payment-detail-title">
			<BackLink />

			{isLoading && <DetailSkeleton />}

			{isError && <ErrorCard onRetry={refetch} />}

			{!isLoading && !isError && !payment && <EmptyCard />}

			{payment && <PaymentContent payment={payment} />}
		</section>
	);
}

function BackLink() {
	return (
		<Link
			href="/payments"
			className="inline-flex items-center gap-2 text-sm font-medium text-brand"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a Pagos
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-5">
			<h2 className="text-base font-semibold text-foreground">No se pudo cargar el pago</h2>
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
			<h2 className="text-base font-semibold text-foreground">Pago no encontrado</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				El identificador no corresponde a ning&uacute;n pago registrado.
			</p>
			<Link
				href="/payments"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
			>
				<ArrowLeft className="size-4" />
				Volver al listado
			</Link>
		</div>
	);
}

function PaymentContent({ payment }: { payment: Payment }) {
	const [activeAction, setActiveAction] = useState<string>("none");

	const reconcileMutation = useReconcilePayment(payment._id);
	const rejectMutation = useRejectPayment(payment._id);

	const handleReconcile = async (notes?: string) => {
		try {
			await reconcileMutation.mutateAsync({ notes, clientMutationId: uuidv4() });
			toast.success("Pago conciliado correctamente");
			setActiveAction("none");
		} catch {
			toast.error("Error al conciliar el pago");
		}
	};

	const handleReject = async (reason: string) => {
		try {
			await rejectMutation.mutateAsync({ rejectionReason: reason, clientMutationId: uuidv4() });
			toast.success("Pago rechazado");
			setActiveAction("none");
		} catch {
			toast.error("Error al rechazar el pago");
		}
	};

	const canReconcile = payment.status === "recorded" || payment.status === "due";
	const canReject = payment.status === "recorded";

	const showAction = (name: string) => activeAction === name;
	const toggleAction = (name: string) => setActiveAction(activeAction === name ? "none" : name);

	return (
		<>
			<PaymentInfo payment={payment} />

			{canReconcile || canReject ? (
				<div className="flex flex-wrap gap-3">
					{canReconcile && activeAction !== "reconcile" && (
						<button
							type="button"
							onClick={() => toggleAction("reconcile")}
							disabled={reconcileMutation.isPending}
							className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<CheckCircle2 className="size-4" />
							Conciliar
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
				</div>
			) : null}

			{showAction("reconcile") && (
				<ReconcileForm onReconcile={handleReconcile} pending={reconcileMutation.isPending} />
			)}
			{showAction("reject") && (
				<RejectForm
					title="Rechazar pago"
					onReject={handleReject}
					pending={rejectMutation.isPending}
					minChars={10}
				/>
			)}
		</>
	);
}

function PaymentInfo({ payment }: { payment: Payment }) {
	const currencyFmt = useMemo(
		() =>
			new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: payment.currency,
				maximumFractionDigits: 0,
			}),
		[payment.currency],
	);

	const statusTone =
		payment.status === "reconciled"
			? "border-success/20 bg-success/10 text-success"
			: payment.status === "rejected"
				? "border-destructive/20 bg-destructive/10 text-destructive"
				: payment.status === "recorded" || payment.status === "due"
					? "border-warning/20 bg-warning/10 text-warning"
					: "border-border bg-surface-secondary text-muted-foreground";

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-border bg-card p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="payment-detail-title" className="text-xl font-semibold text-foreground">
							{payment.paymentReference}
						</h2>
						<p className="text-sm text-muted-foreground">
							Factura {payment.invoiceId} &middot; Orden {payment.workOrderId}
						</p>
					</div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
					>
						{payment.status}
					</span>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<FieldCard
					title="Monto"
					value={currencyFmt.format(payment.amount)}
					valueClass="text-brand font-semibold"
				/>
				<FieldCard
					title="M&eacute;todo de pago"
					value={paymentMethodLabel(payment.paymentMethod)}
				/>
				<FieldCard title="Referencia bancaria" value={payment.bankReference || "Sin referencia"} />
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FieldCard title="Fecha de pago" value={fmtDate(payment.paidAt)} />
				<FieldCard title="Registrado por" value={payment.recordedBy || "Sin registrar"} />
				<FieldCard title="Fecha de registro" value={fmtDate(payment.recordedAt)} />
				<FieldCard title="Conciliado por" value={payment.reconciledBy || "Sin conciliar"} />
				<FieldCard title="Fecha de conciliaci&oacute;n" value={fmtDate(payment.reconciledAt)} />
				<FieldCard
					title="Documento soporte"
					value={payment.supportingDocument || "Sin documento"}
				/>
			</div>

			{payment.rejectionReason && (
				<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
					<h3 className="text-sm font-semibold text-destructive">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-muted-foreground">{payment.rejectionReason}</p>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-muted">
				<span>Creado: {fmtDate(payment.createdAt)}</span>
				<span>Actualizado: {fmtDate(payment.updatedAt)}</span>
			</div>
		</div>
	);
}

function paymentMethodLabel(method: PaymentMethod): string {
	const labels: Record<PaymentMethod, string> = {
		bank_transfer: "Transferencia bancaria",
		check: "Cheque",
		electronic: "Electr&oacute;nico",
		cash: "Efectivo",
		other: "Otro",
	};
	return labels[method] || method;
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

function ReconcileForm({
	onReconcile,
	pending,
}: {
	onReconcile: (notes?: string) => void;
	pending: boolean;
}) {
	const [notes, setNotes] = useState("");

	const handleSubmit = async () => {
		await onReconcile(notes.trim() || undefined);
	};

	return (
		<form
			className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4"
			action={handleSubmit}
		>
			<h3 className="text-sm font-semibold text-success">Conciliar pago</h3>
			<label className="block text-sm">
				<span className="text-muted-foreground">Notas de conciliaci&oacute;n (opcional)</span>
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
				/>
			</label>
			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Conciliando..." : "Confirmar conciliaci&oacute;n"}
			</button>
		</form>
	);
}
