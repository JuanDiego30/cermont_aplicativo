interface KitMetadataCardProps {
	label: string;
	value: string;
}

export function KitMetadataCard({ label, value }: KitMetadataCardProps) {
	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-card)]">
			<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
				{label}
			</p>
			<p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
		</article>
	);
}
