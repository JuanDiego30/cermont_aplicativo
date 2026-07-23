"use client";

import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { formatLocaleDateTime } from "@/lib/utils/format-date";

import { useOrder } from "@/modules/orders/queries";

interface OrderDetailsTabProps {
	orderId: string;
}

const TYPE_LABELS: Record<string, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
};

const COP_CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatCOP(value: number): string {
	return COP_CURRENCY_FORMATTER.format(value);
}

function formatDate(dateStr: string | undefined): string {
	if (!dateStr) {
		return ",";
	}
	const formatted = formatLocaleDateTime(dateStr, {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	return formatted === "Fecha inválida" ? "," : formatted;
}

function LoadingSkeleton() {
	const fieldKeys = Array.from({ length: 6 }, (_, i) => `detail-field-sk-${i}`);
	const rowKeys = Array.from({ length: 3 }, (_, i) => `detail-row-sk-${i}`);

	return (
		<div className="animate-pulse space-y-6 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 border-800 bg-950 sm:p-6">
			<div className="h-5 w-40 rounded bg-[var(--surface-secondary)] bg-800" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{fieldKeys.map((k) => (
					<div key={k} className="h-10 rounded bg-[var(--surface-secondary)] bg-800" />
				))}
			</div>
			<div className="h-20 w-full rounded bg-[var(--surface-secondary)] bg-800" />
			<div className="h-5 w-32 rounded bg-[var(--surface-secondary)] bg-800" />
			<div className="space-y-2">
				{rowKeys.map((k) => (
					<div key={k} className="h-8 rounded bg-[var(--surface-secondary)] bg-800" />
				))}
			</div>
		</div>
	);
}

function ErrorState() {
	return (
		<div className="rounded-xl border border-red-200 bg-danger-bg p-6 dark:border-red-900/30 dark:bg-red-900/10">
			<p className="text-sm text-brand-error dark:text-brand-error">
				No se pudo cargar la información de la orden.
			</p>
		</div>
	);
}

export function OrderDetailsTab({ orderId }: OrderDetailsTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (error || !order) {
		return <ErrorState />;
	}

	return (
		<div className="space-y-6 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 border-800 bg-950 sm:p-6">
			{/* Basic Information */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] dark:text-white">
					Información básica
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Código</dt>
						<dd className="mt-1 font-mono text-sm font-semibold text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]">
							{order.code}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Tipo</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{TYPE_LABELS[order.type] ?? order.type}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Estado</dt>
						<dd className="mt-1">
							<StatusBadge status={order.status} />
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Prioridad</dt>
						<dd className="mt-1">
							<PriorityBadge priority={order.priority} />
						</dd>
					</div>
				</dl>
			</div>

			{/* Asset Information */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] dark:text-white">
					Activo / Equipo
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">
							Nombre del activo
						</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{order.assetName}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Ubicación</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{order.location}
						</dd>
					</div>

					{order.gpsLocation && (
						<div className="sm:col-span-2">
							<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">
								Coordenadas GPS
							</dt>
							<dd className="mt-1 font-mono text-sm text-[var(--text-primary)] dark:text-white">
								{order.gpsLocation.lat.toFixed(6)}, {order.gpsLocation.lng.toFixed(6)}
								{order.gpsLocation.accuracy && (
									<span className="ml-2 text-[var(--text-tertiary)] text-400">
										(±{order.gpsLocation.accuracy}m)
									</span>
								)}
							</dd>
						</div>
					)}
				</dl>
			</div>

			{/* Assigned Personnel */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] dark:text-white">
					Personal asignado
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Técnico</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{order.assignedToName ?? "Sin asignar"}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Supervisor</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{order.supervisedBy ?? ","}
						</dd>
					</div>
				</dl>
			</div>

			{/* Dates */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] dark:text-white">
					Fechas
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Creada</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{formatDate(order.createdAt)}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Iniciada</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{formatDate(order.startedAt)}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-[var(--text-tertiary)] text-400">Completada</dt>
						<dd className="mt-1 text-sm text-[var(--text-primary)] dark:text-white">
							{formatDate(order.completedAt)}
						</dd>
					</div>
				</dl>
			</div>

			{/* Description */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] dark:text-white">
					Descripción
				</h2>
				<dl>
					<dt className="sr-only">Descripción de la orden</dt>
					<dd className="text-sm leading-relaxed text-[var(--text-secondary)] text-300">
						{order.description}
					</dd>
				</dl>
			</div>

			{/* Materials */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] dark:text-white">
					Materiales
				</h2>
				{order.materials.length === 0 ? (
					<p className="text-sm text-[var(--text-tertiary)] text-400">
						No hay materiales registrados.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-[var(--border-medium)] border-800">
									<th className="pb-2 font-medium text-[var(--text-tertiary)] text-400">
										Material
									</th>
									<th className="pb-2 font-medium text-[var(--text-tertiary)] text-400">
										Cantidad
									</th>
									<th className="pb-2 font-medium text-[var(--text-tertiary)] text-400">Unidad</th>
									<th className="pb-2 font-medium text-[var(--text-tertiary)] text-400">
										Costo unit.
									</th>
									<th className="pb-2 font-medium text-[var(--text-tertiary)] text-400">
										Entregado
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{order.materials.map((material) => (
									<tr key={material.name}>
										<td className="py-2 text-[var(--text-primary)] dark:text-white">
											{material.name}
										</td>
										<td className="py-2 text-[var(--text-primary)] dark:text-white">
											{material.quantity}
										</td>
										<td className="py-2 text-[var(--text-secondary)] text-300">{material.unit}</td>
										<td className="py-2 text-[var(--text-secondary)] text-300">
											{material.unitCost !== undefined ? formatCOP(material.unitCost) : ","}
										</td>
										<td className="py-2">
											<span
												className={
													material.delivered
														? "text-brand-annotate dark:text-brand-annotate"
														: "text-stone text-500"
												}
											>
												{material.delivered ? "Sí" : "No"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
