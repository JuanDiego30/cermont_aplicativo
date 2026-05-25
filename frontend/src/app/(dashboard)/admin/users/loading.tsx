export default function AdminUsersLoading() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status">
			<div
				className="size-10 motion-safe:animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600"
				aria-hidden="true"
			/>
			<p className="text-sm text-zinc-500">Cargando usuarios…</p>
		</div>
	);
}
