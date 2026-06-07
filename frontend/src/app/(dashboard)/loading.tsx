export default function DashboardLoading() {
	return (
		<div
			className="motion-panel flex min-h-[60vh] flex-col items-center justify-center gap-4"
			aria-live="polite"
		>
			<div
				className="size-10 animate-spin rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--color-brand)]"
				aria-hidden="true"
			/>
			<p className="text-sm text-[var(--text-secondary)]">Cargando…</p>
		</div>
	);
}
