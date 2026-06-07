import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Acceso no autorizado | Cermont",
	robots: {
		index: false,
		follow: false,
	},
};

export default function UnauthorizedPage() {
	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<section className="motion-panel flex flex-col items-center gap-6 text-center">
				<header className="flex flex-col items-center gap-2">
					<p className="text-7xl font-extrabold text-[var(--color-danger)]" aria-hidden="true">
						403
					</p>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
						Acceso no autorizado
					</h1>
					<p className="max-w-sm text-sm text-[var(--text-secondary)]">
						No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta
						al administrador del sistema.
					</p>
				</header>
				<footer className="flex flex-wrap justify-center gap-3">
					<Link
						href="/"
						className="motion-button rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-blue-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
					>
						Ir al inicio
					</Link>
					<Link
						href="/login"
						className="motion-button rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
					>
						Iniciar sesión
					</Link>
				</footer>
			</section>
		</main>
	);
}
