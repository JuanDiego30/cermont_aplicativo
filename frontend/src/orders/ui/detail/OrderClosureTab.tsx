"use client";

import { AlertCircle, CheckCircle, Clock, FileCheck, FileText, Receipt } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { useOrderCostSummary } from "@/costs";
import { useOrder, useUpdateOrderStatus } from "@/orders/queries";
import { ReportPanel, useOrderReport } from "@/reports";
import { OrderDeliveryRecord } from "./OrderDeliveryRecord";

interface OrderClosureTabProps {
	orderId: string;
}

const CLOSURE_STATUS_LABELS: Record<string, string> = {
	open: "Open",
	assigned: "Assigned",
	in_progress: "In progress",
	on_hold: "On hold",
	completed: "Completed",
	ready_for_invoicing: "Ready for invoicing",
	closed: "Closed",
	cancelled: "Cancelled",
};

export function OrderClosureTab({ orderId }: OrderClosureTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);
	const { data: costSummary, isLoading: costSummaryLoading } = useOrderCostSummary(orderId);
	const { data: report, isLoading: reportLoading } = useOrderReport(orderId);
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
	const reportApproved = order.hasApprovedReport ?? report?.status === "approved";
	const reportPdfGenerated = order.reportPdfGenerated ?? order.reportGenerated;
	const canMarkReadyForInvoicing = isCompleted && !order.invoiceReady && hasCosts && reportApproved;
	const canClose = isReadyForInvoicing && !isClosed;

	const handleStatusUpdate = async (status: "ready_for_invoicing" | "closed") => {
		try {
			await updateOrderStatus.mutateAsync({ status });
			toast.success(
				status === "closed" ? "Order closed successfully" : "Order ready for invoicing",
			);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "The order status could not be updated");
		}
	};

	return (
		<section
			aria-label="Administrative closure"
			className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6"
		>
			<ReportPanel orderId={orderId} />
			<OrderDeliveryRecord
				orderId={orderId}
				disabled={!isCompleted && !isReadyForInvoicing && !isClosed}
			/>

			{/* Closure Status Indicator */}
			<ClosureStatusIndicator
				isClosed={isClosed}
				canClose={canClose}
				isReadyForInvoicing={isReadyForInvoicing}
			/>

			{/* Closure Details */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Closure details
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<InfoBlock
						label="Status"
						value={CLOSURE_STATUS_LABELS[order.status] ?? order.status}
						icon={<Clock className="h-4 w-4" aria-hidden="true" />}
					/>

					<InfoBlock
						label="Completed at"
						value={formatDate(order.completedAt, "dd MMM yyyy HH:mm")}
						icon={<CheckCircle className="h-4 w-4" aria-hidden="true" />}
					/>

					<InfoBlock
						label="Invoice ready"
						value={order.invoiceReady ? "Yes" : "No"}
						icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
						highlight={order.invoiceReady}
					/>

					<InfoBlock
						label="Costs recorded"
						value={costSummaryLoading ? "Loading..." : hasCosts ? "Yes" : "No"}
						icon={<FileText className="h-4 w-4" aria-hidden="true" />}
						highlight={hasCosts}
					/>

					<InfoBlock
						label="Report approved"
						value={reportLoading ? "Loading..." : reportApproved ? "Yes" : "No"}
						icon={<FileCheck className="h-4 w-4" aria-hidden="true" />}
						highlight={reportApproved}
					/>

					<InfoBlock
						label="Report PDF"
						value={reportPdfGenerated ? "Yes" : "No"}
						icon={<FileText className="h-4 w-4" aria-hidden="true" />}
						highlight={reportPdfGenerated}
					/>

					<InfoBlock
						label="SES status"
						value={order.billing.sesStatus}
						icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
						highlight={order.billing.sesStatus === "approved"}
					/>

					<InfoBlock
						label="Invoice status"
						value={order.billing.invoiceStatus}
						icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
						highlight={order.billing.invoiceStatus === "paid"}
					/>
				</dl>
			</div>

			{/* Observations */}
			{order.observations && (
				<div>
					<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
						Observations
					</h2>
					<dl>
						<dt className="sr-only">Closure observations</dt>
						<dd className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-900 dark:text-slate-300">
							{order.observations}
						</dd>
					</dl>
				</div>
			)}

			{/* Ready for invoicing */}
			{canMarkReadyForInvoicing && (
				<div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<FileCheck
							className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-medium text-blue-900 dark:text-blue-300">
								Order ready for billing
							</p>
							<p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
								The report is approved and costs have been recorded.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => handleStatusUpdate("ready_for_invoicing")}
						disabled={updateOrderStatus.isPending}
						className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
					>
						{updateOrderStatus.isPending ? "Updating..." : "Mark as ready for invoicing"}
					</button>
				</div>
			)}

			{canClose && (
				<div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<FileCheck
							className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-medium text-blue-900 dark:text-blue-300">
								Order ready for administrative closure
							</p>
							<p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
								You can close the order after the invoicing stage.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => handleStatusUpdate("closed")}
						disabled={updateOrderStatus.isPending}
						className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
					>
						{updateOrderStatus.isPending ? "Closing..." : "Close order"}
					</button>
				</div>
			)}

			{isCompleted && !hasCosts && !isClosed && (
				<div
					data-testid="invoicing-gate-error"
					role="alert"
					className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10"
				>
					<AlertCircle
						className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
						aria-hidden="true"
					/>
					<div>
						<p className="text-sm font-medium text-amber-900 dark:text-amber-300">
							Recorded costs are missing
						</p>
						<p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
							The order cannot be closed until at least one cost is recorded.
						</p>
					</div>
				</div>
			)}

			{isCompleted && hasCosts && !reportApproved && !isClosed && (
				<div
					data-testid="invoicing-gate-error"
					role="alert"
					className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10"
				>
					<AlertCircle
						className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
						aria-hidden="true"
					/>
					<div>
						<p className="text-sm font-medium text-amber-900 dark:text-amber-300">
							Report approval is missing
						</p>
						<p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
							The report must be approved before moving to invoicing.
						</p>
					</div>
				</div>
			)}

			{isClosed && (
				<div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
					<CheckCircle
						className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400"
						aria-hidden="true"
					/>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						This order has been closed administratively.
					</p>
				</div>
			)}
		</section>
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
					className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-green-900 dark:text-green-300">Order closed</p>
					<p className="text-xs text-green-700 dark:text-green-400">
						Administrative closure has been completed.
					</p>
				</div>
			</div>
		);
	}

	if (canClose) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-900/10">
				<FileCheck
					className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
						Completed, pending closure
					</p>
					<p className="text-xs text-blue-700 dark:text-blue-400">
						The order is completed but has not been administratively closed yet.
					</p>
				</div>
			</div>
		);
	}

	if (isReadyForInvoicing) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
				<CheckCircle
					className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-green-900 dark:text-green-300">
						Ready for invoicing
					</p>
					<p className="text-xs text-green-700 dark:text-green-400">
						The report was approved and the order can now be invoiced.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
			<AlertCircle
				className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
					Order not completed
				</p>
				<p className="text-xs text-amber-700 dark:text-amber-400">
					The order must be completed before administrative closure.
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
			className={`rounded-lg border px-4 py-3 ${highlight ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"}`}
		>
			<dt className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
				{icon}
				{label}
			</dt>
			<dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</dd>
		</div>
	);
}

function LoadingSkeleton() {
	const skeletonKeys = Array.from({ length: 4 }, (_, i) => `closure-sk-${i}`);

	return (
		<div className="animate-pulse space-y-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<div className="h-14 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
			<div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{skeletonKeys.map((k) => (
					<div key={k} className="h-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
				))}
			</div>
			<div className="h-20 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
		</div>
	);
}

function ErrorState() {
	return (
		<div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
			<p className="text-sm text-red-600 dark:text-red-400">
				The order closure information could not be loaded.
			</p>
		</div>
	);
}
