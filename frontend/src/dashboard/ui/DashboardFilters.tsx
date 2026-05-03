"use client";

import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

// ── Constants ──
const filterInputCls =
	"w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] py-2.5 px-4 font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20";

// ── Component ──
export function DashboardFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? "");
	const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
	const [client, setClient] = useState(searchParams.get("client") ?? "");

	function handleSubmit(e: FormEvent) {
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
		router.push(`/dashboard?${params.toString()}`);
	}

	function handleClear() {
		setStartDate("");
		setEndDate("");
		setClient("");
		router.push("/dashboard");
	}

	const hasActiveFilters =
		!!searchParams.get("startDate") ||
		!!searchParams.get("endDate") ||
		!!searchParams.get("client");

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
					placeholder="Buscar por cliente..."
					className={filterInputCls}
				/>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="submit"
					className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Filter aria-hidden="true" className="h-4 w-4" />
					Filtrar
				</button>

				{hasActiveFilters && (
					<button
						type="button"
						onClick={handleClear}
						className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)]"
					>
						<X aria-hidden="true" className="h-4 w-4" />
						Limpiar
					</button>
				)}
			</div>
		</form>
	);
}
