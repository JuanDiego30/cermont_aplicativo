"use client";

import type { OrderListQuery } from "@cermont/shared-types";
import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/_shared/lib/utils";
import { useDebounce } from "@/core/hooks/useDebounce";

interface OrderFiltersProps {
	onFilter?: (filters: Partial<OrderListQuery>) => void;
}

const STATUS_OPTIONS = [
	{ value: "", label: "Todos los estados" },
	{ value: "open", label: "Abierta" },
	{ value: "assigned", label: "Asignada" },
	{ value: "in_progress", label: "En Progreso" },
	{ value: "on_hold", label: "En Pausa" },
	{ value: "completed", label: "Completada" },
	{ value: "closed", label: "Cerrada" },
	{ value: "cancelled", label: "Cancelada" },
] as const;

const PRIORITY_OPTIONS = [
	{ value: "", label: "Todas las prioridades" },
	{ value: "low", label: "Baja" },
	{ value: "medium", label: "Media" },
	{ value: "high", label: "Alta" },
	{ value: "critical", label: "Crítica" },
] as const;

export function OrderFilters({ onFilter }: OrderFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialSearch = searchParams.get("search") ?? "";
	const initialStatus = searchParams.get("status") ?? "";
	const initialPriority = searchParams.get("priority") ?? "";

	const [searchInput, setSearchInput] = useState(initialSearch);
	const [status, setStatus] = useState(initialStatus);
	const [priority, setPriority] = useState(initialPriority);
	const [showFilters, setShowFilters] = useState(false);

	const debouncedSearch = useDebounce(searchInput, 400);

	const applyFilters = useCallback(
		(search: string, st: string, pr: string) => {
			const params = new URLSearchParams(searchParams.toString());
			const normalizedStatus = st ? ([st] as OrderListQuery["status"]) : undefined;
			const normalizedPriority = pr ? ([pr] as OrderListQuery["priority"]) : undefined;

			if (search) {
				params.set("search", search);
			} else {
				params.delete("search");
			}

			if (st) {
				params.set("status", st);
			} else {
				params.delete("status");
			}

			if (pr) {
				params.set("priority", pr);
			} else {
				params.delete("priority");
			}

			params.set("page", "1");

			const query = params.toString();
			router.push(`/orders${query ? `?${query}` : ""}`);

			onFilter?.({
				search: search || undefined,
				status: normalizedStatus,
				priority: normalizedPriority,
			});
		},
		[router, searchParams, onFilter],
	);

	useEffect(() => {
		applyFilters(debouncedSearch, status, priority);
	}, [applyFilters, debouncedSearch, priority, status]);

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchInput(e.target.value);
	};

	const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const newStatus = e.target.value;
		setStatus(newStatus);
		applyFilters(searchInput, newStatus, priority);
	};

	const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const newPriority = e.target.value;
		setPriority(newPriority);
		applyFilters(searchInput, status, newPriority);
	};

	const handleClearFilters = () => {
		setSearchInput("");
		setStatus("");
		setPriority("");
		router.push("/orders");
		onFilter?.({});
	};

	return (
		<section aria-label="Filtros de órdenes" className="space-y-3">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<input
						id="order-filter-search"
						name="search"
						type="search"
						value={searchInput}
						onChange={handleSearchChange}
						placeholder="Buscar por código, activo o ubicación..."
						className={cn(
							"w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition",
							"placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20",
						)}
						aria-label="Buscar órdenes"
					/>
					{searchInput && (
						<button
							type="button"
							onClick={() => {
								setSearchInput("");
								applyFilters("", status, priority);
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
							aria-label="Limpiar búsqueda"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
				<button
					type="button"
					onClick={() => setShowFilters(!showFilters)}
					className={cn(
						"inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-1)] transition-colors",
						"hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",
					)}
					aria-expanded={showFilters}
					aria-controls="advanced-filters"
				>
					<Filter className="h-4 w-4" aria-hidden="true" />
					<span className="hidden sm:inline">Filtros</span>
				</button>
			</div>

			{/* Advanced filters */}
			{showFilters && (
				<div
					id="advanced-filters"
					className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] sm:flex-row"
				>
					<div className="flex-1">
						<label
							htmlFor="filter-status"
							className="mb-1.5 ml-1 block text-sm font-semibold text-[var(--text-secondary)]"
						>
							Estado
						</label>
						<select
							id="filter-status"
							name="status"
							value={status}
							onChange={handleStatusChange}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
						>
							{STATUS_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					<div className="flex-1">
						<label
							htmlFor="filter-priority"
							className="mb-1.5 ml-1 block text-sm font-semibold text-[var(--text-secondary)]"
						>
							Prioridad
						</label>
						<select
							id="filter-priority"
							name="priority"
							value={priority}
							onChange={handlePriorityChange}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
						>
							{PRIORITY_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-end">
						<button
							type="button"
							onClick={handleClearFilters}
							className="rounded-[var(--radius-lg)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
						>
							Limpiar filtros
						</button>
					</div>
				</div>
			)}
		</section>
	);
}
