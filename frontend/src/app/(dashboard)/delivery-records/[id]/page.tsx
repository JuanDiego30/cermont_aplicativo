"use client";

import type { DeliveryRecord, DeliverySignatureMethod } from "@cermont/shared-types";
import { ArrowLeft, Ban, FileSignature, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useReducer, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
	useCancelDeliveryRecord,
	useDeliveryRecord,
	useRejectDeliveryRecord,
	useSendDeliveryRecord,
	useSignDeliveryRecord,
} from "@/modules/billing/queries";

import { RejectForm } from "@/core/ui/RejectForm";

const DATE_FMT = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const fmtDate = (v?: string) => (v ? DATE_FMT.format(new Date(v)) : "Sin fecha");

function deliveryStatusTone(status: DeliveryRecord["status"]): string {
	if (status === "signed") {
		return "border-success/30 bg-success/5 text-success";
	}
	if (status === "rejected" || status === "cancelled") {
		return "border-destructive/30 bg-destructive/5 text-destructive";
	}
	if (status === "draft" || status === "sent") {
		return "border-warning/30 bg-warning/5 text-warning";
	}
	return "border-border bg-surface-secondary text-muted-foreground";
}

function acceptanceStatusTone(status: DeliveryRecord["acceptanceStatus"]): string {
	if (status === "accepted") {
		return "text-success";
	}
	if (status === "rejected") {
		return "text-destructive";
	}
	if (status === "accepted_with_observations") {
		return "text-warning";
	}
	return "text-muted-foreground";
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
			<div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
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
			className="inline-flex items-center gap-2 text-sm font-medium text-brand"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Volver a Actas de entrega
		</Link>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-5">
			<h2 className="text-base font-semibold text-foreground">
				No se pudo cargar el acta
			</h2>
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
			<h2 className="text-base font-semibold text-foreground">Acta no encontrada</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				El identificador no corresponde a ning&uacute;n acta registrada.
			</p>
			<Link
				href="/delivery-records"
				className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
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
							className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
							className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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

			{showAction("send") && <SendForm onSend={handleSend} pending={sendMutation.isPending} />}
			{showAction("sign") && <SignForm onSign={handleSign} pending={signMutation.isPending} />}
			{showAction("reject") && (
				<RejectForm
					title="Rechazar Acta"
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

function RecordInfo({ record }: { record: DeliveryRecord }) {
  return (
		<div className="space-y-4">
			<div className="rounded-lg border border-border bg-card p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="dr-detail-title" className="text-xl font-semibold text-foreground">
							{record.code}
						</h2>
						<p className="text-sm text-muted-foreground">
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
				<div className="rounded-lg border border-border bg-card p-4 shadow-card">
					<h3 className="text-sm font-semibold text-foreground">
						Observaciones del cliente
					</h3>
					<p className="mt-2 text-sm text-muted-foreground">{record.clientObservations}</p>
				</div>
			)}

			{record.rejectionReason && (
				<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
					<h3 className="text-sm font-semibold text-destructive">Motivo de rechazo</h3>
					<p className="mt-2 text-sm text-muted-foreground">{record.rejectionReason}</p>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
		<div className="rounded-lg border border-border bg-card p-4 shadow-card">
			<p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
			<p className={`mt-1 text-sm text-foreground ${valueClass ?? ""}`}>{value}</p>
		</div>
	);
}

function SendForm({ onSend, pending }: { onSend: () => void; pending: boolean }) {
	return (
		<div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
			<h3 className="text-sm font-semibold text-warning">Confirmar env&iacute;o</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				&iquest;Desea enviar esta acta para firma del cliente?
			</p>
			<button
				type="button"
				onClick={onSend}
				disabled={pending}
				className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
	type SignFormState = {
		docRef: string;
		method: DeliverySignatureMethod;
		obs: string;
		signedAt: string;
		signedBy: string;
	};
	type SignFormField = keyof SignFormState;
	type SignFormAction = { field: SignFormField; value: SignFormState[SignFormField] };

	const [form, dispatch] = useReducer(
		(state: SignFormState, action: SignFormAction): SignFormState => ({
			...state,
			[action.field]: action.value,
		}),
		{
			docRef: "",
			method: "manual",
			obs: "",
			signedAt: new Date().toISOString().slice(0, 16),
			signedBy: "",
		},
	);
	const { docRef, method, obs, signedAt, signedBy } = form;
	const setField = <TField extends SignFormField>(field: TField, value: SignFormState[TField]) =>
		dispatch({ field, value });

	const valid = docRef.trim().length > 0 && signedBy.trim().length > 0;

	const handleSubmit = async () => {
		if (!valid) {
			return;
		}

		await onSign({
			signedDocumentRef: docRef.trim(),
			signatureMethod: method,
			signedAt: new Date(signedAt).toISOString(),
			signedBy: signedBy.trim(),
			clientObservations: obs.trim() || undefined,
		});
	};

	return (
		<form
			className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-card"
			action={handleSubmit}
		>
			<h3 className="text-sm font-semibold text-foreground">Firmar acta</h3>

			<div className="space-y-1">
				<label htmlFor="docRef" className="text-sm text-muted-foreground">Referencia del documento firmado *</label>
				<input
					id="docRef"
					type="text"
					value={docRef}
					onChange={(e) => setField("docRef", e.target.value)}
					className="w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
					required
					aria-required="true"
				/>
			</div>

			<div className="space-y-1">
				<label htmlFor="method" className="text-sm text-muted-foreground">M&eacute;todo de firma *</label>
				<select
					id="method"
					value={method}
					onChange={(e) => setField("method", e.target.value as DeliverySignatureMethod)}
					className="w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
					required
					aria-required="true"
				>
					<option value="manual">Manual</option>
					<option value="digital">Digital</option>
					<option value="uploaded_document">Documento cargado</option>
				</select>
			</div>

			<div className="space-y-1">
				<label htmlFor="signedAt" className="text-sm text-muted-foreground">Fecha y hora de firma *</label>
				<input
					id="signedAt"
					type="datetime-local"
					value={signedAt}
					onChange={(e) => setField("signedAt", e.target.value)}
					className="w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
					required
				/>
			</div>

			<div className="space-y-1">
				<label htmlFor="signedBy" className="text-sm text-muted-foreground">Nombre de quien firma *</label>
				<input
					id="signedBy"
					type="text"
					value={signedBy}
					onChange={(e) => setField("signedBy", e.target.value)}
					className="mt-1 w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
					required
					aria-required="true"
				/>
			</div>

			<label htmlFor="obs" className="block text-sm">
				<span className="text-muted-foreground">Observaciones (opcional)</span>
				<textarea
					id="obs"
					value={obs}
					onChange={(e) => setField("obs", e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
				/>
			</label>

			<button
				type="submit"
				disabled={pending || !valid}
				className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Firmando..." : "Confirmar firma"}
			</button>
		</form>
	);
}

function ConfirmCancel({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {
	return (
		<div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-card">
			<h3 className="text-sm font-semibold text-foreground">Cancelar acta</h3>
			<p className="text-sm text-muted-foreground">
				&iquest;Est&aacute; seguro de que desea cancelar esta acta? Esta acci&oacute;n no se puede
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
