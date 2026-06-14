"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/core/ui/EmptyState";
import { apiClient } from "@/lib/http/api-client";
import { buildAssetRoute } from "@/lib/routes";

type AssetItem = {
	_id: string;
	code: string;
	name: string;
	type: string;
	status: string;
	serialNumber?: string;
};

type AssetListContract = {
	success: boolean;
	data: AssetItem[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

function AssetList() {
	const { data, isLoading, error } = useQuery<AssetItem[]>({
		queryKey: ["assets"],
		queryFn: async () => {
			const json = await apiClient.get<AssetListContract>("/assets");
			return json.data;
		},
	});

	if (isLoading) {
		return (
			<div className="flex justify-center py-24" aria-live="polite">
				<Loader2 className="size-8 animate-spin text-brand-blue" aria-hidden="true" />
				<span className="sr-only">Cargando activos…</span>
			</div>
		);
	}
	if (error) {
		return (
			<EmptyState
				icon="assets"
				title="Error al cargar activos"
				description="No se pudieron cargar los activos."
			/>
		);
	}
	if (!data || data.length === 0) {
		return (
			<EmptyState
				icon="assets"
				title="Sin activos registrados"
				description="No hay activos registrados en el sistema."
			/>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{data.map((item: AssetItem) => (
				<Link
					key={item._id}
					href={buildAssetRoute(item._id)}
					className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 transition hover:shadow-[var(--shadow-2)]"
				>
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-blue)]">
							{item.type}
						</span>
						<span className="rounded-full bg-[var(--color-brand-blue-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-blue)]">
							{item.status}
						</span>
					</div>
					<p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
					<p className="mt-1 text-xs text-[var(--text-tertiary)]">
						{item.serialNumber ? `Serie: ${item.serialNumber}` : `Codigo: ${item.code}`}
					</p>
				</Link>
			))}
		</div>
	);
}

export default function AssetsPage() {
	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Activos</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Inventario de equipos, herramientas e instalaciones.
				</p>
			</div>
			<AssetList />
		</main>
	);
}
