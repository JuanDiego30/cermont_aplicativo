"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";

interface OrdersPagePaginationProps {
	page: number;
	totalPages: number;
	total: number;
	ordersCount: number;
	buildHref: (p: number) => string;
	isLoading: boolean;
}

export function OrdersPagePagination({
	page,
	totalPages,
	total,
	ordersCount,
	buildHref,
	isLoading,
}: OrdersPagePaginationProps) {
	if (totalPages <= 1 || isLoading) {
		return null;
	}

	return (
		<nav
			data-orders-reveal
			aria-label="Paginación de órdenes"
			className="flex items-center justify-between border-t border-[var(--border-subtle)] p-6"
		>
			<p className="text-xs font-medium text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
				Mostrando <span className="text-[var(--text-primary)]">{ordersCount}</span> de{" "}
				<span className="text-[var(--text-primary)]">{total}</span> órdenes
			</p>

			<div className="flex items-center gap-2">
				<Button
					asChild
					variant="secondary"
					size="sm"
					className={page <= 1 ? "pointer-events-none opacity-50" : ""}
				>
					<Link href={page > 1 ? buildHref(page - 1) : "#"}>
						<ChevronLeft className="size-4" />
						Anterior
					</Link>
				</Button>

				<div className="flex items-center gap-1 mx-2">
					<span className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white text-sm font-bold shadow-md ring-1 ring-[var(--color-brand)]/20">
						{page}
					</span>
					<span className="text-sm font-medium text-[var(--text-tertiary)] px-2">
						de {totalPages}
					</span>
				</div>

				<Button
					asChild
					variant="secondary"
					size="sm"
					className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
				>
					<Link href={page < totalPages ? buildHref(page + 1) : "#"}>
						Siguiente
						<ChevronRight className="size-4" />
					</Link>
				</Button>
			</div>
		</nav>
	);
}
