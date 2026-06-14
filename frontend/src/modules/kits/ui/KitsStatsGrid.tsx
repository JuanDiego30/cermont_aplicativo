interface KitsStatsGridProps {
	total: number;
	active: number;
	drafts: number;
	archived: number;
}

export function KitsStatsGrid({ total, active, drafts, archived }: KitsStatsGridProps) {
	const stats = [
		{ label: "Total", value: total, style: "" },
		{ label: "Activos", value: active, style: "text-[var(--color-success)]" },
		{ label: "Borradores", value: drafts, style: "text-[var(--color-warning)]" },
		{ label: "Archivados", value: archived, style: "text-[var(--text-tertiary)]" },
	];

	return (
		<section aria-label="Resumen" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{stats.map((stat) => (
				<article
					key={stat.label}
					className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)]"
				>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
						{stat.label}
					</p>
					<p
						className={`mt-2 text-3xl font-semibold ${stat.style || "text-[var(--text-primary)]"}`}
					>
						{stat.value}
					</p>
				</article>
			))}
		</section>
	);
}
