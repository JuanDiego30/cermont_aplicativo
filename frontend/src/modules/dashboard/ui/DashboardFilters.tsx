"use client";

import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { readSearchParam } from "@/lib/utils/search-params";

// ── Constants ──
const filterInputCls =
	"w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] py-2.5 px-4 font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20";

export function DashboardFilters() {
	return (
		<Suspense fallback={<DashboardFiltersSkeleton />}>
			<DashboardFiltersInner />
		</Suspense>
	);
}

function DashboardFiltersSkeleton() {
	return (
		<div className="h-[90px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]" />
	);
}

// ── Component ──
function DashboardFiltersInner() {
	const { push } = useRouter();
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);

	const [startDate, setStartDate] = useState(getSearchParam("startDate") ?? "");
	const [endDate, setEndDate] = useState(getSearchParam("endDate") ?? "");
	const [client, setClient] = useState(getSearchParam("client") ?? "");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (startDate) {
			params.set("startDate", startDate);
		}
		if (endDate) {
			params.set("endDate", endDate);
		}
		if (client.trim()) {
			params.set("client", client.trim());
		}
		push(`/dashboard?${params.toString()}`);
	}

	function handleClear() {
		setStartDate("");
		setEndDate("");
		setClient("");
		push("/dashboard");
	}

	const hasActiveFilters =
		!!getSearchParam("startDate") || !!getSearchParam("endDate") || !!getSearchParam("client");

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
		>
			<div className="flex flex-col gap-1.5 min-w-[140px]">
				<label
					htmlFor="startDate"
					className="ml-1 text-sm font-semibold text-[var(--text-secondary)]"
				>
					Desde
				</label>
				<input
					id="startDate"
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className={filterInputCls}
				/>
			</div>

			<div className="flex flex-col gap-1.5 min-w-[140px]">
				<label
					htmlFor="endDate"
					className="ml-1 text-sm font-semibold text-[var(--text-secondary)]"
				>
					Hasta
				</label>
				<input
					id="endDate"
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					min={startDate || undefined}
					className={filterInputCls}
				/>
			</div>

			<div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
				<label htmlFor="client" className="ml-1 text-sm font-semibold text-[var(--text-secondary)]">
					Cliente
				</label>
				<input
					id="client"
					type="text"
					value={client}
					onChange={(e) => setClient(e.target.value)}
					placeholder="Buscar por cliente…"
					className={filterInputCls}
				/>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="submit"
					className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Filter aria-hidden="true" className="size-4" />
					Filtrar
				</button>

				{hasActiveFilters && (
					<button
						type="button"
						onClick={handleClear}
						className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)]"
					>
						<X aria-hidden="true" className="size-4" />
						Limpiar
					</button>
				)}
			</div>
		</form>
	);
}
