"use client";

import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeButton } from "@/components/common/QRCodeButton";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { buildOrderRoute } from "@/lib/routes";
import { useOrder } from "@/modules/orders/queries";

interface OrderDetailHeaderProps {
	orderId: string;
}

const TYPE_LABELS: Record<string, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
};

function formatDate(dateStr: string | undefined): string {
	if (!dateStr) {
		return "—";
	}
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) {
		return "—";
	}
	return date.toLocaleDateString("es-CO", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		timeZone: "America/Bogota",
	});
}

export function OrderDetailHeader({ orderId }: OrderDetailHeaderProps) {
	const { back } = useRouter();
	const { data: order, isLoading } = useOrder(orderId);

	if (isLoading) {
		return (
			<header className="animate-pulse space-y-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 border-800 bg-950">
				<div className="h-6 w-32 rounded bg-[var(--surface-secondary)] bg-800" />
				<div className="h-8 w-48 rounded bg-[var(--surface-secondary)] bg-800" />
				<div className="h-4 w-64 rounded bg-[var(--surface-secondary)] bg-800" />
			</header>
		);
	}

	if (!order) {
		return (
			<header className="rounded-xl border border-red-200 bg-danger-bg p-6 dark:border-red-900/30 dark:bg-red-900/10">
				<p className="text-sm text-brand-error dark:text-brand-error">
					No se pudo cargar la información de la orden.
				</p>
			</header>
		);
	}

	return (
		<header className="rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm border-800 bg-950 sm:p-6">
			{/* Back button + code */}
			<div className="mb-4 flex items-center gap-3">
				<button
					type="button"
					onClick={() => back()}
					className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-zinc-100 text-400 dark:hover:bg-zinc-800"
					aria-label="Volver al listado de órdenes"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					<span className="hidden sm:inline">Volver</span>
				</button>
				<span className="font-mono text-sm font-semibold text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]">
					{order.code}
				</span>
				<StatusBadge status={order.status} />
				<PriorityBadge priority={order.priority} />
				<div className="ml-auto">
					<QRCodeButton data={buildOrderRoute(orderId)} label={`Orden: ${order.code}`} />
				</div>
			</div>

			{/* Title */}
			<h1
				id="order-detail-title"
				className="text-xl font-semibold text-[var(--text-primary)] dark:text-white sm:text-2xl"
			>
				{order.assetName}
			</h1>

			{/* Meta info */}
			<dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] text-400">
					<MapPin className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
					<span>{order.location}</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] text-400">
					<Calendar className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
					<span>Creada: {formatDate(order.createdAt)}</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] text-400">
					<User className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
					<span>{order.assignedToName ?? "Sin asignar"}</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] text-400">
					<Clock className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
					<span>{TYPE_LABELS[order.type] ?? order.type}</span>
				</div>
			</dl>

			{/* Description */}
			{order.description && (
				<p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] text-300">
					{order.description}
				</p>
			)}
		</header>
	);
}
