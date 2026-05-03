import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Página no encontrada",
};

export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<section className="flex flex-col items-center gap-6 text-center">
				<header className="flex flex-col items-center gap-2">
					<p
						className="text-7xl font-extrabold text-primary-600 dark:text-primary-400"
						aria-hidden="true"
					>
						404
					</p>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
						Página no encontrada
					</h1>
					<p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
						La página que buscas no existe o fue movida. Verifica la dirección e intenta nuevamente.
					</p>
				</header>
				<footer>
					<a
						href="/"
						className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
					>
						Volver al inicio
					</a>
				</footer>
			</section>
		</main>
	);
}
