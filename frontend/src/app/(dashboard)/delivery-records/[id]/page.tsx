"use client";

import type { DeliveryRecord, DeliverySignatureMethod } from "@cermont/shared-types";
import { ArrowLeft, Ban, FileSignature, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
	useCancelDeliveryRecord,
	useDeliveryRecord,
	useRejectDeliveryRecord,
	useSendDeliveryRecord,
	useSignDeliveryRecord,
} from "@/modules/billing/queries";

function deliveryStatusTone(status: DeliveryRecord["status"]): string {
	if (status === "signed") {
		return "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]";
	}
	if (status === "rejected" || status === "cancelled") {
		return "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]";
	}
	if (status === "draft" || status === "sent") {
		return "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]";
	}
	return "border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";
}

function acceptanceStatusTone(status: DeliveryRecord["acceptanceStatus"]): string {
	if (status === "accepted") {
		return "text-[var(--color-success)]";
	}
	if (status === "rejected") {
		return "text-[var(--color-danger)]";
	}
	if (status === "accepted_with_observations") {
		return "text-[var(--color-warning)]";
	}
	return "text-[var(--text-secondary)]";
}

export default function DeliveryRecordDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<DeliveryRecordDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando acta de entrega">
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
		</section>
	);
}

function DeliveryRecordDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useDeliveryRecord(id);
	const record = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="dr-detail-title">
			<BackLink />

			{isLoading && <DetailSkeleton />}

			{isError && <ErrorCard onRetry={refetch} />}

			{!isLoading && !isError && !record && <EmptyCard />}

			{record && <RecordContent record={record} />}
		</section>
	);
}

function BackLink() {
	return (
		<Link
			href="/delivery-records"
			className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a Actas de entrega
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
			<h2 className="text-base font-semibold text-[var(--text-primary)]">
				No se pudo cargar el acta
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
			<h2 className="text-base font-semibold text-[var(--text-primary)]">Acta no encontrada</h2>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				El identificador no corresponde a ning&uacute;n acta registrada.
			</p>
			<Link
				href="/delivery-records"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				<ArrowLeft className="size-4" />
				Volver al listado
			</Link>
		</div>
	);
}

function RecordContent({ record }: { record: DeliveryRecord }) {
	const [activeAction, setActiveAction] = useState<string>("none");

	const sendMutation = useSendDeliveryRecord(record._id);
	const signMutation = useSignDeliveryRecord(record._id);
	const rejectMutation = useRejectDeliveryRecord(record._id);
	const cancelMutation = useCancelDeliveryRecord(record._id);

	const handleSend = async () => {
		try {
			await sendMutation.mutateAsync({ clientMutationId: uuidv4() });
			toast.success("Acta enviada correctamente");
			setActiveAction("none");
		} catch {
			toast.error("Error al enviar el acta");
		}
	};

	const handleSign = async (data: {
		signedDocumentRef: string;
		signatureMethod: DeliverySignatureMethod;
		signedAt: string;
		signedBy: string;
		clientObservations?: string;
	}) => {
		try {
			await signMutation.mutateAsync({ ...data, clientMutationId: uuidv4() });
			toast.success("Acta firmada correctamente");
			setActiveAction("none");
		} catch {
			toast.error("Error al firmar el acta");
		}
	};

	const handleReject = async (reason: string) => {
		try {
			await rejectMutation.mutateAsync({ reason, clientMutationId: uuidv4() });
			toast.success("Acta rechazada");
			setActiveAction("none");
		} catch {
			toast.error("Error al rechazar el acta");
		}
	};

	const handleCancel = async () => {
		try {
			await cancelMutation.mutateAsync();
			toast.success("Acta cancelada");
			setActiveAction("none");
		} catch {
			toast.error("Error al cancelar el acta");
		}
	};

	const canSend = record.status === "draft";
	const canSign = record.status === "sent";
	const canReject = record.status === "sent" || record.status === "draft";
	const canCancel = record.status === "draft";

	const showAction = (name: string) => activeAction === name;
	const toggleAction = (name: string) => setActiveAction(activeAction === name ? "none" : name);

	return (
		<>
			<RecordInfo record={record} />

			{canSend || canSign || canReject || canCancel ? (
				<div className="flex flex-wrap gap-3">
					{canSend && activeAction !== "send" && (
						<button
							type="button"
							onClick={() => toggleAction("send")}
							disabled={sendMutation.isPending}
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<Send className="size-4" />
							Enviar
						</button>
					)}
					{canSign && activeAction !== "sign" && (
						<button
							type="button"
							onClick={() => toggleAction("sign")}
							disabled={signMutation.isPending}
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
						>
							<FileSignature className="size-4" />
							Firmar
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

			{showAction("send") && <SendForm onSend={handleSend} pending={sendMutation.isPending} />}
			{showAction("sign") && <SignForm onSign={handleSign} pending={signMutation.isPending} />}
			{showAction("reject") && (
				<RejectForm onReject={handleReject} pending={rejectMutation.isPending} />
			)}
			{showAction("cancel") && (
				<ConfirmCancel onCancel={handleCancel} pending={cancelMutation.isPending} />
			)}
		</>
	);
}

function RecordInfo({ record }: { record: DeliveryRecord }) {
	const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
	const fmtDate = (v?: string) => (v ? dateFmt.format(new Date(v)) : "Sin fecha");

	return (
		<div className="space-y-4">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="dr-detail-title" className="text-xl font-semibold text-[var(--text-primary)]">
							{record.code}
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">
							Orden {record.workOrderId} &middot; Informe {record.technicalReportId}
						</p>
					</div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${deliveryStatusTone(record.status)}`}
					>
						{record.status}
					</span>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FieldCard title="Fecha de entrega" value={fmtDate(record.deliveryDate)} />
				<FieldCard
					title="Representante del cliente"
					value={record.clientRepresentative || "Sin asignar"}
				/>
				<FieldCard title="Contacto del cliente" value={record.clientContact || "Sin asignar"} />
				<FieldCard
					title="Estado de aceptaci&oacute;n"
					value={record.acceptanceStatus}
					valueClass={acceptanceStatusTone(record.acceptanceStatus)}
				/>
				<FieldCard title="M&eacute;todo de firma" value={record.signatureMethod || "Sin firmar"} />
				<FieldCard title="Firmado por" value={record.signedBy || "Sin firmar"} />
				<FieldCard title="Fecha de firma" value={fmtDate(record.signedAt)} />
				<FieldCard title="Fecha de env&iacute;o" value={fmtDate(record.sentAt)} />
			</div>

			{record.clientObservations && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">
						Observaciones del cliente
					</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{record.clientObservations}</p>
				</div>
			)}

			{record.rejectionReason && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4">
					<h3 className="text-sm font-semibold text-[var(--color-danger)]">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{record.rejectionReason}</p>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
				<span>Creado: {fmtDate(record.createdAt)}</span>
				<span>Actualizado: {fmtDate(record.updatedAt)}</span>
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

function SendForm({ onSend, pending }: { onSend: () => void; pending: boolean }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4">
			<h3 className="text-sm font-semibold text-[var(--color-warning)]">Confirmar env&iacute;o</h3>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				&iquest;Desea enviar esta acta para firma del cliente?
			</p>
			<button
				type="button"
				onClick={onSend}
				disabled={pending}
				className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Enviando..." : "Confirmar env&iacute;o"}
			</button>
		</div>
	);
}

function SignForm({
	onSign,
	pending,
}: {
	onSign: (data: {
		signedDocumentRef: string;
		signatureMethod: DeliverySignatureMethod;
		signedAt: string;
		signedBy: string;
		clientObservations?: string;
	}) => void;
	pending: boolean;
}) {
	const [docRef, setDocRef] = useState("");
	const [method, setMethod] = useState<DeliverySignatureMethod>("manual");
	const [signedAt, setSignedAt] = useState(() => new Date().toISOString().slice(0, 16));
	const [signedBy, setSignedBy] = useState("");
	const [obs, setObs] = useState("");

	const valid = docRef.trim().length > 0 && signedBy.trim().length > 0;

	return (
		<form
			className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card"
			onSubmit={(e) => {
				e.preventDefault();
				if (!valid) {
					return;
				}
				onSign({
					signedDocumentRef: docRef.trim(),
					signatureMethod: method,
					signedAt: new Date(signedAt).toISOString(),
					signedBy: signedBy.trim(),
					clientObservations: obs.trim() || undefined,
				});
			}}
		>
			<h3 className="text-sm font-semibold text-[var(--text-primary)]">Firmar acta</h3>

			<label htmlFor="docRef" className="block text-sm">
				<span className="text-[var(--text-secondary)]">Referencia del documento firmado *</span>
				<input
					id="docRef"
					type="text"
					value={docRef}
					onChange={(e) => setDocRef(e.target.value)}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
					required
					aria-required="true"
				/>
			</label>

			<label htmlFor="method" className="block text-sm">
				<span className="text-[var(--text-secondary)]">M&eacute;todo de firma *</span>
				<select
					id="method"
					value={method}
					onChange={(e) => setMethod(e.target.value as DeliverySignatureMethod)}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
					required
					aria-required="true"
				>
					<option value="manual">Manual</option>
					<option value="digital">Digital</option>
					<option value="uploaded_document">Documento cargado</option>
				</select>
			</label>

			<label htmlFor="signedAt" className="block text-sm">
				<span className="text-[var(--text-secondary)]">Fecha y hora de firma *</span>
				<input
					id="signedAt"
					type="datetime-local"
					value={signedAt}
					onChange={(e) => setSignedAt(e.target.value)}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
					required
				/>
			</label>

			<label htmlFor="signedBy" className="block text-sm">
				<span className="text-[var(--text-secondary)]">Nombre de quien firma *</span>
				<input
					id="signedBy"
					type="text"
					value={signedBy}
					onChange={(e) => setSignedBy(e.target.value)}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
					required
					aria-required="true"
				/>
			</label>

			<label htmlFor="obs" className="block text-sm">
				<span className="text-[var(--text-secondary)]">Observaciones (opcional)</span>
				<textarea
					id="obs"
					value={obs}
					onChange={(e) => setObs(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm"
				/>
			</label>

			<button
				type="submit"
				disabled={pending || !valid}
				className="rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Firmando..." : "Confirmar firma"}
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
			<h3 className="text-sm font-semibold text-[var(--color-danger)]">Rechazar acta</h3>
			<label htmlFor="rejectReason" className="block text-sm">
				<span className="text-[var(--text-secondary)]">
					Motivo de rechazo * (m&iacute;nimo 5 caracteres)
				</span>
				<textarea
					id="rejectReason"
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

function ConfirmCancel({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {
	return (
		<div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<h3 className="text-sm font-semibold text-[var(--text-primary)]">Cancelar acta</h3>
			<p className="text-sm text-[var(--text-secondary)]">
				&iquest;Est&aacute; seguro de que desea cancelar esta acta? Esta acci&oacute;n no se puede
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
