"use client";

import { Calendar, ClipboardList, DollarSign, FileText } from "lucide-react";
import { Skeleton } from "@/core/ui/Skeleton";
import { isOfflineLikeError } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	usePortalDashboard,
	usePortalInvoices,
	usePortalOrders,
	usePortalProposals,
} from "@/modules/portal/api/portal-api";

export default function PortalDashboardPage() {
	const { user } = useAuth();
	const { data: dashboard, isLoading, error } = usePortalDashboard();
	const { data: orders } = usePortalOrders();
	usePortalInvoices();
	usePortalProposals();

	if (isLoading) {
		return <PortalLoadingState />;
	}

	if (error) {
		if (isOfflineLikeError(error as Error)) {
			return <PortalOfflineState />;
		}
		return <PortalErrorState message={(error as Error).message} />;
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Panel de Cliente</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Bienvenido, {dashboard?.clientName ?? user?.name ?? "Cliente"}
				</p>
			</div>

			{/* KPI Cards */}
			<section aria-label="Resumen" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<PortalKpiCard
					icon={ClipboardList}
					label="Órdenes Activas"
					value={dashboard?.activeOrders ?? 0}
					color="blue"
				/>
				<PortalKpiCard
					icon={FileText}
					label="Aprobaciones Pendientes"
					value={dashboard?.pendingApprovals ?? 0}
					color="amber"
				/>
				<PortalKpiCard
					icon={DollarSign}
					label="Facturas Pendientes"
					value={dashboard?.unpaidInvoices ?? 0}
					color="red"
				/>
				<PortalKpiCard
					icon={Calendar}
					label="Total Órdenes"
					value={dashboard?.totalOrders ?? 0}
					color="green"
				/>
			</section>

			{/* Recent Orders */}
			{orders && orders.length > 0 && (
				<section aria-labelledby="recent-orders-title">
					<h2
						id="recent-orders-title"
						className="mb-3 text-lg font-semibold text-[var(--text-primary)]"
					>
						Órdenes Recientes
					</h2>
					<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
									<th className="px-4 py-3 font-medium">Código</th>
									<th className="px-4 py-3 font-medium">Estado</th>
									<th className="px-4 py-3 font-medium">Tipo</th>
									<th className="hidden px-4 py-3 font-medium md:table-cell">Creada</th>
								</tr>
							</thead>
							<tbody>
								{orders.slice(0, 5).map((order) => (
									<tr
										key={order._id}
										className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--surface-secondary)]/50"
									>
										<td className="px-4 py-3 font-medium text-[var(--color-brand-blue)]">
											{order.code}
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={order.status} />
										</td>
										<td className="px-4 py-3 text-[var(--text-secondary)] capitalize">
											{order.serviceType}
										</td>
										<td className="hidden px-4 py-3 text-[var(--text-tertiary)] md:table-cell">
											{order.createdAt.slice(0, 10)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{orders.length > 5 && (
							<div className="border-t border-[var(--border-default)] px-4 py-2 text-right">
								<a
									href="/portal/orders"
									className="text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
								>
									Ver todas
								</a>
							</div>
						)}
					</div>
				</section>
			)}

			{/* Empty state */}
			{orders?.length === 0 && (
				<section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-12 text-center">
					<ClipboardList
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">No hay órdenes activas.</p>
				</section>
			)}
		</div>
	);
}

function PortalKpiCard({
	icon: Icon,
	label,
	value,
	color,
}: {
	icon: React.ElementType;
	label: string;
	value: number;
	color: string;
}) {
	const colorMap: Record<string, string> = {
		blue: "text-[var(--color-brand-blue)] bg-[var(--color-info-bg)]",
		amber: "text-[var(--color-warning)] bg-[var(--color-warning-bg)]",
		red: "text-[var(--color-danger)] bg-[var(--color-danger-bg)]",
		green: "text-[var(--color-success)] bg-[var(--color-success-bg)]",
	};
	return (
		<div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<div
				className={`flex size-10 items-center justify-center rounded-[var(--radius-lg)] ${colorMap[color] ?? colorMap.blue}`}
			>
				<Icon className="size-5" aria-hidden="true" />
			</div>
			<div>
				<p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
				<p className="text-xs text-[var(--text-secondary)]">{label}</p>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		in_progress: "bg-blue-100 text-blue-800",
		completed: "bg-green-100 text-green-800",
		closed: "bg-gray-100 text-gray-800",
		pending: "bg-yellow-100 text-yellow-800",
		approved: "bg-green-100 text-green-800",
		rejected: "bg-red-100 text-red-800",
	};
	return (
		<span
			className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
		>
			{status.replace(/_/g, " ")}
		</span>
	);
}

function PortalLoadingState() {
	return (
		<div className="space-y-4 p-6">
			<Skeleton variant="text" className="h-8 w-48" />
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} variant="kpi-card" />
				))}
			</div>
			<Skeleton variant="chart" height={160} />
		</div>
	);
}

function PortalErrorState({ message }: { message: string }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)]">
			No se pudo cargar el portal. {message}
		</div>
	);
}

function PortalOfflineState() {
	return (
		<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-12 text-center">
			<p className="text-[var(--text-tertiary)]">
				Sin conexión. Conéctate para ver tu información.
			</p>
		</div>
	);
}
