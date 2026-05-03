"use client";

import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/core/hooks/useDebounce";
import type { ProposalListFilters } from "@/proposals/queries";

interface ProposalFiltersProps {
	onFilter?: (filters: ProposalListFilters) => void;
}

const FILTER_FIELD_CLASS =
	"w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

const STATUS_OPTIONS = [
	{ value: "", label: "All statuses" },
	{ value: "draft", label: "Draft" },
	{ value: "sent", label: "Sent" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
	{ value: "expired", label: "Expired" },
] as const;

export function ProposalFilters({ onFilter }: ProposalFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams.toString();

	const initialSearch = searchParams.get("search") ?? "";
	const initialStatus = searchParams.get("status") ?? "";
	const initialDateFrom = searchParams.get("dateFrom") ?? "";
	const initialDateTo = searchParams.get("dateTo") ?? "";

	const [searchInput, setSearchInput] = useState(initialSearch);
	const [status, setStatus] = useState(initialStatus);
	const [dateFrom, setDateFrom] = useState(initialDateFrom);
	const [dateTo, setDateTo] = useState(initialDateTo);
	const [showFilters, setShowFilters] = useState(false);

	const debouncedSearch = useDebounce(searchInput, 400);

	useEffect(() => {
		const currentParams = new URLSearchParams(searchParamsString);
		const nextSearch = currentParams.get("search") ?? "";
		const nextStatus = currentParams.get("status") ?? "";
		const nextDateFrom = currentParams.get("dateFrom") ?? "";
		const nextDateTo = currentParams.get("dateTo") ?? "";

		setSearchInput((current) => (current === nextSearch ? current : nextSearch));
		setStatus((current) => (current === nextStatus ? current : nextStatus));
		setDateFrom((current) => (current === nextDateFrom ? current : nextDateFrom));
		setDateTo((current) => (current === nextDateTo ? current : nextDateTo));
	}, [searchParamsString]);

	const applyFilters = useCallback(
		(search: string, st: string, from: string, to: string) => {
			const currentParams = new URLSearchParams(searchParamsString);
			const nextParams = new URLSearchParams(searchParamsString);

			if (search) {
				nextParams.set("search", search);
			} else {
				nextParams.delete("search");
			}

			if (st) {
				nextParams.set("status", st);
			} else {
				nextParams.delete("status");
			}

			if (from) {
				nextParams.set("dateFrom", from);
			} else {
				nextParams.delete("dateFrom");
			}

			if (to) {
				nextParams.set("dateTo", to);
			} else {
				nextParams.delete("dateTo");
			}

			nextParams.set("page", "1");
			nextParams.sort();
			currentParams.sort();

			const nextQuery = nextParams.toString();
			if (nextQuery === currentParams.toString()) {
				return;
			}

			router.replace(`/proposals${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false });

			onFilter?.({
				...(search ? { search } : {}),
				...(st ? { status: st } : {}),
				...(from ? { dateFrom: from } : {}),
				...(to ? { dateTo: to } : {}),
			});
		},
		[router, searchParamsString, onFilter],
	);

	useEffect(() => {
		const currentParams = new URLSearchParams(searchParamsString);
		const currentSearch = currentParams.get("search") ?? "";

		if (debouncedSearch === currentSearch) {
			return;
		}

		applyFilters(
			debouncedSearch,
			currentParams.get("status") ?? "",
			currentParams.get("dateFrom") ?? "",
			currentParams.get("dateTo") ?? "",
		);
	}, [applyFilters, debouncedSearch, searchParamsString]);

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchInput(e.target.value);
	};

	const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const newStatus = e.target.value;
		setStatus(newStatus);
		applyFilters(searchInput, newStatus, dateFrom, dateTo);
	};

	const handleDateFromChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newDateFrom = e.target.value;
		setDateFrom(newDateFrom);
		applyFilters(searchInput, status, newDateFrom, dateTo);
	};

	const handleDateToChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newDateTo = e.target.value;
		setDateTo(newDateTo);
		applyFilters(searchInput, status, dateFrom, newDateTo);
	};

	const handleClearFilters = () => {
		setSearchInput("");
		setStatus("");
		setDateFrom("");
		setDateTo("");
		router.replace("/proposals", { scroll: false });
		onFilter?.({});
	};

	return (
		<section aria-label="Proposal filters" className="space-y-3">
			{/* Search bar */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<input
						id="proposal-filter-search"
						name="search"
						type="search"
						value={searchInput}
						onChange={handleSearchChange}
						placeholder="Search by number, client, or description..."
						className={`${FILTER_FIELD_CLASS} py-2.5 pl-10 pr-4`}
						aria-label="Search proposals"
					/>
					{searchInput && (
						<button
							type="button"
							onClick={() => {
								setSearchInput("");
								applyFilters("", status, dateFrom, dateTo);
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
							aria-label="Clear search"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
				<button
					type="button"
					onClick={() => setShowFilters(!showFilters)}
					className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
					aria-expanded={showFilters}
					aria-controls="advanced-filters"
				>
					<Filter className="h-4 w-4" aria-hidden="true" />
					<span className="hidden sm:inline">Filters</span>
				</button>
			</div>

			{/* Advanced filters */}
			{showFilters && (
				<div
					id="advanced-filters"
					className="flex flex-col gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 sm:flex-row"
				>
					<div className="flex-1">
						<label
							htmlFor="filter-status"
							className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
						>
							Status
						</label>
						<select
							id="filter-status"
							name="status"
							value={status}
							onChange={handleStatusChange}
							className={FILTER_FIELD_CLASS}
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
							className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
						>
							From
						</label>
						<input
							id="filter-date-from"
							name="dateFrom"
							type="date"
							value={dateFrom}
							onChange={handleDateFromChange}
							className={FILTER_FIELD_CLASS}
						/>
					</div>

					<div className="flex-1">
						<label
							htmlFor="filter-date-to"
							className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
						>
							To
						</label>
						<input
							id="filter-date-to"
							name="dateTo"
							type="date"
							value={dateTo}
							onChange={handleDateToChange}
							className={FILTER_FIELD_CLASS}
						/>
					</div>

					<div className="flex items-end">
						<button
							type="button"
							onClick={handleClearFilters}
							className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-primary)] hover:text-[var(--text-primary)]"
						>
							Clear filters
						</button>
					</div>
				</div>
			)}
		</section>
	);
}
