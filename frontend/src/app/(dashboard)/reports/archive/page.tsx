"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient, toApiUrl } from "@/lib/http/api-client";

type ArchivePeriod = {
	periodo: string;
	count: number;
};

export default function ArchiveReportsPage() {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["archive-periods"],
		queryFn: async () => {
			const body = await apiClient.get<{
				success?: boolean;
				data?: ArchivePeriod[];
				message?: string;
				error?: string;
			}>("/reports/archive");
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "No fue posible cargar los periodos.");
			}
			return body.data ?? [];
		},
		staleTime: STALE_TIMES.LIST,
		placeholderData: keepPreviousData,
	});

	return (
		<section className="space-y-6" aria-labelledby="archive-reports-title">
			<div>
				<h1 id="archive-reports-title" className="text-2xl font-semibold text-zinc-900">
					Archivo histórico
				</h1>
				<p className="text-sm text-zinc-500">Consulta y descarga órdenes archivadas por periodo.</p>
			</div>

			<div
				className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
				aria-busy={isLoading}
			>
				{isLoading ? (
					<p role="status" aria-live="polite" className="text-sm text-zinc-500">
						Cargando periodos…
					</p>
				) : null}
				{isError ? (
					<div role="alert" className="space-y-2">
						<p className="text-sm text-red-600">No se pudo cargar el histórico.</p>
						<button
							type="button"
							onClick={() => refetch()}
							className="rounded-md border border-zinc-300 px-3 py-1 text-sm"
						>
							Reintentar
						</button>
					</div>
				) : null}

				{!isLoading && !isError && (data?.length ?? 0) === 0 ? (
					<p className="text-sm text-zinc-500">No hay periodos archivados.</p>
				) : null}

				{!isLoading && !isError && (data?.length ?? 0) > 0 ? (
					<table className="min-w-full text-sm">
						<caption className="sr-only">
							Periodos archivados con cantidad de órdenes y acción para descarga.
						</caption>
						<thead>
							<tr className="border-b border-zinc-100 text-left text-zinc-500">
								<th scope="col" className="p-2">
									Periodo
								</th>
								<th scope="col" className="p-2">
									Órdenes
								</th>
								<th scope="col" className="p-2 text-right">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{data?.map((period) => (
								<tr key={period.periodo} className="border-b border-zinc-100">
									<th scope="row" className="p-2 text-left font-medium text-zinc-900">
										{period.periodo}
									</th>
									<td className="p-2 text-zinc-700">{period.count}</td>
									<td className="p-2 text-right">
										<a
											href={toApiUrl(`/reports/archive/${period.periodo}/download`)}
											className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
										>
											<Download aria-hidden="true" className="size-3.5" />
											Descargar
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : null}
			</div>
		</section>
	);
}
