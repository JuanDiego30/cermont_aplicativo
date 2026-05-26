"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/core/ui/Button";
import { FilterChip } from "@/core/ui/FilterChip";

interface OrdersPageFiltersProps {
	search: string | undefined;
	statusFilter: string | null;
	priorityFilter: string | null;
	hasActiveFilters: boolean;
	buildClearHref: () => string;
}

export function OrdersPageFilters({
	search,
	statusFilter,
	priorityFilter,
	hasActiveFilters,
	buildClearHref,
}: OrdersPageFiltersProps) {
	const pathname = usePathname();
	return (
		<div
			data-orders-reveal
			className="rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-card"
		>
			<div className="flex flex-wrap items-center gap-4">
				<div className="relative min-w-[280px] flex-1">
					<Search
						className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<form action="/orders" method="get">
						<input
							type="search"
							name="search"
							defaultValue={search}
							placeholder="Buscar por N° OT, activo o ubicación…"
							className="w-full rounded-full border border-[var(--border-medium)] bg-[var(--surface-page)] py-3 pl-11 pr-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all focus:border-[var(--color-focus-ring)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 shadow-inner"
							aria-label="Buscar órdenes"
						/>
					</form>
				</div>
				<div className="flex items-center gap-2">
					{statusFilter && (
						<FilterChip
							searchParams={[]}
							paramKey="status"
							label={`Estado: ${statusFilter}`}
							navHref={`${pathname}?page=1&limit=20`}
						/>
					)}
					{priorityFilter && (
						<FilterChip
							searchParams={[]}
							paramKey="priority"
							label={`Prioridad: ${priorityFilter}`}
							navHref={`${pathname}?page=1&limit=20`}
						/>
					)}
					{hasActiveFilters && (
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] px-4"
						>
							<Link href={buildClearHref()}>
								<X className="size-4" aria-hidden="true" />
								Limpiar filtros
							</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
