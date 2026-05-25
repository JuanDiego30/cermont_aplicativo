export function AuthBackgroundBlobs() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
			<div className="absolute -left-32 -top-32 size-64 rounded-full bg-primary-600/20 blur-3xl" />
			<div className="absolute -bottom-32 -right-32 size-64 rounded-full bg-primary-600/20 blur-3xl" />
			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary-600/10 blur-3xl" />
		</div>
	);
}
