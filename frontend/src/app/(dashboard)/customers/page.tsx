"use client";

/**
 * /customers — Lista de clientes (CRM) con búsqueda y paginación.
 */

import { Building2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import { useCustomers } from "@/modules/customers/queries";

const STATUS_LABELS: Record<string, string> = {
	active: "Activo",
	inactive: "Inactivo",
	suspended: "Suspendido",
};

const STATUS_STYLES: Record<string, string> = {
	active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	inactive: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)]",
	suspended: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
};

export default function CustomersPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [submittedSearch, setSubmittedSearch] = useState("");
	const { data, isLoading, error, refetch } = useCustomers({
		page,
		limit: 20,
		...(submittedSearch ? { search: submittedSearch } : {}),
	});

	const customers = data?.data ?? [];
	const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

	return (
		<section className="space-y-6" aria-labelledby="customers-title">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="customers-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Clientes
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{pagination.total} clientes registrados
					</p>
				</div>
				<Link
					href="/customers/new"
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<Plus className="size-4" aria-hidden="true" />
					Nuevo cliente
				</Link>
			</header>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					setSubmittedSearch(search.trim());
					setPage(1);
				}}
				className="flex gap-2"
			>
				<label htmlFor="customer-search" className="sr-only">
					Buscar por nombre, NIT o contacto
				</label>
				<input
					id="customer-search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar por nombre, NIT o contacto..."
					className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
				/>
				<button
					type="submit"
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					<Search className="size-4" aria-hidden="true" />
					Buscar
				</button>
			</form>

			{isLoading && (
				<div className="space-y-2">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} variant="chart" height={64} />
					))}
				</div>
			)}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">Error al cargar los clientes.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !error && customers.length === 0 && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-16 text-center">
					<Building2
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">
						{submittedSearch
							? "No hay clientes que coincidan con la búsqueda."
							: "Aún no hay clientes registrados."}
					</p>
				</div>
			)}

			{customers.length > 0 && (
				<ul className="space-y-2">
					{customers.map((customer) => (
						<li key={customer._id}>
							<Link
								href={`/customers/${customer._id}`}
								className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 transition-colors hover:bg-[var(--surface-secondary)]"
							>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="truncate text-sm font-medium text-[var(--text-primary)]">
											{customer.name}
										</p>
										<span
											className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[customer.status] ?? ""}`}
										>
											{STATUS_LABELS[customer.status] ?? customer.status}
										</span>
									</div>
									<p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
										NIT {customer.nit}
										{customer.contactName ? ` — ${customer.contactName}` : ""}
										{customer.city ? ` — ${customer.city}` : ""}
									</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}

			{pagination.totalPages > 1 && (
				<nav aria-label="Paginación" className="flex items-center justify-center gap-2">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Anterior
					</button>
					<span className="text-xs text-[var(--text-tertiary)]">
						{page} / {pagination.totalPages}
					</span>
					<button
						type="button"
						disabled={page >= pagination.totalPages}
						onClick={() => setPage((p) => p + 1)}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Siguiente
					</button>
				</nav>
			)}
		</section>
	);
}
