"use client";

import type { AnalyticsReportDomain, AnalyticsReportFilter } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Download, FileDown, Loader2, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import {
	exportAnalyticsCsv,
	generateAnalyticsReport,
	getOperationalKpis,
} from "@/modules/analytics-report/api";

const DOMAIN_LABELS: Record<AnalyticsReportDomain, string> = {
	"work-requests": "Solicitudes de Trabajo",
	orders: "Órdenes de Trabajo",
	invoices: "Facturas",
	payments: "Pagos",
	ses: "Actas (SES)",
};

function AnalyticsPage() {
	const queryClient = useQueryClient();
	const [selectedDomain, setSelectedDomain] = useState<AnalyticsReportDomain>("orders");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	const filters: AnalyticsReportFilter = {
		...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
		...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
		...(statusFilter.trim() ? { status: statusFilter.trim() } : {}),
	};

	const { data: kpi, error: kpiError } = useQuery({
		queryKey: ["analytics-kpi", dateFrom, dateTo],
		queryFn: () => getOperationalKpis(filters),
	});

	const reportMutation = useMutation({
		mutationFn: () => generateAnalyticsReport(selectedDomain, filters),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["analytics-kpi"] }),
	});

	const exportMutation = useMutation({
		mutationFn: () => exportAnalyticsCsv(selectedDomain, filters),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["analytics-kpi"] }),
	});

	return (
		<section className="mx-auto max-w-6xl space-y-6 px-4 py-8" aria-labelledby="analytics-title">
			<header>
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl bg-info-bg text-brand-green dark:bg-blue-900/30 dark:text-brand-green">
						<BarChart3 className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h1 id="analytics-title" className="text-xl font-semibold text-ink dark:text-white">
							Analítica y Reportes
						</h1>
						<p className="mt-0.5 text-sm text-steel dark:text-stone">
							Genera reportes personalizados con filtros y exportación
						</p>
					</div>
				</div>
			</header>

			{kpiError ? (
				<ErrorFallback
					title="No se pudieron cargar los indicadores"
					description="Revise la conexion e intente nuevamente."
				/>
			) : null}

			{/* KPI Cards */}
			{kpi && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
					{Object.entries(kpi.steps).map(([key, value]) => (
						<div
							key={key}
							className="rounded-xl border border-hairline bg-canvas p-3 text-center dark:border-zinc-700 dark:bg-canvas"
						>
							<p className="text-xs font-medium uppercase tracking-wide text-steel dark:text-stone">
								{key.replace(/([A-Z])/g, " $1").trim()}
							</p>
							<p className="mt-1 text-xl font-bold text-[#2154A6] dark:text-brand-green">{value}</p>
						</div>
					))}
				</div>
			)}

			{/* Filters */}
			<div className="rounded-xl border border-hairline bg-canvas p-5 dark:border-zinc-700 dark:bg-canvas">
				<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
					<Search className="size-4" aria-hidden="true" />
					Generar Reporte
				</h2>
				<div className="grid gap-4 sm:grid-cols-4">
					<FormField label="Tipo de reporte" htmlFor="analytics-domain">
						<Select
							id="analytics-domain"
							value={selectedDomain}
							onChange={(event) => setSelectedDomain(event.target.value as AnalyticsReportDomain)}
						>
							{Object.entries(DOMAIN_LABELS).map(([key, label]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</Select>
					</FormField>
					<FormField label="Fecha inicio" htmlFor="analytics-date-from">
						<TextField
							id="analytics-date-from"
							type="date"
							value={dateFrom}
							onChange={(event) => setDateFrom(event.target.value)}
						/>
					</FormField>
					<FormField label="Fecha fin" htmlFor="analytics-date-to">
						<TextField
							id="analytics-date-to"
							type="date"
							value={dateTo}
							onChange={(event) => setDateTo(event.target.value)}
						/>
					</FormField>
					<FormField label="Estado (opcional)" htmlFor="analytics-status">
						<TextField
							id="analytics-status"
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value)}
							placeholder="ej. approved, paid..."
						/>
					</FormField>
				</div>
				<div className="mt-4 flex justify-end gap-3">
					<Button
						type="button"
						onClick={() => reportMutation.mutate()}
						loading={reportMutation.isPending}
						variant="primary"
					>
						{!reportMutation.isPending ? <RefreshCw className="size-4" /> : null}
						{reportMutation.isPending ? "Generando..." : "Generar Reporte"}
					</Button>
					{reportMutation.data ? (
						<Button
							type="button"
							onClick={() => exportMutation.mutate()}
							loading={exportMutation.isPending}
							variant="secondary"
						>
							<FileDown className="size-4" />
							Exportar CSV
						</Button>
					) : null}
				</div>
			</div>

			{reportMutation.error ? (
				<ErrorFallback
					title="No se pudo generar el reporte"
					description={reportMutation.error.message}
				/>
			) : null}

			{exportMutation.error ? (
				<div
					className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
					role="alert"
				>
					{exportMutation.error.message}
				</div>
			) : null}

			{/* Results */}
			{reportMutation.isPending && (
				<div className="flex justify-center py-16">
					<Loader2 className="size-8 animate-spin text-stone" />
				</div>
			)}

			{reportMutation.data && !reportMutation.isPending && (
				<div className="overflow-hidden rounded-xl border border-hairline dark:border-zinc-700">
					<div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 dark:border-zinc-700 dark:bg-surface/50">
						<p className="text-xs text-steel dark:text-stone">
							{reportMutation.data.total}{" "}
							{reportMutation.data.total === 1 ? "resultado" : "resultados"}
						</p>
						<Button
							type="button"
							onClick={() => exportMutation.mutate()}
							loading={exportMutation.isPending}
							variant="ghost"
							size="sm"
						>
							<Download className="size-3.5" />
							CSV
						</Button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-hairline bg-surface dark:border-zinc-700 dark:bg-surface/30">
									{reportMutation.data.headers.map((header) => (
										<th
											key={header}
											className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-steel"
										>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{reportMutation.data.rows.length === 0 ? (
									<tr>
										<td
											colSpan={reportMutation.data.headers.length}
											className="px-4 py-12 text-center text-sm text-stone"
										>
											No se encontraron resultados con los filtros aplicados
										</td>
									</tr>
								) : (
									reportMutation.data.rows.map((row) => (
										<tr
											key={String(row.ID)}
											className="border-b border-zinc-100 transition hover:bg-surface dark:border-zinc-800 dark:hover:bg-zinc-800/30"
										>
											{reportMutation.data.headers.map((header) => (
												<td
													key={header}
													className="whitespace-nowrap px-4 py-2.5 text-charcoal dark:text-muted-text"
												>
													{String(row[header] ?? "—")}
												</td>
											))}
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{!reportMutation.data && !reportMutation.isPending && (
				<EmptyState
					icon="search"
					title="Seleccione filtros y genere un reporte"
					description="Use los filtros superiores para personalizar su consulta y presione 'Generar Reporte'"
				/>
			)}
		</section>
	);
}

export default AnalyticsPage;
