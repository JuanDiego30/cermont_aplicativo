"use client";

/**
 * /admin/backups — Portal de respaldo y descarga de históricos.
 */

import { useQuery } from "@tanstack/react-query";
import { Database, Download } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient, toApiUrl } from "@/lib/http/api-client";

interface CollectionSummary {
	name: string;
	documentCount: number;
}

const BACKUP_KEYS = {
	collections: ["admin-backups", "collections"] as const,
};

const MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

export default function AdminBackupsPage() {
	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState(currentYear);
	const [month, setMonth] = useState(0); // 0 = todo el histórico
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: BACKUP_KEYS.collections,
		queryFn: async () => {
			const envelope = await apiClient.get<{ success: boolean; data: CollectionSummary[] }>(
				"/admin/backups/collections",
			);
			return envelope.data;
		},
	});

	const collections = data ?? [];

	function buildExportUrl(collection: string): string {
		const params = month > 0 ? `?year=${year}&month=${month}` : "";
		return toApiUrl(`/admin/backups/export/${collection}${params}`);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton variant="text" className="h-8 w-64" />
				<Skeleton variant="chart" height={280} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
				<p className="text-[var(--color-danger)]">Error al cargar las colecciones.</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
				>
					Reintentar
				</button>
			</div>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="backups-title">
			<header>
				<h1 id="backups-title" className="text-xl font-semibold text-[var(--text-primary)]">
					Respaldos y descarga de históricos
				</h1>
				<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
					Exporta colecciones en JSON para auditorías, consultas legales o análisis de tendencias.
				</p>
			</header>

			<div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
				<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
					Período
					<select
						value={month}
						onChange={(e) => setMonth(Number(e.target.value))}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
					>
						<option value={0}>Todo el histórico</option>
						{MONTHS.map((label, index) => (
							<option key={label} value={index + 1}>
								{label}
							</option>
						))}
					</select>
				</label>
				{month > 0 && (
					<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
						Año
						<input
							type="number"
							inputMode="numeric"
							min={2020}
							max={currentYear}
							value={year}
							onChange={(e) => setYear(Number(e.target.value))}
							className="w-28 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
						/>
					</label>
				)}
				<p className="text-xs text-[var(--text-tertiary)]">
					El filtro por mes aplica sobre la fecha de creación de cada registro.
				</p>
			</div>

			{collections.length === 0 ? (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-16 text-center">
					<Database
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">No hay colecciones disponibles.</p>
				</div>
			) : (
				<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{collections.map((collection) => (
						<li
							key={collection.name}
							className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-[var(--text-primary)]">
									{collection.name}
								</p>
								<p className="text-xs text-[var(--text-tertiary)]">
									{collection.documentCount.toLocaleString("es-CO")} documentos
								</p>
							</div>
							<a
								href={buildExportUrl(collection.name)}
								download
								className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand-blue)] hover:bg-[var(--surface-secondary)]"
							>
								<Download className="size-3.5" aria-hidden="true" />
								Exportar
							</a>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
