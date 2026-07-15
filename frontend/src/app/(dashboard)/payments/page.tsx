"use client";

import type { PaymentAgingEntry, PaymentDashboard } from "@cermont/shared-types";
import { AlertTriangle, Banknote, Clock, DollarSign, Percent, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePaymentAgingReport, usePaymentDashboard, usePaymentsList } from "@/modules/billing/queries";
import { localeDate } from "@/lib/utils/format-date";
import {
	WorkflowRecordsPage,
	WorkflowRecordsPageLoadingState,
} from "@/modules/billing/ui/WorkflowRecordsPage";
import { paymentRows } from "@/modules/billing/ui/workflow-record-rows";

const BUCKET_LABELS: Record<string, string> = {
	current: "Al día",
	"0-30": "1-30 días",
	"31-60": "31-60 días",
	"61-90": "61-90 días",
	"90+": "Más de 90 días",
};

const BUCKET_COLORS: Record<string, string> = {
	current: "text-green-600 bg-green-50 border-green-200",
	"0-30": "text-yellow-600 bg-yellow-50 border-yellow-200",
	"31-60": "text-orange-600 bg-orange-50 border-orange-200",
	"61-90": "text-red-600 bg-red-50 border-red-200",
	"90+": "text-red-800 bg-red-100 border-red-300",
};

const BUCKET_BG: Record<string, string> = {
	current: "bg-green-500",
	"0-30": "bg-yellow-500",
	"31-60": "bg-orange-500",
	"61-90": "bg-red-500",
	"90+": "bg-red-700",
};

function formatCOP(amount: number): string {
	return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

function formatPercent(value: number): string {
	return `${value.toFixed(1)}%`;
}

function KPICard({ icon: Icon, label, value, subtitle, color }: {
	icon: React.ElementType;
	label: string;
	value: string;
	subtitle?: string;
	color?: string;
}) {
	return (
		<div className="rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
					<p className={`mt-2 text-2xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
					{subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
				</div>
				<div className="rounded-lg bg-blue-50 p-2.5">
					<Icon className="size-5 text-blue-600" aria-hidden="true" />
				</div>
			</div>
		</div>
	);
}

function AgingBucketsCard({ buckets, total }: { buckets: PaymentDashboard["agingBuckets"]; total: number }) {
	const maxTotal = Math.max(...buckets.map((b) => b.total), 1);

	return (
		<div className="rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
			<h3 className="mb-4 text-sm font-semibold text-gray-900">Distribución por antigüedad</h3>
			<div className="space-y-3">
				{buckets.map((bucket) => {
					const pct = total > 0 ? (bucket.total / total) * 100 : 0;
					const barWidth = total > 0 ? (bucket.total / maxTotal) * 100 : 0;
					return (
						<div key={bucket.bucket}>
							<div className="mb-1 flex items-center justify-between text-xs">
								<span className="font-medium text-gray-700">{BUCKET_LABELS[bucket.bucket] ?? bucket.bucket}</span>
								<span className="text-gray-500">
									{formatCOP(bucket.total)} ({pct.toFixed(1)}%)
								</span>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
								<div
									className={`h-full rounded-full transition-all ${BUCKET_BG[bucket.bucket] ?? "bg-gray-400"}`}
									style={{ width: `${barWidth}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function AgingTable({ entries }: { entries: PaymentAgingEntry[] }) {
	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-gray-400">
				<Clock className="mb-2 size-8" aria-hidden="true" />
				<p className="text-sm">No hay facturas pendientes de pago</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-left text-sm">
				<thead className="bg-gray-50 text-xs uppercase text-gray-500">
					<tr>
						<th className="px-4 py-3 font-semibold">Factura</th>
						<th className="px-4 py-3 font-semibold">Emisión</th>
						<th className="px-4 py-3 font-semibold">Vencimiento</th>
						<th className="px-4 py-3 font-semibold">Total</th>
						<th className="px-4 py-3 font-semibold">Pendiente</th>
						<th className="px-4 py-3 font-semibold">Días vencido</th>
						<th className="px-4 py-3 font-semibold">Bucket</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{entries.map((entry) => (
						<tr key={entry.invoiceId} className="hover:bg-gray-50">
							<td className="px-4 py-3 font-medium text-gray-900">{entry.invoiceNumber ?? entry.invoiceId.slice(-8)}</td>
							<td className="px-4 py-3 text-gray-500">{localeDate(entry.issueDate)}</td>
							<td className="px-4 py-3 text-gray-500">{localeDate(entry.dueDate)}</td>
							<td className="px-4 py-3 text-gray-900">{formatCOP(entry.total)}</td>
							<td className="px-4 py-3 font-medium text-gray-900">{formatCOP(entry.pendingAmount)}</td>
							<td className="px-4 py-3">
								<span className={entry.daysOverdue > 0 ? "font-semibold text-red-600" : "text-gray-400"}>
									{entry.daysOverdue > 0 ? `${entry.daysOverdue} días` : "Al día"}
								</span>
							</td>
							<td className="px-4 py-3">
								<span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${BUCKET_COLORS[entry.agingBucket] ?? "text-gray-500"}`}>
									{BUCKET_LABELS[entry.agingBucket] ?? entry.agingBucket}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function DashboardSection() {
	const dashboardQuery = usePaymentDashboard();
	const agingQuery = usePaymentAgingReport();

	if (dashboardQuery.isLoading || agingQuery.isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-4">
					{[0, 1, 2, 3].map((i) => <Skeleton key={`kpi-skeleton-${i}`} className="h-28 rounded-xl" />)}
				</div>
				<Skeleton className="h-64 rounded-xl" />
			</div>
		);
	}

	if (dashboardQuery.isError || agingQuery.isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
				<AlertTriangle className="mx-auto mb-2 size-8 text-red-400" aria-hidden="true" />
				<p className="text-sm text-red-600">No se pudo cargar el dashboard de pagos</p>
			</div>
		);
	}

	const dashboard = dashboardQuery.data;
	if (!dashboard) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KPICard
					icon={DollarSign}
					label="Total facturado"
					value={formatCOP(dashboard.totalInvoiced)}
					color="text-gray-900"
				/>
				<KPICard
					icon={Banknote}
					label="Total cobrado"
					value={formatCOP(dashboard.totalCollected)}
					subtitle={dashboard.totalInvoiced > 0 ? `${formatPercent(dashboard.collectionRate)} recaudo` : undefined}
					color="text-green-600"
				/>
				<KPICard
					icon={TrendingUp}
					label="Pendiente"
					value={formatCOP(dashboard.totalPending)}
					color="text-yellow-600"
				/>
				<KPICard
					icon={AlertTriangle}
					label="Vencido"
					value={formatCOP(dashboard.totalOverdue)}
					subtitle={dashboard.averagePaymentDays > 0 ? `Promedio: ${dashboard.averagePaymentDays} días` : undefined}
					color="text-red-600"
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<AgingBucketsCard buckets={dashboard.agingBuckets} total={dashboard.totalInvoiced} />
				<div className="rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-blue-50 p-2.5">
							<Percent className="size-5 text-blue-600" aria-hidden="true" />
						</div>
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tasa de recaudo</p>
							<p className="text-3xl font-bold text-blue-600">{formatPercent(dashboard.collectionRate)}</p>
						</div>
					</div>
					<div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
						<div
							className="h-full rounded-full bg-blue-500 transition-all"
							style={{ width: `${Math.min(dashboard.collectionRate, 100)}%` }}
						/>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-[var(--border-subtle)] bg-white shadow-sm">
				<div className="border-b border-[var(--border-subtle)] px-5 py-4">
					<h2 className="text-sm font-semibold text-gray-900">Cuentas por cobrar — Detalle</h2>
				</div>
				<AgingTable entries={agingQuery.data ?? []} />
			</div>
		</div>
	);
}

function PaymentsPageContent() {
	const searchParams = useSearchParams();
	const workOrderId = searchParams.get("workOrderId")?.trim() || undefined;
	const query = usePaymentsList(workOrderId ? { workOrderId, limit: 50 } : undefined);

	return (
		<div className="space-y-6">
			<DashboardSection />
			<WorkflowRecordsPage
				activeContext={
					workOrderId
						? {
								label: "Work order",
								value: workOrderId,
								clearHref: "/payments",
							}
						: void 0
				}
				eyebrow="Dashboard / Pagos"
				title="Pagos registrados"
				description="Conciliación administrativa de recaudo contra facturas, SES y órdenes de trabajo."
				emptyIcon="payments"
				emptyTitle={workOrderId ? "No payments for this order" : "Sin pagos registrados"}
				emptyDescription={
					workOrderId
						? "The filtered work order does not have reconciled payments yet. Keep bank support and collection follow-up here."
						: "Registra pagos desde facturas aprobadas y adjunta soporte bancario para conciliación."
				}
				query={query}
				rows={paymentRows}
				primaryLinks={[
					{ href: "/billing/invoices", label: "Facturas" },
					{ href: "/costs", label: "Costos" },
					{ href: "/documents", label: "Soportes" },
				]}
			/>
		</div>
	);
}

export default function PaymentsPage() {
	return (
		<main>
			<Suspense fallback={<WorkflowRecordsPageLoadingState />}>
				<PaymentsPageContent />
			</Suspense>
		</main>
	);
}
