export default function CostsLoading() {
	return (
		<div
			className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
			aria-live="polite"
		>
			<div
				className="size-10 motion-safe:animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600"
				aria-hidden="true"
			/>
			<p className="text-sm text-zinc-500">Cargando costos…</p>
		</div>
	);
}
