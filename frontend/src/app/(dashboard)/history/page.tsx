"use client";

import type { ApiBody, HistoryOrderRow, HistoryStats } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Download, FileArchive, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/_shared/lib/http/api-client";
import { requestBinaryDownload } from "@/_shared/lib/http/download-client";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { Button } from "@/core/ui/Button";

interface HistoryEnvelope extends ApiBody<HistoryOrderRow[]> {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
	};
}

type HistoryFilters = {
	dateFrom: string;
	dateTo: string;
	client: string;
	type: string;
	technician: string;
};

const initialFilters: HistoryFilters = {
	dateFrom: "",
	dateTo: "",
	client: "",
	type: "",
	technician: "",
};

function buildSearchParams(filters: HistoryFilters): string {
	const params = new URLSearchParams({ page: "1", limit: "50" });
	for (const [key, value] of Object.entries(filters)) {
		if (value.trim()) {
			params.set(key, value.trim());
		}
	}
	return params.toString();
}

function toDownloadBody(filters: HistoryFilters): Record<string, string> {
	return Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim().length > 0));
}

export default function HistoryPage() {
	const queryClient = useQueryClient();
	const [filters, setFilters] = useState(initialFilters);
	const queryString = useMemo(() => buildSearchParams(filters), [filters]);
	const downloadBody = useMemo(() => toDownloadBody(filters), [filters]);
	const { data: stats } = useQuery({
		queryKey: ["history", "stats"],
		queryFn: async (): Promise<HistoryStats> => {
			const body = await apiClient.get<ApiBody<HistoryStats>>("/history/stats");
			if (!body.success) {
				throw new Error(body.message || body.error || "No se pudieron cargar estadísticas");
			}
			return body.data;
		},
	});
	const { data, isLoading, isError } = useQuery({
		queryKey: ["history", "orders", queryString],
		queryFn: async () => {
			const body = await apiClient.get<HistoryEnvelope>(`/history?${queryString}`);
			if (!body.success) {
				throw new Error(body.message || body.error || "No se pudieron cargar históricos");
			}
			return {
				rows: body.data ?? [],
				total: body.meta?.total ?? body.data?.length ?? 0,
			};
		},
	});
	const archiveMutation = useMutation({
		mutationFn: async () => {
			const body = await apiClient.post<ApiBody<{ archivedCount: number }>>("/history/archive", {
				days: 30,
			});
			if (!body.success) {
				throw new Error(body.message || body.error || "No se pudo ejecutar el archivado");
			}
			return body.data;
		},
		onSuccess: (result) => {
			toast.success(`${result.archivedCount} órdenes archivadas`);
			void queryClient.invalidateQueries({ queryKey: ["history"] });
		},
	});
	const financialMutation = useMutation({
		mutationFn: async () => {
			const body = await apiClient.post<
				ApiBody<{ totalOrders: number; totalCop: number; paidOrders: number }>
			>("/history/export/financial", downloadBody);
			if (!body.success) {
				throw new Error(body.message || body.error || "No se pudo generar reporte financiero");
			}
			return body.data;
		},
		onSuccess: (result) => {
			toast.success(
				`${result.totalOrders} órdenes · ${formatCurrency(result.totalCop)} · ${result.paidOrders} pagadas`,
			);
		},
	});

	const updateFilter = (key: keyof HistoryFilters, value: string) => {
		setFilters((current) => ({ ...current, [key]: value }));
	};

	const downloadCsv = async () => {
		await requestBinaryDownload({
			path: "/history/export/csv",
			method: "POST",
			body: downloadBody,
			filename: "historicos-cermont.csv",
			fallbackMessage: "No se pudo descargar el CSV",
		});
	};

	const downloadZip = async () => {
		await requestBinaryDownload({
			path: "/history/export/zip",
			method: "POST",
			body: downloadBody,
			filename: "historicos-cermont.zip",
			fallbackMessage: "No se pudo descargar el ZIP",
		});
	};

	return (
		<section className="space-y-6" aria-labelledby="history-title">
			<header className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
							Históricos
						</p>
						<h1 id="history-title" className="text-2xl font-bold text-[var(--text-primary)]">
							Portal de históricos
						</h1>
						<p className="max-w-2xl text-sm text-[var(--text-secondary)]">
							Consulta órdenes archivadas con `archived: true` y descarga paquetes operativos.
						</p>
					</div>
					<Button
						type="button"
						onClick={() => archiveMutation.mutate()}
						disabled={archiveMutation.isPending}
					>
						<Archive className="h-4 w-4" aria-hidden="true" />
						{archiveMutation.isPending ? "Archivando..." : "Ejecutar archivado"}
					</Button>
				</div>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<MetricCard label="Archivadas" value={stats?.archivedOrders ?? 0} />
				<MetricCard label="Pagadas" value={stats?.paidArchivedOrders ?? 0} />
				<MetricCard label="Valor histórico" value={formatCurrency(stats?.totalArchivedCop ?? 0)} />
				<MetricCard
					label="Regla"
					value={`${stats?.nextArchiveRuleDays ?? 30} días después de pago`}
				/>
			</section>

			<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
					<FilterInput
						label="Desde"
						type="date"
						value={filters.dateFrom}
						onChange={(value) => updateFilter("dateFrom", value)}
					/>
					<FilterInput
						label="Hasta"
						type="date"
						value={filters.dateTo}
						onChange={(value) => updateFilter("dateTo", value)}
					/>
					<FilterInput
						label="Cliente"
						value={filters.client}
						onChange={(value) => updateFilter("client", value)}
					/>
					<FilterInput
						label="Técnico"
						value={filters.technician}
						onChange={(value) => updateFilter("technician", value)}
					/>
					<label className="space-y-1">
						<span className="text-xs font-semibold text-[var(--text-secondary)]">Tipo</span>
						<select
							value={filters.type}
							onChange={(event) => updateFilter("type", event.target.value)}
							className="min-h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
						>
							<option value="">Todos</option>
							<option value="maintenance">Mantenimiento</option>
							<option value="inspection">Inspección</option>
							<option value="installation">Instalación</option>
							<option value="repair">Reparación</option>
							<option value="decommission">Descomisionamiento</option>
						</select>
					</label>
				</div>
				<div className="mt-4 flex flex-wrap gap-2">
					<Button type="button" variant="outline" onClick={downloadCsv}>
						<Download className="h-4 w-4" aria-hidden="true" />
						CSV completo
					</Button>
					<Button type="button" variant="outline" onClick={downloadZip}>
						<FileArchive className="h-4 w-4" aria-hidden="true" />
						ZIP de paquete
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => financialMutation.mutate()}
						disabled={financialMutation.isPending}
					>
						<Download className="h-4 w-4" aria-hidden="true" />
						Reporte financiero
					</Button>
					<Button type="button" variant="ghost" onClick={() => setFilters(initialFilters)}>
						Limpiar filtros
					</Button>
				</div>
			</section>

			<section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
				<div className="border-b border-[var(--border-default)] px-4 py-3">
					<p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
						<Search className="h-4 w-4" aria-hidden="true" />
						{data?.total ?? 0} resultados
					</p>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[900px] text-left text-sm">
						<thead className="bg-[var(--surface-secondary)] text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							<tr>
								<th className="px-4 py-3">Orden</th>
								<th className="px-4 py-3">Cliente</th>
								<th className="px-4 py-3">Activo</th>
								<th className="px-4 py-3">Técnico</th>
								<th className="px-4 py-3">Completada</th>
								<th className="px-4 py-3 text-right">Valor</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-default)]">
							{isLoading ? (
								<tr>
									<td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
										Cargando históricos...
									</td>
								</tr>
							) : isError ? (
								<tr>
									<td colSpan={6} className="px-4 py-8 text-center text-[var(--color-danger)]">
										No se pudieron cargar los históricos.
									</td>
								</tr>
							) : (data?.rows ?? []).length === 0 ? (
								<tr>
									<td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
										No hay órdenes archivadas para los filtros seleccionados.
									</td>
								</tr>
							) : (
								data?.rows.map((row) => (
									<tr key={row._id}>
										<td className="px-4 py-3 font-mono text-[var(--text-primary)]">{row.code}</td>
										<td className="px-4 py-3 text-[var(--text-secondary)]">
											{row.clientName ?? "Sin cliente"}
										</td>
										<td className="px-4 py-3 text-[var(--text-primary)]">{row.assetName}</td>
										<td className="px-4 py-3 text-[var(--text-secondary)]">
											{row.technicianName ?? "Sin técnico"}
										</td>
										<td className="px-4 py-3 text-[var(--text-secondary)]">
											{row.completedAt ? formatDate(row.completedAt) : "N/D"}
										</td>
										<td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
											{formatCurrency(row.totalCop)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>
		</section>
	);
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
				{label}
			</p>
			<p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
		</article>
	);
}

function FilterInput({
	label,
	type = "text",
	value,
	onChange,
}: {
	label: string;
	type?: "date" | "text";
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="space-y-1">
			<span className="text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="min-h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
			/>
		</label>
	);
}
