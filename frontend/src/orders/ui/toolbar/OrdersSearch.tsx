"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface OrdersSearchProps {
	value?: string;
	onChange: (value: string) => void;
}

export function OrdersSearch({ value = "", onChange }: OrdersSearchProps) {
	const [draft, setDraft] = useState(value);

	useEffect(() => {
		setDraft(value);
	}, [value]);

	useEffect(() => {
		const timeout = window.setTimeout(() => onChange(draft.trim()), 300);
		return () => window.clearTimeout(timeout);
	}, [draft, onChange]);

	return (
		<label htmlFor="orders-search" className="relative min-w-0 flex-1">
			<span className="sr-only">Buscar órdenes</span>
			<Search
				className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
				aria-hidden="true"
			/>
			<input
				id="orders-search"
				name="search"
				type="search"
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				placeholder="Buscar OT, activo, ubicación o técnico"
				className="min-h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
			/>
		</label>
	);
}
