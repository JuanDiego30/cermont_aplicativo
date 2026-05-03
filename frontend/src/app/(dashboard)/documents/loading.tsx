export default function DocumentsLoading() {
	return (
		<section className="space-y-4" aria-busy="true" aria-labelledby="documents-loading-title">
			<h1 id="documents-loading-title" className="sr-only">
				Cargando documentos
			</h1>

			<div className="h-24 rounded-2xl bg-slate-100 motion-safe:animate-pulse" aria-hidden="true" />
			<div className="h-16 rounded-2xl bg-slate-100 motion-safe:animate-pulse" aria-hidden="true" />
			<div className="h-64 rounded-2xl bg-slate-100 motion-safe:animate-pulse" aria-hidden="true" />
		</section>
	);
}
