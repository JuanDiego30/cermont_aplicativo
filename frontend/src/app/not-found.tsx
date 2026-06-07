import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Página no encontrada",
};

export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<section className="motion-panel flex flex-col items-center gap-6 text-center">
				<header className="flex flex-col items-center gap-2">
					<p className="text-7xl font-extrabold text-[var(--color-brand)]" aria-hidden="true">
						404
					</p>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
						Página no encontrada
					</h1>
					<p className="max-w-sm text-sm text-[var(--text-secondary)]">
						La página que buscas no existe o fue movida. Verifica la dirección e intenta nuevamente.
					</p>
				</header>
				<footer>
					<Link
						href="/"
						className="motion-button rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-blue-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
					>
						Volver al inicio
					</Link>
				</footer>
			</section>
		</main>
	);
}
