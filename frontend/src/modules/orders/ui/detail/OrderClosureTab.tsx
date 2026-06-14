"use client";

import type { ClosureReport } from "@cermont/shared-types";
import { AlertCircle, CheckCircle, Clock, FileCheck, FileText, Receipt } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format-date";
import { useOrderCostSummary } from "@/modules/costs";
import { useOrder, useOrderClosureReport, useUpdateOrderStatus } from "@/modules/orders/queries";
import { ReportPanel, useOrderReport } from "@/modules/reports";
import { OrderAdministrativeWorkflowLane } from "./OrderAdministrativeWorkflowLane";

interface OrderClosureTabProps {
	orderId: string;
}

type ClosureOrder = NonNullable<ReturnType<typeof useOrder>["data"]>;
type ClosureStatusUpdate = "ready_for_invoicing" | "closed";
type ClosureGateState = {
	administrativeClosureReady: boolean;
	hasCosts: boolean;
	isClosed: boolean;
	isCompleted: boolean;
	isReadyForInvoicing: boolean;
	reportApproved: boolean;
};

const CLOSURE_STATUS_LABELS: Record<string, string> = {
	open: "Abierta",
	assigned: "Asignada",
	in_progress: "En progreso",
	on_hold: "En pausa",
	completed: "Completada",
	ready_for_invoicing: "Lista para facturación",
	closed: "Cerrada",
	cancelled: "Cancelada",
};

export function OrderClosureTab({ orderId }: OrderClosureTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);
	const { data: costSummary, isLoading: costSummaryLoading } = useOrderCostSummary(orderId);
	const { data: report, isLoading: reportLoading } = useOrderReport(orderId);
	const { data: closureReport, isLoading: closureReportLoading } = useOrderClosureReport(orderId);
	const updateOrderStatus = useUpdateOrderStatus(orderId);

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (error || !order) {
		return <ErrorState />;
	}

	const isCompleted = order.status === "completed";
	const isClosed = order.status === "closed";
	const isReadyForInvoicing = order.status === "ready_for_invoicing";
	const hasCosts = costSummary?.hasCosts ?? false;
	const reportApproved = report?.status === "approved";
	const canMarkReadyForInvoicing = isCompleted && !order.invoiceReady && hasCosts && reportApproved;
	const administrativeClosureReady = closureReport?.canCloseAdministratively ?? false;
	const canClose = isReadyForInvoicing && !isClosed && administrativeClosureReady;
	const gateState: ClosureGateState = {
		administrativeClosureReady,
		hasCosts,
		isClosed,
		isCompleted,
		isReadyForInvoicing,
		reportApproved,
	};

	const handleStatusUpdate = async (status: ClosureStatusUpdate) => {
		try {
			await updateOrderStatus.mutateAsync({ status });
			toast.success(
				status === "closed" ? "Orden cerrada correctamente" : "Orden lista para facturación",
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "No se pudo actualizar el estado de la orden",
			);
		}
	};

	return (
		<section
			aria-label="Cierre administrativo"
			className="space-y-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
		>
			<ReportPanel orderId={orderId} />

			{/* Closure Status Indicator */}
			<ClosureStatusIndicator
				isClosed={isClosed}
				canClose={canClose}
				isReadyForInvoicing={isReadyForInvoicing}
			/>

			<AdministrativeClosureRequirements isLoading={closureReportLoading} report={closureReport} />
			<OrderAdministrativeWorkflowLane closureReport={closureReport} orderId={orderId} />

			<ClosureDetails
				costSummaryLoading={costSummaryLoading}
				hasCosts={hasCosts}
				order={order}
				reportApproved={reportApproved}
				reportLoading={reportLoading}
			/>
			<ClosureObservations observations={order.observations} />
			<ReadyForInvoicingAction
				isPending={updateOrderStatus.isPending}
				visible={canMarkReadyForInvoicing}
				onReady={() => handleStatusUpdate("ready_for_invoicing")}
			/>
			<CloseOrderAction
				isPending={updateOrderStatus.isPending}
				visible={canClose}
				onClose={() => handleStatusUpdate("closed")}
			/>
			<ClosureGateAlerts closureReport={closureReport} state={gateState} />
			<ClosedNotice visible={isClosed} />
		</section>
	);
}

function ClosureDetails({
	costSummaryLoading,
	hasCosts,
	order,
	reportApproved,
	reportLoading,
}: {
	costSummaryLoading: boolean;
	hasCosts: boolean;
	order: ClosureOrder;
	reportApproved: boolean;
	reportLoading: boolean;
}) {
	return (
		<div>
			<h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-white">
				Detalles de cierre
			</h2>
			<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
				<InfoBlock
					label="Estado"
					value={CLOSURE_STATUS_LABELS[order.status] ?? order.status}
					icon={<Clock className="size-4" aria-hidden="true" />}
				/>
				<InfoBlock
					label="Completada el"
					value={formatDate(order.completedAt, "dd MMM yyyy HH:mm")}
					icon={<CheckCircle className="size-4" aria-hidden="true" />}
				/>
				<InfoBlock
					label="Factura lista"
					value={order.invoiceReady ? "Sí" : "No"}
					icon={<Receipt className="size-4" aria-hidden="true" />}
					highlight={order.invoiceReady}
				/>
				<InfoBlock
					label="Costos registrados"
					value={costSummaryLoading ? "Cargando…" : hasCosts ? "Sí" : "No"}
					icon={<FileText className="size-4" aria-hidden="true" />}
					highlight={hasCosts}
				/>
				<InfoBlock
					label="Informe aprobado"
					value={reportLoading ? "Cargando…" : reportApproved ? "Sí" : "No"}
					icon={<FileCheck className="size-4" aria-hidden="true" />}
					highlight={reportApproved}
				/>
				<InfoBlock
					label="Reporte generado"
					value={order.reportGenerated ? "Sí" : "No"}
					icon={<FileText className="size-4" aria-hidden="true" />}
					highlight={order.reportGenerated}
				/>
			</dl>
		</div>
	);
}

function ClosureObservations({ observations }: { observations?: string }) {
	if (!observations) {
		return null;
	}

	return (
		<div>
			<h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-white">Observaciones</h2>
			<dl>
				<dt className="sr-only">Observaciones de cierre</dt>
				<dd className="rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
					{observations}
				</dd>
			</dl>
		</div>
	);
}

function ReadyForInvoicingAction({
	isPending,
	visible,
	onReady,
}: {
	isPending: boolean;
	visible: boolean;
	onReady: () => void;
}) {
	if (!visible) {
		return null;
	}

	return (
		<ClosureActionPanel
			buttonLabel={isPending ? "Actualizando…" : "Marcar como listo para facturar"}
			description="El informe está aprobado y los costos ya fueron registrados."
			disabled={isPending}
			title="Orden lista para facturar"
			onClick={onReady}
		/>
	);
}

function CloseOrderAction({
	isPending,
	visible,
	onClose,
}: {
	isPending: boolean;
	visible: boolean;
	onClose: () => void;
}) {
	if (!visible) {
		return null;
	}

	return (
		<ClosureActionPanel
			buttonLabel={isPending ? "Cerrando…" : "Cerrar orden"}
			description="Ahora puedes cerrar la orden después de la etapa de facturación."
			disabled={isPending}
			title="Orden lista para cierre administrativo"
			onClick={onClose}
		/>
	);
}

function ClosureActionPanel({
	buttonLabel,
	description,
	disabled,
	title,
	onClick,
}: {
	buttonLabel: string;
	description: string;
	disabled: boolean;
	title: string;
	onClick: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-lg border border-[var(--color-cermont-blue-bg)] bg-[var(--color-cermont-blue-bg)]/50 p-4 dark:border-[var(--color-cermont-blue)]/30 dark:bg-[var(--color-cermont-blue)]/10 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<FileCheck
					className="mt-0.5 size-5 shrink-0 text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand-blue-deep)] dark:text-[var(--color-cermont-blue-light)]">
						{title}
					</p>
					<p className="mt-1 text-xs text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]">
						{description}
					</p>
				</div>
			</div>
			<button
				type="button"
				onClick={onClick}
				disabled={disabled}
				className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--color-cermont-blue)] dark:hover:bg-[var(--color-brand-hover)]"
			>
				{buttonLabel}
			</button>
		</div>
	);
}

function AdministrativeClosureRequirements({
	isLoading,
	report,
}: {
	isLoading: boolean;
	report?: ClosureReport;
}) {
	if (isLoading) {
		return (
			<div className="animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
				<div className="mt-3 h-16 rounded bg-zinc-200 dark:bg-zinc-800" />
			</div>
		);
	}

	if (!report?.requirements?.length) {
		return null;
	}

	return (
		<section
			aria-label="Requisitos de cierre administrativo pasos 8 a 14"
			className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
		>
			<div className="flex items-center justify-between gap-3">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
					Cierre administrativo (acta → SES → factura → pago)
				</h3>
				<span className="text-xs font-medium text-zinc-500">
					{report.completionPercentage}% completado
				</span>
			</div>
			<ul className="mt-3 space-y-2">
				{report.requirements.map((requirement) => (
					<li
						key={requirement.kind}
						className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
					>
						<span className="font-medium text-zinc-800 dark:text-zinc-200">
							{requirement.label}
						</span>
						<span
							className={
								requirement.status === "completed"
									? "text-green-600"
									: requirement.status === "pending"
										? "text-amber-600"
										: "text-red-600"
							}
						>
							{requirement.status === "completed"
								? "Completo"
								: requirement.status === "pending"
									? "Pendiente"
									: "Faltante"}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}

function ClosureGateAlerts({
	closureReport,
	state,
}: {
	closureReport?: ClosureReport;
	state: ClosureGateState;
}) {
	const {
		administrativeClosureReady,
		hasCosts,
		isClosed,
		isCompleted,
		isReadyForInvoicing,
		reportApproved,
	} = state;

	if (!isCompleted || isClosed) {
		return null;
	}

	if (!hasCosts) {
		return (
			<ClosureGateAlert
				description="No se puede cerrar la orden hasta registrar al menos un costo."
				title="Faltan costos registrados"
			/>
		);
	}

	if (!reportApproved) {
		return (
			<ClosureGateAlert
				description="El informe debe estar aprobado antes de proceder a facturación."
				title="Falta aprobar el informe"
			/>
		);
	}

	if (isReadyForInvoicing && !administrativeClosureReady) {
		const missing = closureReport?.missingClosureKinds?.join(", ") || "soportes administrativos";
		return (
			<ClosureGateAlert
				description={`Complete acta, firma del cliente, SES, factura y pago antes del cierre definitivo. Faltan: ${missing}.`}
				title="Cierre administrativo incompleto"
			/>
		);
	}

	return null;
}

function ClosureGateAlert({ description, title }: { description: string; title: string }) {
	return (
		<div
			data-testid="invoicing-gate-error"
			role="alert"
			className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10"
		>
			<AlertCircle
				className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-medium text-amber-900 dark:text-amber-300">{title}</p>
				<p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{description}</p>
			</div>
		</div>
	);
}

function ClosedNotice({ visible }: { visible: boolean }) {
	if (!visible) {
		return null;
	}

	return (
		<div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
			<CheckCircle
				className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400"
				aria-hidden="true"
			/>
			<p className="text-sm text-zinc-600 dark:text-zinc-400">
				Esta orden ha sido cerrada administrativamente.
			</p>
		</div>
	);
}

function ClosureStatusIndicator({
	isClosed,
	canClose,
	isReadyForInvoicing,
}: {
	isClosed: boolean;
	canClose: boolean;
	isReadyForInvoicing: boolean;
}) {
	if (isClosed) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
				<CheckCircle
					className="size-5 shrink-0 text-green-600 dark:text-green-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-green-900 dark:text-green-300">Orden cerrada</p>
					<p className="text-xs text-green-700 dark:text-green-400">
						El cierre administrativo ha sido completado.
					</p>
				</div>
			</div>
		);
	}

	if (canClose) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-[var(--color-cermont-blue-bg)] bg-[var(--color-cermont-blue-bg)]/50 px-4 py-3 dark:border-[var(--color-cermont-blue)]/30 dark:bg-[var(--color-cermont-blue)]/10">
				<FileCheck
					className="size-5 shrink-0 text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-[var(--color-brand-blue-deep)] dark:text-[var(--color-cermont-blue-light)]">
						Completada, pendiente de cierre
					</p>
					<p className="text-xs text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]">
						La orden está completada pero aún no ha sido cerrada administrativamente.
					</p>
				</div>
			</div>
		);
	}

	if (isReadyForInvoicing) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
				<CheckCircle
					className="size-5 shrink-0 text-green-600 dark:text-green-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-green-900 dark:text-green-300">
						Lista para facturación
					</p>
					<p className="text-xs text-green-700 dark:text-green-400">
						El informe fue aprobado y la orden ya puede facturarse.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
			<AlertCircle
				className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
					Orden no completada
				</p>
				<p className="text-xs text-amber-700 dark:text-amber-400">
					La orden debe estar completada antes de proceder al cierre administrativo.
				</p>
			</div>
		</div>
	);
}

function InfoBlock({
	label,
	value,
	icon,
	highlight,
}: {
	label: string;
	value: string;
	icon: ReactNode;
	highlight?: boolean;
}) {
	return (
		<div
			className={`rounded-lg border px-4 py-3 ${highlight ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"}`}
		>
			<dt className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
				{icon}
				{label}
			</dt>
			<dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{value}</dd>
		</div>
	);
}

function LoadingSkeleton() {
	const skeletonKeys = Array.from({ length: 4 }, (_, i) => `closure-sk-${i}`);

	return (
		<div className="animate-pulse space-y-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
			<div className="h-14 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
			<div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{skeletonKeys.map((k) => (
					<div key={k} className="h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
				))}
			</div>
			<div className="h-20 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
		</div>
	);
}

function ErrorState() {
	return (
		<div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
			<p className="text-sm text-red-600 dark:text-red-400">
				No se pudo cargar la información de cierre de la orden.
			</p>
		</div>
	);
}
