"use client";

import { X } from "lucide-react";
import { Button } from "@/core/ui/Button";

interface OrdersPageSelectionBarProps {
	selectedCount: number;
	allSelected: boolean;
	onToggleAll: () => void;
	onClearSelection: () => void;
}

export function OrdersPageSelectionBar({
	selectedCount,
	allSelected,
	onToggleAll,
	onClearSelection,
}: OrdersPageSelectionBarProps) {
	if (selectedCount <= 0) {
		return null;
	}

	return (
		<div
			data-orders-reveal
			className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)]/40 px-6 py-3.5 shadow-sm animate-in fade-in slide-in-from-top-2"
		>
			<div className="flex items-center gap-3">
				<div className="flex size-6 items-center justify-center rounded-full bg-[var(--color-brand)] text-white text-[10px] font-bold">
					{selectedCount}
				</div>
				<p className="text-sm font-semibold text-[var(--color-brand-strong)]">
					Orden{selectedCount > 1 ? "es" : ""} seleccionada{selectedCount > 1 ? "s" : ""} para
					acciones en lote
				</p>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={onToggleAll}
					className="bg-white/50 border-[var(--color-brand)]/20 text-[var(--color-brand)] hover:bg-white"
				>
					{allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
				</Button>
				<Button variant="primary" size="sm" onClick={onClearSelection} className="px-4">
					<X className="size-3.5 mr-1" />
					Limpiar
				</Button>
			</div>
		</div>
	);
}
