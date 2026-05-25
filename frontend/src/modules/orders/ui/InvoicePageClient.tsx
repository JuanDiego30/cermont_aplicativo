"use client";

import { useCostSummary } from "@/modules/costs/queries";
import { useOrder } from "@/modules/orders/queries";

const COP_CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	minimumFractionDigits: 0,
});

const GENERATED_DATE_FORMATTER = new Intl.DateTimeFormat("es-CO");
const GENERATED_DATE_LABEL = GENERATED_DATE_FORMATTER.format(new Date());

interface InvoicePageClientProps {
	orderId: string;
}

function formatCOP(value: number): string {
	return COP_CURRENCY_FORMATTER.format(value);
}

export function InvoicePageClient({ orderId }: InvoicePageClientProps) {
	const { data: order, isLoading: orderLoading, error: orderError } = useOrder(orderId);
	const { data: costs, isLoading: costsLoading, error: costsError } = useCostSummary(orderId);

	if (orderLoading || costsLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<p className="text-zinc-500">Cargando factura…</p>
			</div>
		);
	}

	if (orderError || !order) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<p className="text-red-600">
					{orderError instanceof Error ? orderError.message : "No se encontró la orden"}
				</p>
			</div>
		);
	}

	if (costsError) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<p className="text-red-600">
					{costsError instanceof Error ? costsError.message : "Error al cargar los costos"}
				</p>
			</div>
		);
	}

	const items = costs ?? [];
	const subtotal = items.reduce((acc, item) => acc + (item.amount ?? 0), 0);
	const tax = subtotal * 0.19;
	const total = subtotal + tax;

	return (
		<div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
			<header className="mb-6 border-b border-zinc-200 pb-4">
				<div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
					<h1 className="text-2xl font-semibold text-zinc-900">Factura</h1>
					<span
						className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
							order.invoiceReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
						}`}
					>
						{order.invoiceReady ? "Factura lista" : "Pendiente"}
					</span>
				</div>
			</header>

			<section aria-label="Información de la orden" className="mb-6">
				<dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-zinc-500">Código</dt>
						<dd className="text-base text-zinc-900">{order.code}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-zinc-500">Tipo</dt>
						<dd className="text-base capitalize text-zinc-900">{order.type}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-zinc-500">Estado</dt>
						<dd className="text-base capitalize text-zinc-900">{order.status}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-zinc-500">Prioridad</dt>
						<dd className="text-base capitalize text-zinc-900">{order.priority}</dd>
					</div>
					<div className="sm:col-span-2">
						<dt className="text-sm font-medium text-zinc-500">Activo</dt>
						<dd className="text-base text-zinc-900">{order.assetName}</dd>
					</div>
					<div className="sm:col-span-2">
						<dt className="text-sm font-medium text-zinc-500">Ubicación</dt>
						<dd className="text-base text-zinc-900">{order.location}</dd>
					</div>
					{order.description && (
						<div className="sm:col-span-2">
							<dt className="text-sm font-medium text-zinc-500">Descripción</dt>
							<dd className="text-base text-zinc-900">{order.description}</dd>
						</div>
					)}
				</dl>
			</section>

			<section aria-label="Detalle de costos" className="mb-6">
				<h2 className="mb-3 text-lg font-semibold text-zinc-900">Desglose de costos</h2>
				<div className="overflow-x-auto rounded-lg border border-zinc-200">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-zinc-200 bg-zinc-50">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium text-zinc-700">
									Concepto
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium text-zinc-700">
									Monto
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100">
							{items.length === 0 ? (
								<tr>
									<td colSpan={2} className="px-4 py-6 text-center text-zinc-500">
										No hay costos registrados
									</td>
								</tr>
							) : (
								items.map((item) => (
									<tr key={item.type} className="bg-white">
										<td className="px-4 py-3 text-zinc-900 capitalize">
											{item.type ?? "Sin tipo"}
										</td>
										<td className="px-4 py-3 text-right tabular-nums text-zinc-900">
											{formatCOP(item.amount ?? 0)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>

			<section
				aria-label="Totales"
				className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:p-6"
			>
				<dl className="space-y-2">
					<div className="flex justify-between">
						<dt className="text-sm text-zinc-600">Subtotal</dt>
						<dd className="text-sm font-medium tabular-nums text-zinc-900">
							{formatCOP(subtotal)}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-sm text-zinc-600">IVA (19%)</dt>
						<dd className="text-sm font-medium tabular-nums text-zinc-900">{formatCOP(tax)}</dd>
					</div>
					<div className="flex justify-between border-t border-zinc-200 pt-2">
						<dt className="text-base font-semibold text-zinc-900">Total</dt>
						<dd className="text-base font-semibold tabular-nums text-zinc-900">
							{formatCOP(total)}
						</dd>
					</div>
				</dl>
			</section>

			<footer className="mt-6 text-center text-xs text-zinc-400">
				Generado el {GENERATED_DATE_LABEL} , Orden {order.code}
			</footer>
		</div>
	);
}
