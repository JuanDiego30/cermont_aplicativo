"use client";

import type { Payment, PaymentMethod } from "@cermont/shared-types";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { usePayment, useReconcilePayment, useRejectPayment } from "@/modules/billing/queries";

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
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
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
			className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a Pagos
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
			<h2 className="text-base font-semibold text-[var(--text-primary)]">
				No se pudo cargar el pago
			</h2>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				Ocurri&oacute;n un error al obtener los datos.
			</p>
			<button
				type="button"
				onClick={onRetry}
				className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
			>
				Reintentar
			</button>
		</div>
	);
}

function EmptyCard() {
	return (
		<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
			<h2 className="text-base font-semibold text-[var(--text-primary)]">Pago no encontrado</h2>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				El identificador no corresponde a ning&uacute;n pago registrado.
			</p>
			<Link
				href="/payments"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
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
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] disabled:opacity-50"
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
				<RejectForm onReject={handleReject} pending={rejectMutation.isPending} />
			)}
		</>
	);
}

function PaymentInfo({ payment }: { payment: Payment }) {
	const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
	const fmtDate = (v?: string) => (v ? dateFmt.format(new Date(v)) : "Sin fecha");
	const currencyFmt = new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: payment.currency,
		maximumFractionDigits: 0,
	});

	const statusTone =
		payment.status === "reconciled"
			? "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
			: payment.status === "rejected"
				? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
				: payment.status === "recorded" || payment.status === "due"
					? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
					: "border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";

	return (
		<div className="space-y-4">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2
							id="payment-detail-title"
							className="text-xl font-semibold text-[var(--text-primary)]"
						>
							{payment.paymentReference}
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">
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
					valueClass="text-[var(--color-brand)] font-semibold"
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
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4">
					<h3 className="text-sm font-semibold text-[var(--color-danger)]">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{payment.rejectionReason}</p>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
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
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<p className="text-xs font-medium uppercase text-[var(--text-muted)]">{title}</p>
			<p className={`mt-1 text-sm text-[var(--text-primary)] ${valueClass ?? ""}`}>{value}</p>
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

	return (
		<form
			className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-4"
			onSubmit={(e) => {
				e.preventDefault();
				onReconcile(notes.trim() || undefined);
			}}
		>
			<h3 className="text-sm font-semibold text-[var(--color-success)]">Conciliar pago</h3>
			<label className="block text-sm">
				<span className="text-[var(--text-secondary)]">
					Notas de conciliaci&oacute;n (opcional)
				</span>
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
				/>
			</label>
			<button
				type="submit"
				disabled={pending}
				className="rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Conciliando..." : "Confirmar conciliaci&oacute;n"}
			</button>
		</form>
	);
}

function RejectForm({
	onReject,
	pending,
}: {
	onReject: (reason: string) => void;
	pending: boolean;
}) {
	const [reason, setReason] = useState("");

	return (
		<form
			className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4"
			onSubmit={(e) => {
				e.preventDefault();
				if (reason.trim().length < 5) {
					return;
				}
				onReject(reason.trim());
			}}
		>
			<h3 className="text-sm font-semibold text-[var(--color-danger)]">Rechazar pago</h3>
			<label className="block text-sm">
				<span className="text-[var(--text-secondary)]">
					Motivo de rechazo * (m&iacute;nimo 5 caracteres)
				</span>
				<textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
					required
					minLength={5}
					aria-required="true"
				/>
			</label>
			<button
				type="submit"
				disabled={pending || reason.trim().length < 5}
				className="rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Rechazando..." : "Confirmar rechazo"}
			</button>
		</form>
	);
}
