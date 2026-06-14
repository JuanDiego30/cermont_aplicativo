import type { LucideIcon } from "lucide-react";

interface KitItem {
	id?: string;
	name: string;
	quantity?: number;
	unit?: string;
	description?: string;
	isCritical?: boolean;
	isOptional?: boolean;
}

interface KitItemSectionCardProps {
	label: string;
	items: KitItem[];
	icon: LucideIcon;
}

export function KitItemSectionCard({ label, items, icon: Icon }: KitItemSectionCardProps) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5">
			<div className="flex items-center gap-3">
				<Icon className="size-5 text-[var(--color-brand)]" />
				<div>
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">{label}</h2>
					<p className="text-sm text-[var(--text-secondary)]">
						{items.length} ítem(s) configurado(s)
					</p>
				</div>
			</div>

			<div className="mt-4 space-y-2">
				{items.map((item) => (
					<article
						key={item.id ?? item.name}
						className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3"
					>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-[var(--text-primary)]">{item.name}</p>
							{item.description ? (
								<p className="text-xs text-[var(--text-tertiary)]">{item.description}</p>
							) : null}
						</div>
						<div className="flex shrink-0 items-center gap-3 text-xs">
							{item.quantity != null ? (
								<span className="font-semibold text-[var(--text-secondary)]">
									{item.quantity} {item.unit}
								</span>
							) : null}
							{item.isCritical ? (
								<span className="rounded-[var(--radius-full)] bg-[var(--color-danger-bg)] px-2 py-0.5 font-semibold text-[var(--color-danger)]">
									Crítico
								</span>
							) : null}
							{item.isOptional ? (
								<span className="rounded-[var(--radius-full)] bg-[var(--surface-secondary)] px-2 py-0.5 text-[var(--text-tertiary)]">
									Opcional
								</span>
							) : null}
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
