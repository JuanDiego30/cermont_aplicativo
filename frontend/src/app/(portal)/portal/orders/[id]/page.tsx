"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePortalOrderDetail } from "@/modules/portal/api/portal-api";

export default function PortalOrderDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: order, isLoading, error } = usePortalOrderDetail(id);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton variant="text" className="h-8 w-64" />
				<Skeleton variant="chart" height={320} />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)]">
				No se pudo cargar la orden.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Link
				href="/portal/orders"
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver a órdenes
			</Link>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">{order.code}</h1>
					<p className="text-sm text-[var(--text-secondary)] capitalize">{order.serviceType}</p>
				</div>
				<span
					className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
						order.status === "completed" || order.status === "closed"
							? "bg-green-100 text-green-800"
							: "bg-blue-100 text-blue-800"
					}`}
				>
					{order.status.replace(/_/g, " ")}
				</span>
			</div>

			{order.description && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
					<h2 className="mb-1 text-sm font-medium text-[var(--text-secondary)]">Descripción</h2>
					<p className="text-sm text-[var(--text-primary)]">{order.description}</p>
				</div>
			)}

			{/* Linked Documents */}
			<div className="grid gap-4 sm:grid-cols-3">
				<PortalDocCard
					title={`Propuestas (${order.proposals.length})`}
					icon={FileText}
					items={order.proposals.map((p) => ({ label: p.code || p.status, sub: p.status }))}
				/>
				<PortalDocCard
					title={`Facturas (${order.invoices.length})`}
					icon={FileText}
					items={order.invoices.map((inv) => ({ label: inv.code, sub: inv.status }))}
				/>
				<PortalDocCard
					title={`Informes (${order.technicalReports.length})`}
					icon={FileText}
					items={order.technicalReports.map((r) => ({ label: r.code, sub: r.status }))}
				/>
			</div>
		</div>
	);
}

function PortalDocCard({
	title,
	icon: Icon,
	items,
}: {
	title: string;
	icon: React.ElementType;
	items: Array<{ label: string; sub: string }>;
}) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
				<Icon className="size-4" aria-hidden="true" /> {title}
			</div>
			{items.length === 0 ? (
				<p className="text-xs text-[var(--text-tertiary)]">Ninguno</p>
			) : (
				<ul className="space-y-1.5">
					{items.slice(0, 3).map((item) => (
						<li key={`${item.label}-${item.sub}`} className="text-xs">
							<span className="font-medium text-[var(--text-primary)]">{item.label}</span>
							<span className="ml-2 text-[var(--text-tertiary)]">({item.sub})</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
