"use client";

import { APPROVER_ROLES, hasRole } from "@cermont/domain";
import { isPresent } from "@cermont/shared-types";
import { CheckCircle2, FileWarning, RefreshCw, Send, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrder } from "@/modules/orders/queries";
import { useAuthStore } from "@/store/auth.store";
import {
	useApproveReport,
	useCreateReport,
	useOrderReport,
	useRejectReport,
	useUpdateReport,
} from "../queries";
import { ReportDownloadButton } from "./ReportDownloadButton";
import { ReportStatusBadge } from "./ReportStatusBadge";

interface ReportPanelProps {
	orderId: string;
	readOnly?: boolean;
}

type MaybeWorkReport = ReturnType<typeof useOrderReport>["data"];
type WorkReport = NonNullable<MaybeWorkReport>;

export function ReportPanel({ orderId, readOnly = false }: ReportPanelProps) {
	const { data: order, isLoading: orderLoading, error: orderError } = useOrder(orderId);
	const {
		data: reportData,
		isLoading: reportLoading,
		error: reportError,
	} = useOrderReport(orderId);
	const report = reportData ?? undefined;
	const userStatus = useAuthStore((state) => state.user);
	const currentRole = isPresent(userStatus) ? userStatus.value.role : "";
	const createReport = useCreateReport();
	const updateReport = useUpdateReport(report?._id ?? "");
	const approveReport = useApproveReport(report?._id ?? "");
	const rejectReport = useRejectReport(report?._id ?? "");
	const [rejectionReason, setRejectionReason] = useState("");

	const defaultTitle = useMemo(() => {
		if (order?.code) {
			return `Work report - ${order.code}`;
		}

		return `Work report - ${orderId}`;
	}, [order?.code, orderId]);

	const defaultSummary = useMemo(() => {
		const description = order?.description?.trim();
		if (description) {
			return description;
		}

		return `Operational summary for order ${orderId}`;
	}, [order?.description, orderId]);

	const canReview = hasRole(currentRole ?? "", APPROVER_ROLES);

	const handleCreate = async () => {
		try {
			await createReport.mutateAsync({
				orderId,
				title: defaultTitle,
				summary: defaultSummary,
			});
			toast.success("Informe generado");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo generar el informe");
		}
	};

	const handleSendToReview = async () => {
		if (!report) {
			return;
		}

		try {
			await updateReport.mutateAsync({ status: "pending_review" });
			toast.success("Informe enviado a revisión");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo enviar a revisión");
		}
	};

	const handleApprove = async () => {
		if (!report) {
			return;
		}

		try {
			await approveReport.mutateAsync();
			toast.success("Informe aprobado");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo aprobar el informe");
		}
	};

	const handleReject = async () => {
		if (!report) {
			return;
		}

		try {
			await rejectReport.mutateAsync(rejectionReason.trim() || "Rechazado para ajustes");
			toast.success("Informe rechazado");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo rechazar el informe");
		}
	};

	const handleRegenerate = async () => {
		if (!report) {
			return;
		}

		try {
			await updateReport.mutateAsync({ status: "draft", rejectionReason: "" });
			toast.success("Informe regresado a borrador");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo regenerar el informe");
		}
	};

	if (orderLoading || reportLoading) {
		return <ReportSkeleton />;
	}

	if (orderError || reportError) {
		return (
			<div className="rounded-xl border border-red-200 bg-danger-bg p-4 text-sm text-brand-error dark:border-red-900/30 dark:bg-red-900/10 dark:text-brand-error">
				No se pudo cargar el informe.
			</div>
		);
	}

	const actionPending =
		createReport.isPending ||
		updateReport.isPending ||
		approveReport.isPending ||
		rejectReport.isPending;

	return (
		<section
			aria-labelledby="work-report-title"
			className="space-y-4 rounded-xl border border-hairline bg-canvas p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
		>
			<ReportPanelHeader
				actionPending={actionPending}
				createPending={createReport.isPending}
				readOnly={readOnly}
				report={report}
				onCreate={handleCreate}
			/>
			{report ? (
				<ReportContent
					actionPending={actionPending}
					canReview={canReview}
					orderId={orderId}
					readOnly={readOnly}
					rejectionReason={rejectionReason}
					report={report}
					onApprove={handleApprove}
					onRegenerate={handleRegenerate}
					onReject={handleReject}
					onRejectionReasonChange={setRejectionReason}
					onSendToReview={handleSendToReview}
				/>
			) : (
				<NoReportState />
			)}
		</section>
	);
}

function ReportPanelHeader({
	actionPending,
	createPending,
	readOnly,
	report,
	onCreate,
}: {
	actionPending: boolean;
	createPending: boolean;
	readOnly: boolean;
	report: MaybeWorkReport;
	onCreate: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<h2 id="work-report-title" className="text-lg font-semibold text-ink dark:text-white">
						Informe de trabajo
					</h2>
					{report ? <ReportStatusBadge status={report.status} /> : <MissingReportBadge />}
				</div>
				<p className="text-sm text-steel dark:text-stone">
					Consolida checklist firmado, costos, evidencias y la aprobación operativa antes de
					facturar.
				</p>
			</div>

			{!readOnly && !report ? (
				<button
					type="button"
					onClick={onCreate}
					disabled={actionPending}
					className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
				>
					<Send className="size-4" aria-hidden="true" />
					{createPending ? "Generando…" : "Generar informe"}
				</button>
			) : null}
		</div>
	);
}

function MissingReportBadge() {
	return (
		<span className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-xs font-medium text-charcoal dark:border-zinc-800 dark:bg-canvas dark:text-muted-text">
			Sin informe
		</span>
	);
}

function ReportContent({
	actionPending,
	canReview,
	orderId,
	readOnly,
	rejectionReason,
	report,
	onApprove,
	onRegenerate,
	onReject,
	onRejectionReasonChange,
	onSendToReview,
}: {
	actionPending: boolean;
	canReview: boolean;
	orderId: string;
	readOnly: boolean;
	rejectionReason: string;
	report: WorkReport;
	onApprove: () => void;
	onRegenerate: () => void;
	onReject: () => void;
	onRejectionReasonChange: (value: string) => void;
	onSendToReview: () => void;
}) {
	return (
		<div className="space-y-4">
			<ReportInclusionGrid report={report} />
			<ReportSummaryBlock summary={report.summary} />
			<ReportDraftActions
				actionPending={actionPending}
				readOnly={readOnly}
				status={report.status}
				onSendToReview={onSendToReview}
			/>
			<PendingReviewBlock
				actionPending={actionPending}
				canReview={canReview}
				rejectionReason={rejectionReason}
				status={report.status}
				onApprove={onApprove}
				onReject={onReject}
				onRejectionReasonChange={onRejectionReasonChange}
			/>
			<ApprovedReportBlock orderId={orderId} status={report.status} />
			<RejectedReportBlock
				actionPending={actionPending}
				readOnly={readOnly}
				rejectionReason={report.rejectionReason}
				status={report.status}
				onRegenerate={onRegenerate}
			/>
		</div>
	);
}

function ReportInclusionGrid({ report }: { report: WorkReport }) {
	return (
		<div className="grid gap-3 sm:grid-cols-3">
			<InfoCard
				label="Checklist"
				value={report.includesChecklist ? "Incluido" : "No incluido"}
				tone={report.includesChecklist ? "green" : "slate"}
			/>
			<InfoCard
				label="Costos"
				value={report.includesCosts ? "Incluidos" : "No incluidos"}
				tone={report.includesCosts ? "green" : "slate"}
			/>
			<InfoCard
				label="Evidencias"
				value={report.includesEvidences ? "Incluidas" : "No incluidas"}
				tone={report.includesEvidences ? "green" : "slate"}
			/>
		</div>
	);
}

function ReportSummaryBlock({ summary }: { summary: string }) {
	return (
		<div className="rounded-lg border border-hairline bg-surface p-4 dark:border-zinc-800 dark:bg-canvas">
			<p className="text-xs font-medium uppercase tracking-wide text-steel dark:text-stone">
				Resumen
			</p>
			<p className="mt-2 text-sm leading-relaxed text-charcoal dark:text-muted-text">{summary}</p>
		</div>
	);
}

function ReportDraftActions({
	actionPending,
	readOnly,
	status,
	onSendToReview,
}: {
	actionPending: boolean;
	readOnly: boolean;
	status: WorkReport["status"];
	onSendToReview: () => void;
}) {
	if (status !== "draft" || readOnly) {
		return null;
	}

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<button
				type="button"
				onClick={onSendToReview}
				disabled={actionPending}
				className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-warning-bg px-4 py-2 text-sm font-medium text-brand-warn transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-brand-warn"
			>
				<Send className="size-4" aria-hidden="true" />
				Enviar a revisión
			</button>
		</div>
	);
}

function PendingReviewBlock({
	actionPending,
	canReview,
	rejectionReason,
	status,
	onApprove,
	onReject,
	onRejectionReasonChange,
}: {
	actionPending: boolean;
	canReview: boolean;
	rejectionReason: string;
	status: WorkReport["status"];
	onApprove: () => void;
	onReject: () => void;
	onRejectionReasonChange: (value: string) => void;
}) {
	if (status !== "pending_review") {
		return null;
	}

	return (
		<div className="space-y-3 rounded-lg border border-hairline bg-surface p-4 dark:border-zinc-800 dark:bg-canvas">
			<p className="text-sm text-charcoal dark:text-muted-text">El informe espera revisión.</p>
			{canReview ? (
				<ReportReviewActions
					actionPending={actionPending}
					rejectionReason={rejectionReason}
					onApprove={onApprove}
					onReject={onReject}
					onRejectionReasonChange={onRejectionReasonChange}
				/>
			) : (
				<p className="text-sm text-steel dark:text-stone">
					Solo supervisor o gerente pueden aprobar o rechazar.
				</p>
			)}
		</div>
	);
}

function ReportReviewActions({
	actionPending,
	rejectionReason,
	onApprove,
	onReject,
	onRejectionReasonChange,
}: {
	actionPending: boolean;
	rejectionReason: string;
	onApprove: () => void;
	onReject: () => void;
	onRejectionReasonChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<button
				type="button"
				onClick={onApprove}
				disabled={actionPending}
				className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-500 dark:hover:bg-green-600"
			>
				<CheckCircle2 className="size-4" aria-hidden="true" />
				Aprobar
			</button>
			<div className="flex flex-1 flex-col gap-2 sm:flex-row">
				<input
					value={rejectionReason}
					onChange={(event) => onRejectionReasonChange(event.target.value)}
					placeholder="Motivo de rechazo"
					aria-label="Motivo de rechazo"
					className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
				/>
				<button
					type="button"
					onClick={onReject}
					disabled={actionPending}
					className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-danger-bg px-4 py-2 text-sm font-medium text-brand-error transition-colors hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/30 dark:bg-red-900/10 dark:text-brand-error"
				>
					<ShieldAlert className="size-4" aria-hidden="true" />
					Rechazar
				</button>
			</div>
		</div>
	);
}

function ApprovedReportBlock({
	orderId,
	status,
}: {
	orderId: string;
	status: WorkReport["status"];
}) {
	if (status !== "approved") {
		return null;
	}

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm text-brand-annotate dark:text-brand-annotate">
				El informe fue aprobado y ya puede descargarse.
			</p>
			<ReportDownloadButton orderId={orderId} />
		</div>
	);
}

function RejectedReportBlock({
	actionPending,
	readOnly,
	rejectionReason,
	status,
	onRegenerate,
}: {
	actionPending: boolean;
	readOnly: boolean;
	rejectionReason?: string;
	status: WorkReport["status"];
	onRegenerate: () => void;
}) {
	if (status !== "rejected" || readOnly) {
		return null;
	}

	return (
		<div className="space-y-3 rounded-lg border border-red-200 bg-danger-bg p-4 dark:border-red-900/30 dark:bg-red-900/10">
			<div className="flex items-start gap-2 text-sm text-brand-error dark:text-brand-error">
				<FileWarning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<p>
					{rejectionReason || "El informe fue rechazado y requiere ajustes antes de reenviarlo."}
				</p>
			</div>
			<button
				type="button"
				onClick={onRegenerate}
				disabled={actionPending}
				className="inline-flex items-center justify-center gap-2 rounded-lg bg-canvas px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-zinc-300 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:text-white dark:ring-zinc-700 dark:hover:bg-zinc-900"
			>
				<RefreshCw className="size-4" aria-hidden="true" />
				Regenerar
			</button>
		</div>
	);
}

function NoReportState() {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-dashed border-hairline bg-surface p-4 text-sm text-steel dark:border-zinc-700 dark:bg-canvas dark:text-stone">
			<FileWarning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
			<p>El informe aún no existe para esta orden.</p>
		</div>
	);
}

function InfoCard({
	label,
	value,
	tone,
}: {
	label: string;
	value: string;
	tone: "green" | "slate";
}) {
	return (
		<article
			className={`rounded-lg border p-3 ${tone === "green" ? "border-green-200 bg-success-bg dark:border-green-900/30 dark:bg-green-900/10" : "border-hairline bg-surface dark:border-zinc-800 dark:bg-canvas"}`}
		>
			<p
				className={`text-xs font-medium uppercase tracking-wide ${tone === "green" ? "text-brand-annotate dark:text-brand-annotate" : "text-steel dark:text-stone"}`}
			>
				{label}
			</p>
			<p
				className={`mt-1 text-sm font-medium ${tone === "green" ? "text-brand-annotate dark:text-brand-annotate" : "text-ink dark:text-white"}`}
			>
				{value}
			</p>
		</article>
	);
}

function ReportSkeleton() {
	const kpiKeys = Array.from({ length: 3 }, (_, i) => `report-kpi-sk-${i}`);

	return (
		<div className="animate-pulse space-y-4 rounded-xl border border-hairline bg-canvas p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
			<div className="h-6 w-48 rounded bg-zinc-200 dark:bg-surface" />
			<div className="h-4 w-80 rounded bg-zinc-200 dark:bg-surface" />
			<div className="grid gap-3 sm:grid-cols-3">
				{kpiKeys.map((k) => (
					<div key={k} className="h-16 rounded-lg bg-zinc-200 dark:bg-surface" />
				))}
			</div>
			<div className="h-24 rounded-lg bg-zinc-200 dark:bg-surface" />
		</div>
	);
}
