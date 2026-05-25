"use client";

import type { ServiceEntrySheet } from "@cermont/shared-types";
import { ArrowLeft, Ban, CheckCircle2, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
	useApproveServiceEntrySheet,
	useCancelServiceEntrySheet,
	useRejectServiceEntrySheet,
	useServiceEntrySheet,
	useSubmitServiceEntrySheet,
} from "@/modules/billing/queries";

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
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
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
			className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a SES / Ariba
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
			<h2 className="text-base font-semibold text-[var(--text-primary)]">
				No se pudo cargar el SES
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
			<h2 className="text-base font-semibold text-[var(--text-primary)]">SES no encontrado</h2>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				El identificador no corresponde a ning&uacute;n Service Entry Sheet registrado.
			</p>
			<Link
				href="/billing/ses"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				<ArrowLeft className="size-4" />
				Volver al listado
			</Link>
		</div>
	);
}

function SESContent({ ses }: { ses: ServiceEntrySheet }) {
	const [activeAction, setActiveAction] = useState<string>("none");

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
	const canApprove = ses.status === "submitted";
	const canReject = ses.status === "submitted";
	const canCancel = ses.status === "draft" || ses.status === "created" || ses.status === "rejected";

	const showAction = (name: string) => activeAction === name;
	const toggleAction = (name: string) => setActiveAction(activeAction === name ? "none" : name);

	return (
		<>
			<SESInfo ses={ses} />

			{canSubmit || canApprove || canReject || canCancel ? (
				<div className="flex flex-wrap gap-3">
					{canSubmit && activeAction !== "submit" && (
						<button
							type="button"
							onClick={() => toggleAction("submit")}
							disabled={submitMutation.isPending}
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<Send className="size-4" />
							Enviar para aprobaci&oacute;n
						</button>
					)}
					{canApprove && activeAction !== "approve" && (
						<button
							type="button"
							onClick={() => toggleAction("approve")}
							disabled={approveMutation.isPending}
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] disabled:opacity-50"
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
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] disabled:opacity-50"
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
				<RejectForm onReject={handleReject} pending={rejectMutation.isPending} />
			)}
			{showAction("cancel") && (
				<ConfirmCancel onCancel={handleCancel} pending={cancelMutation.isPending} />
			)}
		</>
	);
}

function SESInfo({ ses }: { ses: ServiceEntrySheet }) {
	const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
	const fmtDate = (v?: string) => (v ? dateFmt.format(new Date(v)) : "Sin fecha");
	const currencyFmt = new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: ses.currency,
		maximumFractionDigits: 0,
	});

	const statusTone =
		ses.status === "approved"
			? "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
			: ses.status === "rejected" || ses.status === "cancelled"
				? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
				: ses.status === "submitted" || ses.status === "created" || ses.status === "draft"
					? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
					: "border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";

	return (
		<div className="space-y-4">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="ses-detail-title" className="text-xl font-semibold text-[var(--text-primary)]">
							{ses.code}
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">
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
					valueClass="text-[var(--color-brand)] font-semibold"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FieldCard title="Enviado" value={fmtDate(ses.submittedAt)} />
				<FieldCard title="Aprobado" value={fmtDate(ses.approvedAt)} />
				<FieldCard title="Rechazado" value={fmtDate(ses.rejectedAt)} />
				<FieldCard title="Referencia aprobador" value={ses.approverReference || "Sin referencia"} />
			</div>

			{ses.rejectionReason && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4">
					<h3 className="text-sm font-semibold text-[var(--color-danger)]">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{ses.rejectionReason}</p>
				</div>
			)}

			{ses.description && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Descripci&oacute;n</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{ses.description}</p>
				</div>
			)}

			{ses.serviceLines && ses.serviceLines.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">
						L&iacute;neas de servicio
					</h3>
					<table className="mt-3 w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border-subtle)]">
								<th className="py-2 text-left text-xs font-medium text-[var(--text-muted)]">
									Descripci&oacute;n
								</th>
								<th className="py-2 text-right text-xs font-medium text-[var(--text-muted)]">
									Cant.
								</th>
								<th className="py-2 text-right text-xs font-medium text-[var(--text-muted)]">
									P. Unit.
								</th>
								<th className="py-2 text-right text-xs font-medium text-[var(--text-muted)]">
									Total
								</th>
							</tr>
						</thead>
						<tbody>
							{ses.serviceLines.map((line) => (
								<tr key={line.description} className="border-b border-[var(--border-subtle)]">
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

			<div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
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
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<p className="text-xs font-medium uppercase text-[var(--text-muted)]">{title}</p>
			<p className={`mt-1 text-sm text-[var(--text-primary)] ${valueClass ?? ""}`}>{value}</p>
		</div>
	);
}

function SubmitForm({ onSubmit, pending }: { onSubmit: () => void; pending: boolean }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4">
			<h3 className="text-sm font-semibold text-[var(--color-warning)]">
				Enviar para aprobaci&oacute;n
			</h3>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				&iquest;Desea enviar este SES para aprobaci&oacute;n?
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
			<h3 className="text-sm font-semibold text-[var(--color-success)]">Aprobar SES</h3>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				&iquest;Confirma la aprobaci&oacute;n de este Service Entry Sheet?
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
				if (reason.trim().length < 10) {
					return;
				}
				onReject(reason.trim());
			}}
		>
			<h3 className="text-sm font-semibold text-[var(--color-danger)]">Rechazar SES</h3>
			<label className="block text-sm">
				<span className="text-[var(--text-secondary)]">
					Motivo de rechazo * (m&iacute;nimo 10 caracteres)
				</span>
				<textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
					required
					minLength={10}
					aria-required="true"
				/>
			</label>
			<button
				type="submit"
				disabled={pending || reason.trim().length < 10}
				className="rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Rechazando..." : "Confirmar rechazo"}
			</button>
		</form>
	);
}

function ConfirmCancel({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {
	return (
		<div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<h3 className="text-sm font-semibold text-[var(--text-primary)]">Cancelar SES</h3>
			<p className="text-sm text-[var(--text-secondary)]">
				&iquest;Est&aacute; seguro de que desea cancelar este SES? Esta acci&oacute;n no se puede
				deshacer.
			</p>
			<button
				type="button"
				onClick={onCancel}
				disabled={pending}
				className="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] disabled:opacity-50"
			>
				{pending ? "Cancelando..." : "Confirmar cancelaci&oacute;n"}
			</button>
		</div>
	);
}
