"use client";

import { X } from "lucide-react";

interface FilterBadge {
	key: string;
	label: string;
}

interface OrderFilterBadgesProps {
	badges: FilterBadge[];
	onRemove: (key: string) => void;
	onClearAll: () => void;
}

export function OrderFilterBadges({ badges, onRemove, onClearAll }: OrderFilterBadgesProps) {
	if (badges.length === 0) {
		return null;
	}

	return (
		<fieldset className="flex flex-wrap items-center gap-2">
			<legend className="sr-only">Filtros activos</legend>
			{badges.map((badge) => (
				<button
					key={badge.key}
					type="button"
					onClick={() => onRemove(badge.key)}
					className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--color-brand-blue)]/20 bg-[var(--color-info-bg)] px-3 text-xs font-semibold text-[var(--color-brand-blue)]"
				>
					{badge.label}
					<X className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			))}
			<button
				type="button"
				onClick={onClearAll}
				className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
			>
				Limpiar
			</button>
		</fieldset>
	);
}
