"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOrderCostSummary } from "@/costs/queries";
import { formatCurrency } from "@/costs/utils";
import { useOrder, useUpdateOrderBilling } from "@/orders/queries";

interface InvoicePageClientProps {
	orderId: string;
}

export function InvoicePageClient({ orderId }: InvoicePageClientProps) {
	const { data: order, isLoading: orderLoading, error: orderError } = useOrder(orderId);
	const updateBilling = useUpdateOrderBilling(orderId);
	const [sesNumber, setSesNumber] = useState("");
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [sesStatus, setSesStatus] = useState<"pending" | "registered" | "approved">("pending");
	const [invoiceStatus, setInvoiceStatus] = useState<"pending" | "sent" | "approved" | "paid">(
		"pending",
	);
	const [billingNotes, setBillingNotes] = useState("");
	const {
		data: costSummary,
		isLoading: costsLoading,
		error: costsError,
	} = useOrderCostSummary(orderId);
	const currentBilling = order?.billing;

	useEffect(() => {
		if (!currentBilling) {
			return;
		}

		setSesNumber(currentBilling.sesNumber ?? "");
		setInvoiceNumber(currentBilling.invoiceNumber ?? "");
		setSesStatus(currentBilling.sesStatus);
		setInvoiceStatus(currentBilling.invoiceStatus);
		setBillingNotes(currentBilling.billingNotes ?? "");
	}, [currentBilling]);

	if (orderLoading || costsLoading) {
		return (
			<main
				role="status"
				aria-live="polite"
				aria-label="Cargando factura"
				className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
			>
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
				<p className="text-slate-500 font-medium">Generando vista de factura…</p>
			</main>
		);
	}

	if (orderError || !order) {
		return (
			<aside
				role="alert"
				aria-live="assertive"
				className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center"
			>
				<AlertCircle className="h-12 w-12 text-red-500" />
				<h2 className="text-xl font-bold text-white">Error al cargar factura</h2>
				<p className="text-slate-400">
					{orderError?.message ?? "No se encontró la orden de trabajo"}
				</p>
			</aside>
		);
	}

	if (costsError) {
		return (
			<aside
				role="alert"
				aria-live="assertive"
				className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center"
			>
				<AlertCircle className="h-12 w-12 text-red-500" />
				<h2 className="text-xl font-bold text-white">Error de facturación</h2>
				<p className="text-slate-400">
					{costsError?.message ?? "Error al recuperar el desglose de costos"}
				</p>
			</aside>
		);
	}

	const subtotal = costSummary?.totalActual ?? 0;
	const tax = costSummary?.totalTax ?? 0;
	const total = subtotal + tax;
	const byCategory = costSummary?.byCategory ?? [];

	// Dynamic tax rate label from summary if available, fallback to 19%
	const avgTaxRate =
		costSummary?.totalEstimated && costSummary.totalEstimated > 0 ? (tax / subtotal) * 100 : 19;
	const taxLabel = `IVA (${avgTaxRate.toFixed(0)}%)`;

	const handleSaveBilling = async () => {
		try {
			await updateBilling.mutateAsync({
				sesNumber: sesNumber.trim() || undefined,
				sesStatus,
				invoiceNumber: invoiceNumber.trim() || undefined,
				invoiceStatus,
				billingNotes: billingNotes.trim() || undefined,
			});
			toast.success("Seguimiento de facturación actualizado");
		} catch (billingError) {
			toast.error(
				billingError instanceof Error
					? billingError.message
					: "No se pudo actualizar la facturación",
			);
		}
	};

	return (
		<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
			<header className="mb-8 flex flex-col items-start justify-between gap-6 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight text-white">
						Factura de Operación
					</h1>
					<p className="mt-2 text-slate-400 font-mono text-sm uppercase">{order.code}</p>
				</div>
				<div className="flex flex-col items-end gap-2">
					<span
						className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
							order.invoiceReady
								? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
								: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
						}`}
					>
						{order.invoiceReady ? "Factura lista para cobro" : "Liquidación pendiente"}
					</span>
					<p className="text-[10px] text-slate-500 font-medium italic">Referencia: {order._id}</p>
				</div>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Order Context */}
				<section aria-labelledby="order-info-heading" className="lg:col-span-1 space-y-6">
					<div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm">
						<h2
							id="order-info-heading"
							className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500"
						>
							Información del Servicio
						</h2>
						<dl className="space-y-4">
							<DataField label="Activo" value={order.assetName} subValue={order.assetId} />
							<DataField label="Tipo" value={order.type} isCapitalized />
							<DataField label="Prioridad" value={order.priority} isCapitalized />
							<DataField label="Ubicación" value={order.location} />
							{order.description && (
								<div className="pt-2">
									<dt className="text-[10px] font-bold uppercase text-slate-600">
										Alcance del servicio
									</dt>
									<dd className="mt-1 text-xs leading-relaxed text-slate-400">
										{order.description}
									</dd>
								</div>
							)}
						</dl>
					</div>
				</section>

				{/* Financial Breakdown */}
				<section aria-labelledby="cost-breakdown-heading" className="lg:col-span-2 space-y-6">
					<div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm">
						<h2
							id="cost-breakdown-heading"
							className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500"
						>
							Liquidación de Conceptos
						</h2>

						<div className="overflow-hidden rounded-xl border border-slate-800">
							<table className="w-full text-left text-sm">
								<thead className="bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
									<tr>
										<th scope="col" className="px-4 py-3">
											Concepto / Categoría
										</th>
										<th scope="col" className="px-4 py-3 text-right">
											Monto Neto
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-800">
									{byCategory.length === 0 ? (
										<tr>
											<td colSpan={2} className="px-4 py-8 text-center text-slate-600 italic">
												No se han registrado costos operativos para esta orden.
											</td>
										</tr>
									) : (
										byCategory.map((cat) => (
											<tr key={cat.category} className="hover:bg-slate-800/20 transition-colors">
												<td className="px-4 py-3 text-slate-200 font-medium capitalize">
													{getCategoryLabel(cat.category)}
												</td>
												<td className="px-4 py-3 text-right tabular-nums text-slate-300">
													{formatCurrency(cat.actual)}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>

						<div className="mt-8 space-y-4 rounded-xl bg-slate-800/30 p-6">
							<dl className="space-y-3">
								<div className="flex justify-between text-sm">
									<dt className="text-slate-400">Subtotal Operativo</dt>
									<dd className="font-semibold tabular-nums text-slate-200">
										{formatCurrency(subtotal)}
									</dd>
								</div>
								<div className="flex justify-between text-sm">
									<dt className="text-slate-400">{taxLabel}</dt>
									<dd className="font-semibold tabular-nums text-slate-200">
										{formatCurrency(tax)}
									</dd>
								</div>
								<div className="flex justify-between border-t border-slate-700 pt-3">
									<dt className="text-lg font-bold text-white">Total Liquidación</dt>
									<dd className="text-lg font-black tabular-nums text-primary-400">
										{formatCurrency(total)}
									</dd>
								</div>
							</dl>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm">
						<h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">
							Seguimiento Administrativo
						</h2>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field
								label="SES actual"
								value={currentBilling?.sesNumber || "Sin registrar"}
								subValue={currentBilling?.sesStatus ?? "pending"}
							/>
							<Field
								label="Factura actual"
								value={currentBilling?.invoiceNumber || "Sin registrar"}
								subValue={currentBilling?.invoiceStatus ?? "pending"}
							/>
						</div>

						<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label htmlFor="billing-ses-number" className="space-y-2 text-sm text-slate-300">
								<span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
									Número SES
								</span>
								<input
									id="billing-ses-number"
									value={sesNumber}
									onChange={(event) => setSesNumber(event.target.value)}
									className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
								/>
							</label>

							<label htmlFor="billing-ses-status" className="space-y-2 text-sm text-slate-300">
								<span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
									Estado SES
								</span>
								<select
									id="billing-ses-status"
									value={sesStatus}
									onChange={(event) => setSesStatus(event.target.value as typeof sesStatus)}
									className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
								>
									<option value="pending">Pendiente</option>
									<option value="registered">Registrada</option>
									<option value="approved">Aprobada</option>
								</select>
							</label>

							<label htmlFor="billing-invoice-number" className="space-y-2 text-sm text-slate-300">
								<span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
									Número factura
								</span>
								<input
									id="billing-invoice-number"
									value={invoiceNumber}
									onChange={(event) => setInvoiceNumber(event.target.value)}
									className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
								/>
							</label>

							<label htmlFor="billing-invoice-status" className="space-y-2 text-sm text-slate-300">
								<span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
									Estado factura
								</span>
								<select
									id="billing-invoice-status"
									value={invoiceStatus}
									onChange={(event) => setInvoiceStatus(event.target.value as typeof invoiceStatus)}
									className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
								>
									<option value="pending">Pendiente</option>
									<option value="sent">Enviada</option>
									<option value="approved">Aprobada</option>
									<option value="paid">Pagada</option>
								</select>
							</label>
						</div>

						<label htmlFor="billing-notes" className="mt-4 block space-y-2 text-sm text-slate-300">
							<span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
								Notas
							</span>
							<textarea
								id="billing-notes"
								value={billingNotes}
								onChange={(event) => setBillingNotes(event.target.value)}
								rows={3}
								className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
							/>
						</label>

						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={handleSaveBilling}
								disabled={updateBilling.isPending}
								className="min-h-11 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
							>
								{updateBilling.isPending ? "Guardando..." : "Guardar seguimiento"}
							</button>
						</div>
					</div>
				</section>
			</div>

			<footer className="mt-12 text-center">
				<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
					Documento generado automáticamente por sistema CERMONT el{" "}
					{new Date().toLocaleDateString("es-CO", { dateStyle: "long" })}
				</p>
			</footer>
		</main>
	);
}

function Field({ label, value, subValue }: { label: string; value: string; subValue: string }) {
	return (
		<div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4">
			<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
			<p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
			<p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{subValue}</p>
		</div>
	);
}

function DataField({
	label,
	value,
	subValue,
	isCapitalized,
}: {
	label: string;
	value: string;
	subValue?: string;
	isCapitalized?: boolean;
}) {
	return (
		<div>
			<dt className="text-[10px] font-bold uppercase text-slate-600 tracking-tighter">{label}</dt>
			<dd
				className={`mt-0.5 text-sm font-semibold text-slate-200 ${isCapitalized ? "capitalize" : ""}`}
			>
				{value}
				{subValue && (
					<span className="ml-2 text-[10px] font-normal text-slate-500 font-mono">#{subValue}</span>
				)}
			</dd>
		</div>
	);
}

function getCategoryLabel(category: string): string {
	const labels: Record<string, string> = {
		labor: "Mano de Obra",
		materials: "Materiales e Insumos",
		equipment: "Equipos y Herramental",
		transport: "Transporte y Logística",
		subcontract: "Subcontratos",
		overhead: "Gastos Generales",
		other: "Gastos no Categorizados",
	};
	return labels[category] || category;
}
