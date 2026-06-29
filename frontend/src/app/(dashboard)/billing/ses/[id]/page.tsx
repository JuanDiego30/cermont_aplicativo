"use client";

import type { ServiceEntrySheet } from "@cermont/shared-types";
import { ArrowLeft, Ban, CheckCircle2, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { RejectForm } from "@/core/ui/RejectForm";
import {
	useApproveServiceEntrySheet,
	useCancelServiceEntrySheet,
	useRejectServiceEntrySheet,
	useServiceEntrySheet,
	useSubmitServiceEntrySheet,
} from "@/modules/billing/queries";
import { usePermissions } from "@/modules/core/hooks/usePermissions";

const DATE_FMT = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const fmtDate = (v?: string) => (v ? DATE_FMT.format(new Date(v)) : "Sin fecha");

export default function SESDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<SESDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando SES">
			<div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
		</section>
	);
}

function SESDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useServiceEntrySheet(id);
	const ses = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="ses-detail-title">
			<BackLink />

			{isLoading && <DetailSkeleton />}

			{isError && <ErrorCard onRetry={refetch} />}

			{!isLoading && !isError && !ses && <EmptyCard />}

			{ses && <SESContent ses={ses} />}
		</section>
	);
}

function BackLink() {
	return (
		<Link
			href="/billing/ses"
			className="inline-flex items-center gap-2 text-sm font-medium text-brand"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a SES / Ariba
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-5">
			<h2 className="text-base font-semibold text-foreground">No se pudo cargar el SES</h2>
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
			<h2 className="text-base font-semibold text-foreground">SES no encontrado</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				El identificador no corresponde a ning&uacute;n Service Entry Sheet registrado.
			</p>
			<Link
				href="/billing/ses"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
			>
				<ArrowLeft className="size-4" />
				Volver al listado
			</Link>
		</div>
	);
}

function SESContent({ ses }: { ses: ServiceEntrySheet }) {
	const [activeAction, setActiveAction] = useState<string>("none");
	const { canApprove } = usePermissions();

	const submitMutation = useSubmitServiceEntrySheet(ses._id);
	const approveMutation = useApproveServiceEntrySheet(ses._id);
	const rejectMutation = useRejectServiceEntrySheet(ses._id);
	const cancelMutation = useCancelServiceEntrySheet(ses._id);

	const handleSubmit = async () => {
		try {
			await submitMutation.mutateAsync({ clientMutationId: uuidv4() });
			toast.success("SES enviado para aprobaci&oacute;n");
			setActiveAction("none");
		} catch {
			toast.error("Error al enviar el SES");
		}
	};

	const handleApprove = async () => {
		try {
			await approveMutation.mutateAsync();
			toast.success("SES aprobado correctamente");
			setActiveAction("none");
		} catch {
			toast.error("Error al aprobar el SES");
		}
	};

	const handleReject = async (reason: string) => {
		try {
			await rejectMutation.mutateAsync({ reason, clientMutationId: uuidv4() });
			toast.success("SES rechazado");
			setActiveAction("none");
		} catch {
			toast.error("Error al rechazar el SES");
		}
	};

	const handleCancel = async () => {
		try {
			await cancelMutation.mutateAsync();
			toast.success("SES cancelado");
			setActiveAction("none");
		} catch {
			toast.error("Error al cancelar el SES");
		}
	};

	const canSubmit = ses.status === "draft" || ses.status === "created";
	const canApproveStatus = ses.status === "submitted";
	const canRejectStatus = ses.status === "submitted";
	const canCancel = ses.status === "draft" || ses.status === "created" || ses.status === "rejected";

	const showAction = (name: string) => activeAction === name;
	const toggleAction = (name: string) => setActiveAction(activeAction === name ? "none" : name);

	return (
		<>
			<SESInfo ses={ses} />

			{canSubmit || canApproveStatus || canRejectStatus || canCancel ? (
				<div className="flex flex-wrap gap-3">
					{canSubmit && activeAction !== "submit" && (
						<button
							type="button"
							onClick={() => toggleAction("submit")}
							disabled={submitMutation.isPending}
							className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<Send className="size-4" />
							Enviar para aprobaci&oacute;n
						</button>
					)}
					{canApproveStatus && activeAction !== "approve" && (
						<button
							type="button"
							onClick={() => toggleAction("approve")}
							disabled={approveMutation.isPending || !canApprove}
							aria-disabled={!canApprove}
							title={!canApprove ? "No tienes permiso para aprobar" : void 0}
							className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<CheckCircle2 className="size-4" />
							Aprobar
						</button>
					)}
					{canRejectStatus && activeAction !== "reject" && (
						<button
							type="button"
							onClick={() => toggleAction("reject")}
							disabled={rejectMutation.isPending || !canApprove}
							aria-disabled={!canApprove}
							title={!canApprove ? "No tienes permiso para rechazar" : void 0}
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
				<SubmitForm onSubmit={handleSubmit} pending={submitMutation.isPending} />
			)}
			{showAction("approve") && (
				<ConfirmApprove onApprove={handleApprove} pending={approveMutation.isPending} />
			)}
			{showAction("reject") && (
				<RejectForm
					title="Rechazar SES"
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

function SESInfo({ ses }: { ses: ServiceEntrySheet }) {
	const currencyFmt = useMemo(
		() =>
			new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: ses.currency,
				maximumFractionDigits: 0,
			}),
		[ses.currency],
	);

	const statusTone =
		ses.status === "approved"
			? "border-success/20 bg-success/10 text-success"
			: ses.status === "rejected" || ses.status === "cancelled"
				? "border-destructive/20 bg-destructive/10 text-destructive"
				: ses.status === "submitted" || ses.status === "created" || ses.status === "draft"
					? "border-warning/20 bg-warning/10 text-warning"
					: "border-border bg-surface-secondary text-muted-foreground";

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-border bg-card p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="ses-detail-title" className="text-xl font-semibold text-foreground">
							{ses.code}
						</h2>
						<p className="text-sm text-muted-foreground">
							{ses.clientName} &middot; Orden {ses.workOrderId}
						</p>
					</div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
					>
						{ses.status}
					</span>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<FieldCard title="Cliente" value={ses.clientName} />
				<FieldCard
					title="Cuenta de facturaci&oacute;n"
					value={ses.billingAccount || "Sin asignar"}
				/>
				<FieldCard
					title="Referencia Ariba"
					value={ses.aribaDocumentNumber || ses.aribaReference || "Sin referencia"}
				/>
				<FieldCard title="Subtotal" value={currencyFmt.format(ses.subtotal ?? ses.amount ?? 0)} />
				<FieldCard title="Impuestos" value={currencyFmt.format(ses.taxAmount)} />
				<FieldCard
					title="Total"
					value={currencyFmt.format(ses.totalAmount)}
					valueClass="text-brand font-semibold"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FieldCard title="Enviado" value={fmtDate(ses.submittedAt)} />
				<FieldCard title="Aprobado" value={fmtDate(ses.approvedAt)} />
				<FieldCard title="Rechazado" value={fmtDate(ses.rejectedAt)} />
				<FieldCard title="Referencia aprobador" value={ses.approverReference || "Sin referencia"} />
			</div>

			{ses.rejectionReason && (
				<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
					<h3 className="text-sm font-semibold text-destructive">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-muted-foreground">{ses.rejectionReason}</p>
				</div>
			)}

			{ses.description && (
				<div className="rounded-lg border border-border bg-card p-4 shadow-card">
					<h3 className="text-sm font-semibold text-foreground">Descripci&oacute;n</h3>
					<p className="mt-2 text-sm text-muted-foreground">{ses.description}</p>
				</div>
			)}

			{ses.serviceLines && ses.serviceLines.length > 0 && (
				<div className="rounded-lg border border-border bg-card p-4 shadow-card">
					<h3 className="text-sm font-semibold text-foreground">L&iacute;neas de servicio</h3>
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
							{ses.serviceLines.map((line) => (
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

			<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
				<span>Creado: {fmtDate(ses.createdAt)}</span>
				<span>Actualizado: {fmtDate(ses.updatedAt)}</span>
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

function SubmitForm({ onSubmit, pending }: { onSubmit: () => void; pending: boolean }) {
	return (
		<div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
			<h3 className="text-sm font-semibold text-warning">Enviar para aprobaci&oacute;n</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				&iquest;Desea enviar este SES para aprobaci&oacute;n?
			</p>
			<button
				type="button"
				onClick={onSubmit}
				disabled={pending}
				className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Enviando..." : "Confirmar env&iacute;o"}
			</button>
		</div>
	);
}

function ConfirmApprove({ onApprove, pending }: { onApprove: () => void; pending: boolean }) {
	return (
		<div className="rounded-lg border border-success/20 bg-success/10 p-4">
			<h3 className="text-sm font-semibold text-success">Aprobar SES</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				&iquest;Confirma la aprobaci&oacute;n de este Service Entry Sheet?
			</p>
			<button
				type="button"
				onClick={onApprove}
				disabled={pending}
				className="mt-3 rounded-md bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Aprobando..." : "Confirmar aprobaci&oacute;n"}
			</button>
		</div>
	);
}

function ConfirmCancel({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {
	return (
		<div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-card">
			<h3 className="text-sm font-semibold text-foreground">Cancelar SES</h3>
			<p className="text-sm text-muted-foreground">
				&iquest;Est&aacute; seguro de que desea cancelar este SES? Esta acci&oacute;n no se puede
				deshacer.
			</p>
			<button
				type="button"
				onClick={onCancel}
				disabled={pending}
				className="rounded-md border border-destructive bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
			>
				{pending ? "Cancelando..." : "Confirmar cancelaci&oacute;n"}
			</button>
		</div>
	);
}
