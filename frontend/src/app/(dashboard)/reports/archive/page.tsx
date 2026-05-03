"use client";

import type { ApiBody } from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

interface ArchivedOrderRow {
	_id: string;
	orderId: string;
	orderCode: string;
	period: string;
	archivedAt: string;
	snapshot: {
		assetName?: string;
		location?: string;
		billing?: { invoiceStatus?: string };
	};
}

interface ArchiveResponse extends ApiBody<ArchivedOrderRow[]> {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
}

export default function ArchiveReportsPage() {
	const [search, setSearch] = useState("");
	const [period, setPeriod] = useState("");
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["archived-orders", { search, period }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (search.trim()) {
				params.set("search", search.trim());
			}
			if (period.trim()) {
				params.set("period", period.trim());
			}
			const body = await apiClient.get<ArchiveResponse>(
				`/admin/archived-orders${params.toString() ? `?${params}` : ""}`,
			);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "No fue posible cargar el histórico.");
			}
			return { rows: body.data ?? [], meta: body.meta };
		},
		staleTime: STALE_TIMES.LIST,
		placeholderData: keepPreviousData,
	});

	const archiveMutation = useMutation({
		mutationFn: async () => {
			const body = await apiClient.post<ApiBody<{ archivedCount: number }>>("/admin/archive", {});
			if (!body.success || !body.data) {
				throw new Error(body.message || body.error || "No se pudo ejecutar el archivado");
			}
			return body.data;
		},
		onSuccess: (result) => {
			toast.success(`${result.archivedCount} órdenes archivadas`);
			void queryClient.invalidateQueries({ queryKey: ["archived-orders"] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "No se pudo ejecutar el archivado");
		},
	});

	return (
		<section className="space-y-6" aria-labelledby="archive-reports-title">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 id="archive-reports-title" className="text-2xl font-bold text-slate-900">
						Archivo histórico
					</h1>
					<p className="text-sm text-slate-500">
						Consulta órdenes archivadas y ejecuta el archivado administrativo mensual.
					</p>
				</div>
				<button
					type="button"
					onClick={() => archiveMutation.mutate()}
					disabled={archiveMutation.isPending}
					className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
				>
					{archiveMutation.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
					) : (
						<Archive className="h-4 w-4" aria-hidden="true" />
					)}
					Ejecutar archivado
				</button>
			</div>

			<div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
				<label htmlFor="archive-search" className="space-y-1">
					<span className="text-sm font-medium text-slate-700">Buscar OT</span>
					<div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
						<Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
						<input
							id="archive-search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="OT-202604-0001"
							className="min-h-11 flex-1 bg-transparent text-sm outline-none"
						/>
					</div>
				</label>
				<label htmlFor="archive-period" className="space-y-1">
					<span className="text-sm font-medium text-slate-700">Periodo</span>
					<input
						id="archive-period"
						type="month"
						value={period}
						onChange={(event) => setPeriod(event.target.value)}
						className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm"
					/>
				</label>
			</div>

			<div
				className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
				aria-busy={query.isLoading}
			>
				{query.isLoading ? (
					<p role="status" aria-live="polite" className="text-sm text-slate-500">
						Cargando órdenes archivadas...
					</p>
				) : null}
				{query.isError ? (
					<div role="alert" className="space-y-2">
						<p className="text-sm text-red-600">No se pudo cargar el histórico.</p>
						<button
							type="button"
							onClick={() => query.refetch()}
							className="rounded-md border border-slate-300 px-3 py-1 text-sm"
						>
							Reintentar
						</button>
					</div>
				) : null}

				{!query.isLoading && !query.isError && (query.data?.rows.length ?? 0) === 0 ? (
					<p className="text-sm text-slate-500">No hay órdenes archivadas.</p>
				) : null}

				{!query.isLoading && !query.isError && (query.data?.rows.length ?? 0) > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="border-b border-slate-100 text-left text-slate-500">
									<th className="px-2 py-2">Orden</th>
									<th className="px-2 py-2">Activo</th>
									<th className="px-2 py-2">Periodo</th>
									<th className="px-2 py-2">Archivada</th>
									<th className="px-2 py-2">Factura</th>
								</tr>
							</thead>
							<tbody>
								{query.data?.rows.map((row) => (
									<tr key={row._id} className="border-b border-slate-100">
										<td className="px-2 py-2 font-mono font-medium text-slate-900">
											{row.orderCode}
										</td>
										<td className="px-2 py-2 text-slate-700">
											{row.snapshot.assetName ?? "Activo sin nombre"}
											<span className="block text-xs text-slate-500">
												{row.snapshot.location ?? "Sin ubicación"}
											</span>
										</td>
										<td className="px-2 py-2 text-slate-700">{row.period}</td>
										<td className="px-2 py-2 text-slate-700">
											{new Date(row.archivedAt).toLocaleDateString("es-CO")}
										</td>
										<td className="px-2 py-2 text-slate-700">
											{row.snapshot.billing?.invoiceStatus ?? "paid"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : null}
			</div>
		</section>
	);
}
