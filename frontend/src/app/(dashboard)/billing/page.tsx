"use client";

import type { BillingPipelineItem } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import {
	useBatchMarkReadyForInvoicing,
	useBatchRegisterSes,
	useBillingPipeline,
} from "@/orders/queries";

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export default function BillingPipelinePage() {
	const { data, isLoading, isError, error, refetch } = useBillingPipeline();
	const batchMarkReady = useBatchMarkReadyForInvoicing();
	const batchRegisterSes = useBatchRegisterSes();
	const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
	const [sesByOrder, setSesByOrder] = useState<Record<string, string>>({});
	const pipeline = data?.pipeline ?? [];
	const summary = data?.summary;
	const financialSummary = data?.financialSummary;
	const selectableIds = useMemo(
		() => pipeline.filter((item) => item.status === "completed").map((item) => item._id),
		[pipeline],
	);
	const allSelectableSelected =
		selectableIds.length > 0 && selectableIds.every((id) => selectedOrderIds.includes(id));

	useEffect(() => {
		setSelectedOrderIds((current) => current.filter((id) => selectableIds.includes(id)));
	}, [selectableIds]);

	const toggleOrderSelection = (orderId: string) => {
		setSelectedOrderIds((current) =>
			current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
		);
	};

	const toggleAllSelection = () => {
		setSelectedOrderIds((_current) => (allSelectableSelected ? [] : selectableIds));
	};

	const handleBatchMarkReady = async () => {
		try {
			await batchMarkReady.mutateAsync({ orderIds: selectedOrderIds });
			toast.success("Órdenes marcadas como listas para facturar");
			setSelectedOrderIds([]);
		} catch (actionError) {
			toast.error(
				actionError instanceof Error
					? actionError.message
					: "No se pudo marcar la selección como lista para facturar",
			);
		}
	};

	const handleRegisterSes = async (orderId: string) => {
		const sesNumber = sesByOrder[orderId]?.trim();
		if (!sesNumber) {
			toast.error("Ingrese un número SES");
			return;
		}
		try {
			await batchRegisterSes.mutateAsync({ orders: [{ orderId, sesNumber }] });
			toast.success("SES registrado");
			setSesByOrder((current) => ({ ...current, [orderId]: "" }));
		} catch (actionError) {
			toast.error(
				actionError instanceof Error ? actionError.message : "No se pudo registrar el SES",
			);
		}
	};

	const handleBatchSes = async () => {
		const orders = selectedOrderIds
			.map((orderId) => ({ orderId, sesNumber: sesByOrder[orderId]?.trim() ?? "" }))
			.filter((item) => item.sesNumber);
		if (orders.length === 0) {
			toast.error("Ingrese al menos un número SES para la selección");
			return;
		}
		try {
			await batchRegisterSes.mutateAsync({ orders });
			toast.success("SES registrados por lote");
			setSelectedOrderIds([]);
			setSesByOrder((current) => {
				const next = { ...current };
				for (const order of orders) {
					next[order.orderId] = "";
				}
				return next;
			});
		} catch (actionError) {
			toast.error(
				actionError instanceof Error ? actionError.message : "No se pudo registrar el lote",
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<AlertCircle className="h-12 w-12 text-[var(--color-danger)]" />
				<h2 className="text-xl font-bold">Error al cargar datos</h2>
				<p className="text-[var(--text-secondary)]">{(error as Error).message}</p>
				<Button onClick={() => refetch()}>Reintentar</Button>
			</div>
		);
	}

	return (
		<main className="flex h-full flex-col p-4 sm:p-6 lg:p-8">
			<header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
						Pipeline de Facturación
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Seguimiento de órdenes completadas pendientes de cobro y aging
					</p>
				</div>
			</header>

			{/* Summary Cards */}
			<section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<SummaryCard
					label="Total COP en Pipeline"
					value={COP_FORMATTER.format(financialSummary?.totalCopInPipeline ?? 0)}
					icon={<Receipt className="h-5 w-5 text-green-400" />}
					description="Valor comercial pendiente de cierre"
					tone="green"
				/>
				<SummaryCard
					label="Listas para Facturar"
					value={summary?.totalReadyForInvoicing || 0}
					icon={<Receipt className="h-5 w-5 text-green-400" />}
					description="Órdenes con informe aprobado"
				/>
				<SummaryCard
					label="Facturación Vencida"
					value={pipeline.filter((item) => item.daysWaiting > 7).length}
					icon={<Clock className="h-5 w-5 text-amber-400" />}
					description="Más de 7 días sin facturar"
					tone="amber"
				/>
				<SummaryCard
					label="Cerradas sin pago"
					value={summary?.totalClosedPendingPayment || 0}
					icon={<Receipt className="h-5 w-5 text-[var(--text-secondary)]" />}
					description="Órdenes cerradas con factura aún no pagada"
				/>
				<SummaryCard
					label="Días Promedio"
					value={`${summary?.averageDaysWaiting || 0} d`}
					icon={<Clock className="h-5 w-5 text-[var(--color-brand-blue)]" />}
					description="Desde completitud a hoy"
				/>
			</section>

			<section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
				{[
					["Completadas", financialSummary?.copByStage.completed ?? 0],
					["Listas", financialSummary?.copByStage.readyForInvoicing ?? 0],
					["SES pendiente", financialSummary?.copByStage.sesPending ?? 0],
					["Factura pendiente", financialSummary?.copByStage.invoicePending ?? 0],
					["Pagadas", financialSummary?.copByStage.paid ?? 0],
				].map(([label, amount]) => (
					<div
						key={String(label)}
						className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-3 shadow-[var(--shadow-1)]"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							{label}
						</p>
						<p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
							{COP_FORMATTER.format(Number(amount))}
						</p>
					</div>
				))}
			</section>

			{selectableIds.length > 0 ? (
				<section className="mb-4 flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<p className="text-sm font-semibold text-[var(--text-primary)]">
							{selectedOrderIds.length} orden
							{selectedOrderIds.length === 1 ? "" : "es"} seleccionada
							{selectedOrderIds.length === 1 ? "" : "s"}
						</p>
						<p className="text-xs text-[var(--text-secondary)]">
							Solo se pueden seleccionar órdenes completadas para marcarlas como listas para
							facturar.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button type="button" variant="ghost" onClick={toggleAllSelection} className="min-h-11">
							{allSelectableSelected ? "Deseleccionar todas" : "Seleccionar completadas"}
						</Button>
						<Button
							type="button"
							onClick={handleBatchMarkReady}
							disabled={selectedOrderIds.length === 0 || batchMarkReady.isPending}
							className="min-h-11"
						>
							{batchMarkReady.isPending ? "Procesando..." : "Marcar listas para facturar"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={handleBatchSes}
							disabled={selectedOrderIds.length === 0 || batchRegisterSes.isPending}
							className="min-h-11"
						>
							{batchRegisterSes.isPending ? "Registrando..." : "Generar SES por lote"}
						</Button>
					</div>
				</section>
			) : null}

			{/* Pipeline Table */}
			<section className="flex-1 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
				<div className="h-full overflow-auto">
					<table className="w-full min-w-[1100px] text-left text-sm text-[var(--text-secondary)]">
						<thead className="sticky top-0 bg-[var(--surface-secondary)] text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] shadow-sm">
							<tr>
								<th className="px-4 py-4 text-center">
									<input
										type="checkbox"
										checked={allSelectableSelected}
										onChange={toggleAllSelection}
										aria-label="Seleccionar órdenes completadas"
										className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--surface-primary)]"
									/>
								</th>
								<th className="px-6 py-4">Orden</th>
								<th className="px-6 py-4">Cliente / Activo</th>
								<th className="px-6 py-4 text-center">Estado</th>
								<th className="px-6 py-4 text-center">Completada</th>
								<th className="px-6 py-4 text-center">Aging</th>
								<th className="px-6 py-4 text-center">Acta</th>
								<th className="px-6 py-4 text-right">Valor COP</th>
								<th className="px-6 py-4 text-center">Factura</th>
								<th className="px-6 py-4">SES</th>
								<th className="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-default)]">
							{pipeline.length === 0 ? (
								<tr>
									<td colSpan={11} className="py-12 text-center text-[var(--text-tertiary)] italic">
										No hay órdenes en el pipeline de facturación actualmente.
									</td>
								</tr>
							) : (
								pipeline.map((item: BillingPipelineItem) => (
									<tr
										key={item._id}
										className="group transition-colors hover:bg-[var(--surface-secondary)]"
									>
										<td className="px-4 py-4 text-center">
											{item.status === "completed" ? (
												<input
													type="checkbox"
													checked={selectedOrderIds.includes(item._id)}
													onChange={() => toggleOrderSelection(item._id)}
													aria-label={`Seleccionar ${item.code}`}
													className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--surface-primary)]"
												/>
											) : (
												<span className="text-xs text-[var(--text-tertiary)]">-</span>
											)}
										</td>
										<td className="px-6 py-4">
											<div className="font-mono font-medium text-[var(--text-primary)]">
												{item.code}
											</div>
											<div className="mt-0.5 text-[10px] text-[var(--text-tertiary)] uppercase tracking-tighter">
												{item.type}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
												{item.clientName ?? "Cliente sin nombre"}
											</div>
											<div className="mt-1 max-w-[220px] truncate font-medium text-[var(--text-primary)]">
												{item.assetName}
											</div>
											<div className="text-xs text-[var(--text-tertiary)]">{item.location}</div>
										</td>
										<td className="px-6 py-4 text-center">
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
													item.status === "ready_for_invoicing"
														? "bg-green-500/10 text-green-400 border border-green-500/20"
														: "border border-[var(--color-brand-blue)]/20 bg-[var(--color-brand-blue-bg)] text-[var(--color-brand-blue)]"
												}`}
											>
												{item.status === "ready_for_invoicing"
													? "LISTA PARA FACTURAR"
													: "COMPLETADA"}
											</span>
										</td>
										<td className="px-6 py-4 text-center text-xs">
											{item.completedAt
												? format(new Date(item.completedAt), "dd MMM, yyyy", { locale: es })
												: "N/A"}
										</td>
										<td className="px-6 py-4 text-center">
											<div
												className={`text-sm font-semibold ${
													item.daysWaiting > 7
														? "text-[var(--color-danger)]"
														: item.daysWaiting > 3
															? "text-amber-400"
															: "text-[var(--text-secondary)]"
												}`}
											>
												{item.daysWaiting} {item.daysWaiting === 1 ? "día" : "días"}
											</div>
										</td>
										<td className="px-6 py-4 text-center">
											<span
												className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
													item.deliveryRecordSigned
														? "border border-green-500/20 bg-green-500/10 text-green-400"
														: item.hasDeliveryRecord
															? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
															: "border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
												}`}
											>
												{item.deliveryRecordSigned ? (
													<CheckCircle2 className="h-3 w-3" aria-hidden="true" />
												) : null}
												{item.deliveryRecordSigned
													? "Firmada"
													: item.hasDeliveryRecord
														? "Cargada"
														: "Pendiente"}
											</span>
										</td>
										<td className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-primary)]">
											{COP_FORMATTER.format(item.nteAmount ?? 0)}
										</td>
										<td className="px-6 py-4 text-center text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
											{item.invoiceStatus ?? "pending"}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<input
													type="text"
													value={sesByOrder[item._id] ?? ""}
													onChange={(event) =>
														setSesByOrder((current) => ({
															...current,
															[item._id]: event.target.value,
														}))
													}
													placeholder="SES"
													className="h-8 w-24 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-2 text-xs text-[var(--text-primary)]"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => handleRegisterSes(item._id)}
													disabled={batchRegisterSes.isPending}
													className="h-8 px-2"
												>
													Generar SES
												</Button>
											</div>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex justify-end gap-2">
												<Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
													<Link href={`/orders/${item._id}`}>
														<ExternalLink className="h-4 w-4" />
													</Link>
												</Button>
												<Button variant="ghost" size="sm" asChild className="h-8 px-2">
													<Link href={`/orders/${item._id}/invoice`}>Factura</Link>
												</Button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	);
}

function SummaryCard({
	label,
	value,
	icon,
	description,
	tone = "blue",
}: {
	label: string;
	value: string | number;
	icon: ReactNode;
	description: string;
	tone?: "blue" | "green" | "amber";
}) {
	const toneClass = {
		blue: "border-[var(--color-brand-blue)]/20 bg-[var(--color-brand-blue-bg)]",
		green: "border-green-500/20 bg-green-500/5",
		amber: "border-amber-500/20 bg-amber-500/5",
	}[tone];

	return (
		<article className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${toneClass}`}>
			<div className="flex items-center justify-between mb-2">
				<div className="rounded-lg bg-[var(--surface-secondary)] p-2">{icon}</div>
			</div>
			<div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
			<div className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">{label}</div>
			<div className="mt-1 text-[10px] text-[var(--text-tertiary)]">{description}</div>
		</article>
	);
}
