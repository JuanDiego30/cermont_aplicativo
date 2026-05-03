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
		<main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4 py-10 text-[var(--text-primary)]">
			<section className="flex max-w-md flex-col items-center gap-6 text-center">
				<header className="flex flex-col items-center gap-2">
					<p className="text-7xl font-extrabold text-[var(--color-danger)]" aria-hidden="true">
						403
					</p>
					<h1 className="text-2xl font-bold text-[var(--text-primary)]">Acceso no autorizado</h1>
					<p className="max-w-sm text-sm text-[var(--text-secondary)]">
						No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta
						al administrador del sistema.
					</p>
				</header>
				<footer className="flex flex-wrap justify-center gap-3">
					<Link
						href="/"
						className="rounded-lg bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-medium text-[var(--text-inverse)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-brand-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue)]/20 active:scale-[0.97]"
					>
						Ir al inicio
					</Link>
					<Link
						href="/login"
						className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue)]/20 active:scale-[0.97]"
					>
						Iniciar sesión
					</Link>
				</footer>
			</section>
		</main>
	);
}
