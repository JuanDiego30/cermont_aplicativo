"use client";

import Link from "next/link";

interface OrdersTableEmptyProps {
	createHref?: string;
	message?: string;
	createLabel?: string;
	hasActiveFilters?: boolean;
	onClearFilters?: () => void;
}

export function OrdersTableEmpty({
	createHref = "/orders/new",
	message = "No hay órdenes de trabajo registradas",
	createLabel = "Crear primera orden",
	hasActiveFilters = false,
	onClearFilters,
}: OrdersTableEmptyProps) {
	return (
		<section
			className="flex min-h-48 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)]"
			aria-label="Sin órdenes"
		>
			<p className="text-sm text-[var(--text-secondary)]">
				{hasActiveFilters ? "No hay órdenes que coincidan con los filtros." : message}
			</p>
			{hasActiveFilters && onClearFilters ? (
				<button
					type="button"
					onClick={onClearFilters}
					className="mt-3 text-sm font-semibold text-[var(--color-brand-blue)] hover:underline"
				>
					Limpiar filtros
				</button>
			) : (
				<Link
					href={createHref}
					className="mt-3 text-sm font-semibold text-[var(--color-brand-blue)] hover:underline"
				>
					{createLabel}
				</Link>
			)}
		</section>
	);
}
