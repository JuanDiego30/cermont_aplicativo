"use client";

import { LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";

interface OrdersPageHeaderProps {
	total: number;
	isLoading: boolean;
}

export function OrdersPageHeader({ total, isLoading }: OrdersPageHeaderProps) {
	return (
		<header
			data-orders-reveal
			className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2"
		>
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<h1
						id="orders-page-title"
						className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
					>
						Órdenes de Trabajo
					</h1>
					{!isLoading && (
						<span className="inline-flex items-center rounded-full bg-[var(--color-cermont-blue-bg)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-brand)] font-mono">
							{total}
						</span>
					)}
				</div>
				<p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">
					{isLoading
						? "Consultando disponibilidad operativa..."
						: "Listado maestro de intervenciones técnicas en campo."}
				</p>
			</div>

			<div className="flex items-center gap-3">
				<Button
					asChild
					variant="secondary"
					size="sm"
					className="hidden sm:inline-flex border-[var(--border-medium)]"
				>
					<Link href="/orders/kanban">
						<LayoutGrid className="size-4" aria-hidden="true" />
						Visualización Kanban
					</Link>
				</Button>
				<Button asChild variant="primary" size="sm" className="shadow-lg px-5">
					<Link href="/orders/new">
						<Plus className="size-4.5" aria-hidden="true" />
						Nueva OT
					</Link>
				</Button>
			</div>
		</header>
	);
}
