export function AuthBackgroundBlobs() {
	return (
		<div
			role="presentation"
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 overflow-hidden"
		>
			<div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[var(--color-brand-blue)]/20 blur-3xl" />
			<div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[var(--color-brand-blue)]/20 blur-3xl" />
			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[var(--color-brand-blue)]/10 blur-3xl" />
		</div>
	);
}
