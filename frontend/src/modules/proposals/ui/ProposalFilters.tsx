"use client";

import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useReducer } from "react";
import { cloneSearchParams, readSearchParam } from "@/lib/utils/search-params";
import { useDebounce } from "@/modules/core/hooks/useDebounce";

interface ProposalFilterValues {
	search?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
}

interface ProposalFiltersProps {
	onFilter?: (filters: ProposalFilterValues) => void;
}

const STATUS_OPTIONS = [
	{ value: "", label: "Todos los estados" },
	{ value: "draft", label: "Borrador" },
	{ value: "sent", label: "Enviada" },
	{ value: "approved", label: "Aprobada" },
	{ value: "rejected", label: "Rechazada" },
	{ value: "expired", label: "Expirada" },
] as const;

// ── Reducer ──

interface FilterState {
	searchInput: string;
	status: string;
	dateFrom: string;
	dateTo: string;
	showFilters: boolean;
}

type FilterAction =
	| { type: "SET_SEARCH"; payload: string }
	| { type: "SET_STATUS"; payload: string }
	| { type: "SET_DATE_FROM"; payload: string }
	| { type: "SET_DATE_TO"; payload: string }
	| { type: "TOGGLE_FILTERS" }
	| { type: "CLEAR" };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
	switch (action.type) {
		case "SET_SEARCH":
			return { ...state, searchInput: action.payload };
		case "SET_STATUS":
			return { ...state, status: action.payload };
		case "SET_DATE_FROM":
			return { ...state, dateFrom: action.payload };
		case "SET_DATE_TO":
			return { ...state, dateTo: action.payload };
		case "TOGGLE_FILTERS":
			return { ...state, showFilters: !state.showFilters };
		case "CLEAR":
			return { ...state, searchInput: "", status: "", dateFrom: "", dateTo: "" };
		default:
			return state;
	}
}

// ── Public Component ──

export function ProposalFilters(props: ProposalFiltersProps) {
	return (
		<Suspense fallback={<ProposalFiltersSkeleton />}>
			<ProposalFiltersInner {...props} />
		</Suspense>
	);
}

function ProposalFiltersSkeleton() {
	return (
		<section
			aria-label="Filtros de propuestas"
			className="h-[50px] rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
		/>
	);
}

function ProposalFiltersInner({ onFilter }: ProposalFiltersProps) {
	const { push } = useRouter();
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);

	const initialSearch = getSearchParam("search") ?? "";
	const initialStatus = getSearchParam("status") ?? "";
	const initialDateFrom = getSearchParam("dateFrom") ?? "";
	const initialDateTo = getSearchParam("dateTo") ?? "";

	const [state, dispatch] = useReducer(filterReducer, {
		searchInput: initialSearch,
		status: initialStatus,
		dateFrom: initialDateFrom,
		dateTo: initialDateTo,
		showFilters: false,
	});

	const { searchInput, status, dateFrom, dateTo, showFilters } = state;

	const debouncedSearch = useDebounce(searchInput, 400);

	const applyFilters = useCallback(
		(search: string, st: string, from: string, to: string) => {
			const params = cloneSearchParams(searchParams);

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

			if (from) {
				params.set("dateFrom", from);
			} else {
				params.delete("dateFrom");
			}

			if (to) {
				params.set("dateTo", to);
			} else {
				params.delete("dateTo");
			}

			params.set("page", "1");

			const query = params.toString();
			push(`/proposals${query ? `?${query}` : ""}`);

			onFilter?.({
				search: search || undefined,
				status: st || undefined,
				dateFrom: from || undefined,
				dateTo: to || undefined,
			});
		},
		[push, searchParams, onFilter],
	);

	useEffect(() => {
		applyFilters(debouncedSearch, status, dateFrom, dateTo);
	}, [debouncedSearch, status, dateTo, dateFrom, applyFilters]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({ type: "SET_SEARCH", payload: e.target.value });
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newStatus = e.target.value;
		dispatch({ type: "SET_STATUS", payload: newStatus });
		applyFilters(searchInput, newStatus, dateFrom, dateTo);
	};

	const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDateFrom = e.target.value;
		dispatch({ type: "SET_DATE_FROM", payload: newDateFrom });
		applyFilters(searchInput, status, newDateFrom, dateTo);
	};

	const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDateTo = e.target.value;
		dispatch({ type: "SET_DATE_TO", payload: newDateTo });
		applyFilters(searchInput, status, dateFrom, newDateTo);
	};

	const handleClearFilters = () => {
		dispatch({ type: "CLEAR" });
		push("/proposals");
		onFilter?.({});
	};

	return (
		<section aria-label="Filtros de propuestas" className="space-y-3">
			{/* Search bar */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
						aria-hidden="true"
					/>
					<input
						type="search"
						value={searchInput}
						onChange={handleSearchChange}
						placeholder="Buscar por número, cliente o descripción…"
						className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-blue-400"
						aria-label="Buscar propuestas"
					/>
					{searchInput && (
						<button
							type="button"
							onClick={() => {
								dispatch({ type: "SET_SEARCH", payload: "" });
								applyFilters("", status, dateFrom, dateTo);
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							aria-label="Limpiar búsqueda"
						>
							<X className="size-4" />
						</button>
					)}
				</div>
				<button
					type="button"
					onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
					className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
					aria-expanded={showFilters}
					aria-controls="advanced-filters"
				>
					<Filter className="size-4" aria-hidden="true" />
					<span className="hidden sm:inline">Filtros</span>
				</button>
			</div>

			{/* Advanced filters */}
			{showFilters && (
				<div
					id="advanced-filters"
					className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row"
				>
					<div className="flex-1">
						<label
							htmlFor="filter-status"
							className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
						>
							Estado
						</label>
						<select
							id="filter-status"
							value={status}
							onChange={handleStatusChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
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
							htmlFor="filter-date-from"
							className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
						>
							Desde
						</label>
						<input
							id="filter-date-from"
							type="date"
							value={dateFrom}
							onChange={handleDateFromChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
						/>
					</div>

					<div className="flex-1">
						<label
							htmlFor="filter-date-to"
							className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
						>
							Hasta
						</label>
						<input
							id="filter-date-to"
							type="date"
							value={dateTo}
							onChange={handleDateToChange}
							className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
						/>
					</div>

					<div className="flex items-end">
						<button
							type="button"
							onClick={handleClearFilters}
							className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
						>
							Limpiar filtros
						</button>
					</div>
				</div>
			)}
		</section>
	);
}
