import { RefreshCw, ShieldAlert, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/core/ui/Logo";

export const metadata: Metadata = {
	title: "Sin conexión | Cermont",
	description: "Pantalla de respaldo para cuando la conexión no está disponible.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function OfflinePage() {
	return (
		<main className="relative min-h-dvh overflow-hidden bg-slate-50 text-slate-950">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.16_250_/_0.22),transparent_36%),radial-gradient(circle_at_bottom_right,oklch(0.78_0.15_150_/_0.18),transparent_30%),linear-gradient(180deg,oklch(0.97_0.01_250)_0%,oklch(0.92_0.03_230)_100%)]"
			/>

			<div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-12">
				<section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
					<div className="flex flex-col justify-center gap-6">
						<Logo href="/" className="text-slate-900" wordmarkClassName="text-slate-900" />

						<div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
							<WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
							Modo offline
						</div>

						<header className="space-y-4">
							<h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
								Sin conexión temporal
							</h1>
							<p className="max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
								La aplicación quedó disponible sin red. Cuando la conexión vuelva, podrás seguir
								navegando y la cola offline se sincronizará automáticamente.
							</p>
						</header>

						<nav aria-label="Offline recovery actions" className="flex flex-wrap gap-3">
							<Link
								href="/login"
								className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-blue-light)] px-5 py-3 text-sm font-semibold text-[var(--text-inverse)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-brand-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue-light)]/30 active:scale-[0.97]"
							>
								Ir al inicio de sesión
							</Link>
							<Link
								href="/"
								className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue-light)]/30 active:scale-[0.97]"
							>
								Volver al inicio
							</Link>
						</nav>
					</div>

					<aside aria-label="Offline recovery details" className="flex items-center justify-center">
						<div className="w-full max-w-xl rounded-4xl border border-slate-200 bg-white/85 p-6 shadow-[0_24px_80px_oklch(0.3_0.03_240_/_0.22)] backdrop-blur sm:p-8">
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
									<ShieldAlert className="h-7 w-7" aria-hidden="true" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-950">Respaldo PWA</p>
									<p className="text-sm text-slate-700">
										Conserva el estado de trabajo y espera la reconexión.
									</p>
								</div>
							</div>

							<ul aria-label="Offline capabilities" className="mt-8 grid gap-4 sm:grid-cols-2">
								<li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
									<p className="text-sm font-semibold text-slate-900">Sincronización</p>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										Las acciones pendientes se reintentarán cuando la conexión vuelva a estar
										disponible.
									</p>
								</li>
								<li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
									<p className="text-sm font-semibold text-slate-900">Sesión</p>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										Tu sesión se conservará mientras el navegador mantenga el estado actual.
									</p>
								</li>
							</ul>

							<div className="mt-8 flex items-center gap-3 text-sm text-slate-700">
								<RefreshCw className="h-4 w-4" aria-hidden="true" />
								Vuelve a cargar la página cuando recuperes conexión.
							</div>
						</div>
					</aside>
				</section>
			</div>
		</main>
	);
}
