"use client";

import { hasRole, MANAGEMENT_ROLES } from "@cermont/domain";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, Plus, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface ToolSummary {
	_id: string;
	name: string;
	code: string;
	type: string;
	brand: string;
	serial: string;
	status: string;
	certifications: Array<{
		type: string;
		name: string;
		status: string;
		expiresAt: string;
	}>;
}

interface ToolsResponse {
	data: ToolSummary[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function ToolsPage() {
	const { user } = useAuth();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");

	// Stable date boundaries to avoid hydration mismatch from new Date() in JSX
	const now = useMemo(() => new Date(), []);
	const thirtyDaysFromNow = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), []);
	const canManage = user ? hasRole(user.role, MANAGEMENT_ROLES) : false;

	const { data, isLoading, error } = useQuery<ToolsResponse>({
		queryKey: ["tools", page, search],
		queryFn: async () => {
			const params = new URLSearchParams({ page: String(page), limit: "20" });
			if (search) {
				params.set("search", search);
			}
			const res = await apiClient.get<ToolsResponse>(`/api/tools?${params}`);
			return res;
		},
	});

	if (isLoading) {
		return (
			<section className="space-y-6" aria-label="Cargando herramientas">
				<Skeleton variant="text" className="h-10 w-64" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{["a", "b", "c", "d", "e", "f"].map((slot) => (
						<Skeleton key={`tool-skeleton-${slot}`} variant="card" className="h-44" />
					))}
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<EmptyState
				icon={AlertTriangle}
				title="Error al cargar herramientas"
				description="No se pudieron cargar las herramientas. Verifique la conexión al servidor."
			/>
		);
	}

	const tools = data?.data ?? [];
	const empty = tools.length === 0;

	return (
		<section className="space-y-6" aria-labelledby="tools-title">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="tools-title" className="text-2xl font-semibold text-[var(--text-primary)]">
						Herramientas y Equipos
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Inventario con certificaciones, calibraciones y estado operativo.
					</p>
				</div>
				{canManage && (
					<Link
						href="/tools/new"
						className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
					>
						<Plus className="size-4" aria-hidden="true" />
						Nueva herramienta
					</Link>
				)}
			</div>

			<div className="relative">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]"
					aria-hidden="true"
				/>
				<input
					type="search"
					placeholder="Buscar herramienta por nombre, código o serie..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
					className="w-full rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
					aria-label="Buscar herramientas"
				/>
			</div>

			{empty ? (
				<EmptyState
					icon={Wrench}
					title="Sin herramientas registradas"
					description="No hay herramientas en el inventario. Agregue la primera herramienta para comenzar."
					action={
						canManage
							? {
									label: "Agregar herramienta",
									onClick: () => {
										window.location.href = "/tools/new";
									},
								}
							: undefined
					}
				/>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{tools.map((tool) => {
						const expiredCerts = tool.certifications.filter(
							(c) => c.status === "valid" && new Date(c.expiresAt) < now,
						);
						const expiringCerts = tool.certifications.filter(
							(c) =>
								c.status === "valid" &&
								new Date(c.expiresAt) > now &&
								new Date(c.expiresAt) < thirtyDaysFromNow,
						);

						return (
							<Link
								key={tool._id}
								href={`/tools/${tool._id}`}
								className="group rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 transition-colors hover:border-[var(--color-brand-blue)]/40"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-blue)]/10">
										<Wrench className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
									</div>
									{tool.certifications.length > 0 && (
										<span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
											{tool.certifications.length} cert.
										</span>
									)}
								</div>

								<h3 className="mt-4 font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-brand-blue)]">
									{tool.name}
								</h3>
								<p className="mt-1 text-xs text-[var(--text-tertiary)]">
									{tool.code} · {tool.brand}
									{tool.serial ? ` · ${tool.serial}` : ""}
								</p>

								<div className="mt-3 flex items-center gap-3">
									<span
										className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
											tool.status === "active"
												? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
												: tool.status === "maintenance"
													? "bg-amber-50 text-amber-700"
													: "bg-red-50 text-red-700"
										}`}
									>
										{tool.status === "active"
											? "Disponible"
											: tool.status === "maintenance"
												? "En mantenimiento"
												: "Fuera de servicio"}
									</span>

									{expiredCerts.length > 0 && (
										<span className="inline-flex items-center gap-1 text-xs text-[var(--color-danger)]">
											<CalendarClock className="size-3" aria-hidden="true" />
											{expiredCerts.length} vencida(s)
										</span>
									)}
									{expiringCerts.length > 0 && expiredCerts.length === 0 && (
										<span className="inline-flex items-center gap-1 text-xs text-amber-600">
											<CalendarClock className="size-3" aria-hidden="true" />
											{expiringCerts.length} por vencer
										</span>
									)}
								</div>
							</Link>
						);
					})}
				</div>
			)}

			{data && data.pagination.totalPages > 1 && (
				<nav className="flex items-center justify-between" aria-label="Paginación">
					<p className="text-sm text-[var(--text-secondary)]">
						Página {data.pagination.page} de {data.pagination.totalPages}
					</p>
					<div className="flex gap-2">
						<button
							type="button"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							className="rounded-[var(--radius-md)] border border-[var(--border-medium)] px-3 py-1.5 text-sm disabled:opacity-40"
						>
							Anterior
						</button>
						<button
							type="button"
							disabled={page >= (data?.pagination.totalPages ?? 1)}
							onClick={() => setPage((p) => p + 1)}
							className="rounded-[var(--radius-md)] border border-[var(--border-medium)] px-3 py-1.5 text-sm disabled:opacity-40"
						>
							Siguiente
						</button>
					</div>
				</nav>
			)}
		</section>
	);
}
