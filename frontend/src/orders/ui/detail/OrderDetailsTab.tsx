"use client";

import { ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { formatDateTime } from "@/_shared/lib/utils/format-date";
import { BadgePill } from "@/core/ui/BadgePill";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { useOrder } from "@/orders/queries";

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

function yesNo(value: boolean | undefined): string {
	return value ? "Sí" : "No";
}

function LoadingSkeleton() {
	const fieldKeys = Array.from({ length: 6 }, (_, i) => `detail-field-sk-${i}`);
	const rowKeys = Array.from({ length: 3 }, (_, i) => `detail-row-sk-${i}`);

	return (
		<div className="animate-pulse space-y-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{fieldKeys.map((k) => (
					<div key={k} className="h-10 rounded bg-slate-200 dark:bg-slate-800" />
				))}
			</div>
			<div className="h-20 w-full rounded bg-slate-200 dark:bg-slate-800" />
			<div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
			<div className="space-y-2">
				{rowKeys.map((k) => (
					<div key={k} className="h-8 rounded bg-slate-200 dark:bg-slate-800" />
				))}
			</div>
		</div>
	);
}

function ErrorState() {
	return (
		<div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
			<p className="text-sm text-red-600 dark:text-red-400">
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
		<div className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			{/* Basic Information */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Información básica
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Código</dt>
						<dd className="mt-1 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
							{order.code}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Tipo</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{TYPE_LABELS[order.type] ?? order.type}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado</dt>
						<dd className="mt-1">
							<StatusBadge status={order.status} />
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Prioridad</dt>
						<dd className="mt-1">
							<PriorityBadge priority={order.priority} />
						</dd>
					</div>
				</dl>
			</div>

			{/* Asset Information */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Activo / Equipo
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
							Nombre del activo
						</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">{order.assetName}</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Ubicación</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">{order.location}</dd>
					</div>

					{order.gpsLocation && (
						<div className="sm:col-span-2">
							<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
								Coordenadas GPS
							</dt>
							<dd className="mt-1 font-mono text-sm text-slate-900 dark:text-white">
								{order.gpsLocation.lat.toFixed(6)}, {order.gpsLocation.lng.toFixed(6)}
								{order.gpsLocation.accuracy && (
									<span className="ml-2 text-slate-500 dark:text-slate-400">
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
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Personal asignado
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Técnico</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{order.assignedToName ?? "Sin asignar"}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Supervisor</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{order.supervisedBy ?? "—"}
						</dd>
					</div>
				</dl>
			</div>

			{/* Frozen Baseline Section */}
			{order.costBaseline && (
				<div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/20 dark:bg-blue-900/5 sm:p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<h2 className="text-base font-semibold text-slate-900 dark:text-white">
								Línea Base Congelada
							</h2>
						</div>
						<BadgePill className="bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800 text-[10px] font-bold uppercase tracking-wider">
							Inmutable — congelada de {order.costBaseline.proposalCode}
						</BadgePill>
					</div>

					<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Propuesta</dt>
							<dd className="mt-1 font-mono text-sm text-slate-900 dark:text-white">
								{order.costBaseline.proposalCode}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">PO Cliente</dt>
							<dd className="mt-1 text-sm text-slate-900 dark:text-white">
								{order.costBaseline.poNumber || "—"}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Subtotal</dt>
							<dd className="mt-1 text-sm text-slate-900 dark:text-white">
								{formatCurrency(order.costBaseline.subtotal)}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
								Total (IVA inc.)
							</dt>
							<dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
								{formatCurrency(order.costBaseline.total)}
							</dd>
						</div>
						<div className="sm:col-span-2">
							<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
								Fecha de Congelamiento
							</dt>
							<dd className="mt-1 text-sm text-slate-900 dark:text-white">
								{formatDateTime(String(order.costBaseline.frozenAt), "dd MMMM yyyy HH:mm")}
							</dd>
						</div>
					</dl>

					<div className="mt-4">
						<h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
							Items Presupuestados
						</h3>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead>
									<tr className="border-b border-slate-200 dark:border-slate-800">
										<th className="pb-1 font-medium text-slate-500">Descripción</th>
										<th className="pb-1 font-medium text-slate-500">Cantidad</th>
										<th className="pb-1 font-medium text-slate-500 text-right">Total</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
									{order.costBaseline.items.map((item) => (
										<tr key={`${item.description}-${item.unit}-${item.quantity}-${item.total}`}>
											<td className="py-1.5 text-slate-700 dark:text-slate-300">
												{item.description}
											</td>
											<td className="py-1.5 text-slate-700 dark:text-slate-300">
												{item.quantity} {item.unit}
											</td>
											<td className="py-1.5 text-right font-medium text-slate-900 dark:text-white">
												{formatCurrency(item.total)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Dates */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Fechas</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Creada</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{formatDateTime(order.createdAt, "dd MMMM yyyy HH:mm")}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Iniciada</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{formatDateTime(order.startedAt, "dd MMMM yyyy HH:mm")}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Completada</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{formatDateTime(order.completedAt, "dd MMMM yyyy HH:mm")}
						</dd>
					</div>
				</dl>
			</div>

			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Programación y SLA
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
							Inicio programado
						</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{formatDateTime(
								order.scheduleSla.scheduledStartAt ?? order.planning.scheduledStartAt,
								"dd MMMM yyyy HH:mm",
							)}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
							Fecha límite SLA
						</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{formatDateTime(order.scheduleSla.dueAt ?? order.slaDueDate, "dd MMMM yyyy HH:mm")}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
							Nivel de respuesta
						</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{order.scheduleSla.responseLevel ?? "—"}
						</dd>
					</div>
				</dl>
			</div>

			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Seguridad HES
				</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Riesgo</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">{order.hes.riskLevel}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Requiere PTW</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{yesNo(order.hes.requiresPTW)}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Requiere AST</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{yesNo(order.hes.requiresAST)}
						</dd>
					</div>
				</dl>
			</div>

			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Comercial</h2>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Cliente</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{order.commercial.clientName ?? "—"}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">PO</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{order.commercial.poNumber ?? order.poNumber ?? "—"}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Facturable</dt>
						<dd className="mt-1 text-sm text-slate-900 dark:text-white">
							{yesNo(order.commercial.isBillable)}
						</dd>
					</div>
				</dl>
			</div>

			{/* Description */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Descripción</h2>
				<dl>
					<dt className="sr-only">Descripción de la orden</dt>
					<dd className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
						{order.description}
					</dd>
				</dl>
			</div>

			{/* Materials */}
			<div>
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Materiales</h2>
				{order.materials.length === 0 ? (
					<p className="text-sm text-slate-500 dark:text-slate-400">
						No hay materiales registrados.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-slate-200 dark:border-slate-800">
									<th className="pb-2 font-medium text-slate-500 dark:text-slate-400">Material</th>
									<th className="pb-2 font-medium text-slate-500 dark:text-slate-400">Cantidad</th>
									<th className="pb-2 font-medium text-slate-500 dark:text-slate-400">Unidad</th>
									<th className="pb-2 font-medium text-slate-500 dark:text-slate-400">
										Costo unit.
									</th>
									<th className="pb-2 font-medium text-slate-500 dark:text-slate-400">Entregado</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
								{order.materials.map((material) => (
									<tr key={material.name}>
										<td className="py-2 text-slate-900 dark:text-white">{material.name}</td>
										<td className="py-2 text-slate-900 dark:text-white">{material.quantity}</td>
										<td className="py-2 text-slate-700 dark:text-slate-300">{material.unit}</td>
										<td className="py-2 text-slate-700 dark:text-slate-300">
											{material.unitCost !== undefined ? formatCurrency(material.unitCost) : "—"}
										</td>
										<td className="py-2">
											<span
												className={
													material.delivered
														? "text-green-600 dark:text-green-400"
														: "text-slate-400 dark:text-slate-500"
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
