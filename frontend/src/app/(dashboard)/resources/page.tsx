"use client";

import type { ApiBody } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ResourceCard } from "./ResourceCard";
import { RESOURCE_TYPE_LABELS } from "./resource-constants";

type ResourceInstance = {
	currentStatus?: string;
};

type ResourceApiItem = {
	_id?: string;
	id?: string;
	name?: string;
	type?: string;
	unit?: string;
	instances?: ResourceInstance[];
};

type NormalizedResource = {
	_id: string;
	name: string;
	type: string;
	unit: string;
	totalInstances: number;
	availableInstances: number;
	primaryStatus: string;
	availabilityPercentage: number;
};

function normalizeResource(resource: ResourceApiItem): NormalizedResource {
	const instances = resource.instances || [];
	const counts = instances.reduce(
		(acc, instance) => {
			const state = instance.currentStatus;

			if (state === "disponible") {
				acc.disponible += 1;
			}
			if (state === "en_uso" || state === "en uso") {
				acc.enUso += 1;
			}
			if (state === "mantenimiento") {
				acc.mantenimiento += 1;
			}
			if (state === "fuera_de_servicio" || state === "fuera de servicio") {
				acc.fueraDeServicio += 1;
			}

			return acc;
		},
		{ disponible: 0, enUso: 0, mantenimiento: 0, fueraDeServicio: 0 },
	);

	const primaryStatus =
		counts.fueraDeServicio > 0
			? "out_of_service"
			: counts.mantenimiento > 0
				? "maintenance"
				: counts.enUso > 0
					? "in_use"
					: "available";

	const totalInstances = instances.length;

	return {
		_id: resource._id || resource.id || resource.name || crypto.randomUUID(),
		name: resource.name || "Sin nombre",
		type: resource.type || "otro",
		unit: resource.unit || "otro",
		totalInstances,
		availableInstances: counts.disponible,
		primaryStatus,
		availabilityPercentage:
			totalInstances > 0 ? Math.round((counts.disponible / totalInstances) * 100) : 0,
	};
}

export default function ResourcesPage() {
	const [query, setQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	const { data, isLoading, isError, error } = useQuery<ResourceApiItem[]>({
		queryKey: ["resources"],
		queryFn: async () => {
			const body = await apiClient.get<ApiBody<ResourceApiItem[]>>("/resources");
			return body?.data || [];
		},
	});

	const normalizedResources = useMemo(() => (data || []).map(normalizeResource), [data]);

	const categoryOptions = useMemo(() => {
		const options = Array.from(new Set(normalizedResources.map((resource) => resource.type)));
		return ["all", ...options];
	}, [normalizedResources]);

	const filteredResources = useMemo(() => {
		const searchTerm = query.trim().toLowerCase();

		return normalizedResources.filter((resource) => {
			const matchesSearch =
				!searchTerm ||
				resource.name.toLowerCase().includes(searchTerm) ||
				resource.type.toLowerCase().includes(searchTerm) ||
				resource.unit.toLowerCase().includes(searchTerm);

			const matchesCategory = categoryFilter === "all" || resource.type === categoryFilter;

			return matchesSearch && matchesCategory;
		});
	}, [categoryFilter, normalizedResources, query]);

	const totals = useMemo(() => {
		const totalResources = normalizedResources.length;
		const totalInstances = normalizedResources.reduce(
			(acc, resource) => acc + resource.totalInstances,
			0,
		);
		const availableInstances = normalizedResources.reduce(
			(acc, resource) => acc + resource.availableInstances,
			0,
		);
		const lowStockResources = normalizedResources.filter(
			(resource) => resource.totalInstances > 0 && resource.availabilityPercentage <= 25,
		).length;

		return {
			totalResources,
			totalInstances,
			availableInstances,
			lowStockResources,
		};
	}, [normalizedResources]);

	const lowStockResources = normalizedResources.filter(
		(resource) => resource.totalInstances > 0 && resource.availabilityPercentage <= 25,
	);

	return (
		<section className="space-y-6" aria-labelledby="resources-page-title">
			<header className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
							Inventario
						</p>
						<h1 id="resources-page-title" className="text-2xl font-bold text-[var(--text-primary)]">
							Inventario y Recursos
						</h1>
						<p className="max-w-2xl text-sm text-[var(--text-secondary)]">
							Gestiona equipos, herramientas y materiales operativos con una vista clara de
							disponibilidad y estado.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Button asChild variant="outline">
							<Link href="/resources/kits">
								<Wrench aria-hidden="true" className="h-4 w-4" />
								Ver kits típicos
							</Link>
						</Button>
					</div>
				</div>
			</header>

			<section
				aria-label="Resumen de inventario"
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
			>
				{[
					{ label: "Recursos", value: totals.totalResources },
					{ label: "Instancias", value: totals.totalInstances },
					{ label: "Disponibles", value: totals.availableInstances, tone: "success" },
					{ label: "Stock bajo", value: totals.lowStockResources, tone: "warning" },
				].map((stat) => (
					<article
						key={stat.label}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							{stat.label}
						</p>
						<p
							className={`mt-2 text-3xl font-bold ${stat.tone === "success" ? "text-[var(--color-success)]" : stat.tone === "warning" ? "text-[var(--color-warning)]" : "text-[var(--text-primary)]"}`}
						>
							{stat.value}
						</p>
					</article>
				))}
			</section>

			{lowStockResources.length > 0 ? (
				<aside className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-[var(--color-warning)]">
							{lowStockResources.length} recurso{lowStockResources.length > 1 ? "s" : ""} con stock
							bajo
						</p>
						<p className="text-xs text-[var(--text-secondary)]">
							Revisa los elementos cercanos al límite para evitar quiebres operativos.
						</p>
					</div>
					<span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--color-warning)]">
						Prioridad alta
					</span>
				</aside>
			) : null}

			<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div className="relative w-full lg:max-w-md">
						<label htmlFor="resource-search" className="sr-only">
							Buscar recursos
						</label>
						<Search
							aria-hidden="true"
							className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
						/>
						<input
							id="resource-search"
							name="q"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Buscar por nombre, tipo o unidad"
							className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{categoryOptions.map((category) => {
							const label =
								category === "all" ? "Todas" : (RESOURCE_TYPE_LABELS[category] ?? category);
							const isActive = categoryFilter === category;

							return (
								<button
									key={category}
									type="button"
									onClick={() => setCategoryFilter(category)}
									className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
										isActive
											? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
											: "border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
									}`}
								>
									{label}
								</button>
							);
						})}
					</div>
				</div>
			</section>

			<section aria-labelledby="resources-list-title" className="space-y-4">
				<h2 id="resources-list-title" className="sr-only">
					Listado de recursos
				</h2>

				{isLoading ? (
					<div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)]">
						<Loader2 className="mr-2 h-6 w-6 animate-spin" /> Cargando...
					</div>
				) : isError ? (
					<div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 text-[var(--color-danger)] shadow-[var(--shadow-1)]">
						Error: {(error as Error).message}
					</div>
				) : filteredResources.length === 0 ? (
					<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
						<EmptyState
							title="Sin resultados"
							description="Prueba con otro filtro o cambia el término de búsqueda."
							icon="search"
							action={
								query || categoryFilter !== "all"
									? {
											label: "Limpiar filtros",
											onClick: () => {
												setQuery("");
												setCategoryFilter("all");
											},
										}
									: undefined
							}
						/>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{filteredResources.map((resource) => (
							<ResourceCard key={resource._id} resource={resource} />
						))}
					</div>
				)}
			</section>
		</section>
	);
}
