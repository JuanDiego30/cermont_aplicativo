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
			<section className="flex flex-col items-center gap-6 text-center">
				<header className="flex flex-col items-center gap-2">
					<p className="text-7xl font-extrabold text-red-500 dark:text-red-400" aria-hidden="true">
						403
					</p>
					<h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
						Acceso no autorizado
					</h1>
					<p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
						No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta
						al administrador del sistema.
					</p>
				</header>
				<footer className="flex flex-wrap justify-center gap-3">
					<Link
						href="/"
						className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
					>
						Ir al inicio
					</Link>
					<Link
						href="/login"
						className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950"
					>
						Iniciar sesión
					</Link>
				</footer>
			</section>
		</main>
	);
}
