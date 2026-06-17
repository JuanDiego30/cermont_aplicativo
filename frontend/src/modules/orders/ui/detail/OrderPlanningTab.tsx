"use client";

import { AlertCircle, Calendar, Clock, Package } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format-date";
import { useOrder } from "@/modules/orders/queries";

interface OrderPlanningTabProps {
	orderId: string;
}

const COP_CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatCOP(value: number): string {
	return COP_CURRENCY_FORMATTER.format(value);
}

export function OrderPlanningTab({ orderId }: OrderPlanningTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-[var(--surface-secondary)] bg-800" />;
	}

	if (error) {
		return (
			<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-danger-bg px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
				<AlertCircle
					className="mt-0.5 size-5 shrink-0 text-brand-error dark:text-brand-error"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-medium text-brand-error dark:text-brand-error">
						Error al cargar la planificación.
					</p>
					<p className="mt-1 text-xs text-brand-error dark:text-brand-error">{error.message}</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return <p className="text-sm text-[var(--text-muted)]">Sin planificación.</p>;
	}

	return (
		<section
			aria-label="Planificación"
			className="space-y-6 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 sm:p-6 border-800 bg-950"
		>
			<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<InfoBlock
					icon={<Calendar className="size-4" aria-hidden="true" />}
					label="Fecha programada"
					value={order.startedAt ? formatDate(order.startedAt) : "Sin programar"}
				/>
				<InfoBlock
					icon={<Clock className="size-4" aria-hidden="true" />}
					label="Horas estimadas"
					value=","
				/>
				<InfoBlock
					icon={<Package className="size-4" aria-hidden="true" />}
					label="Activo"
					value={order.assetName}
				/>
			</dl>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InfoBlock label="Ubicación" value={order.location} />
				{order.assignedToName && (
					<InfoBlock label="Técnico asignado" value={order.assignedToName} />
				)}
			</div>

			{order.proposalId && (
				<div className="rounded-lg bg-[var(--surface-card)] px-4 py-3 bg-900">
					<p className="text-xs text-[var(--text-tertiary)] text-400">Origen</p>
					<Link
						href={`/proposals/${order.proposalId}`}
						className="text-sm font-medium text-[var(--color-brand-blue-light)] hover:underline dark:text-[var(--color-cermont-blue-light)]"
					>
						Ver propuesta vinculada
					</Link>
				</div>
			)}

			<div>
				<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-tertiary)] text-400">
					<Package className="size-4" aria-hidden="true" />
					Materiales planificados
				</h3>

				{order.materials && order.materials.length > 0 ? (
					<div className="overflow-x-auto rounded-lg border border-[var(--border-medium)] border-700">
						<table className="w-full text-sm">
							<thead className="bg-surface bg-900">
								<tr>
									<th
										scope="col"
										className="px-4 py-2 text-left font-medium text-[var(--text-tertiary)] text-400"
									>
										Nombre
									</th>
									<th
										scope="col"
										className="px-4 py-2 text-right font-medium text-[var(--text-tertiary)] text-400"
									>
										Cantidad
									</th>
									<th
										scope="col"
										className="px-4 py-2 text-left font-medium text-[var(--text-tertiary)] text-400"
									>
										Unidad
									</th>
									<th
										scope="col"
										className="px-4 py-2 text-right font-medium text-[var(--text-tertiary)] text-400"
									>
										Costo unit.
									</th>
									<th
										scope="col"
										className="px-4 py-2 text-center font-medium text-[var(--text-tertiary)] text-400"
									>
										Entregado
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
								{order.materials.map((material) => (
									<tr key={material.name} className="bg-canvas bg-950">
										<td className="px-4 py-2 font-medium text-[var(--text-primary)] dark:text-white">
											{material.name}
										</td>
										<td className="px-4 py-2 text-right tabular-nums text-[var(--text-secondary)] text-300">
											{material.quantity}
										</td>
										<td className="px-4 py-2 text-[var(--text-secondary)] text-300">
											{material.unit}
										</td>
										<td className="px-4 py-2 text-right tabular-nums text-[var(--text-secondary)] text-300">
											{material.unitCost != null ? formatCOP(material.unitCost) : ","}
										</td>
										<td className="px-4 py-2 text-center">
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
													material.delivered
														? "bg-success-bg text-brand-annotate dark:bg-green-900/30 dark:text-brand-annotate"
														: "bg-zinc-100 text-[var(--text-tertiary)] bg-800 text-400"
												}`}
											>
												{material.delivered ? "Sí" : "No"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="flex min-h-20 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border-medium)] border-700">
						<p className="text-sm text-[var(--text-muted)]">Sin materiales definidos</p>
					</div>
				)}
			</div>
		</section>
	);
}

function InfoBlock({
	label,
	value,
	icon,
}: {
	label: string;
	value: string;
	icon?: React.ReactNode;
}) {
	return (
		<div className="rounded-lg bg-[var(--surface-card)] px-4 py-3 bg-900">
			<dt className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] text-400">
				{icon}
				{label}
			</dt>
			<dd className="mt-0.5 text-sm font-medium text-[var(--text-primary)] dark:text-white">
				{value}
			</dd>
		</div>
	);
}
