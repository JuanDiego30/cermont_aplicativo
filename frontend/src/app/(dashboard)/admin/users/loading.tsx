export default function AdminUsersLoading() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status">
			<div
				className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-slate-200 border-t-rose-600"
				aria-hidden="true"
			/>
			<p className="text-sm text-slate-500">Cargando usuarios…</p>
		</div>
	);
}
