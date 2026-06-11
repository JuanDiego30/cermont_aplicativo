import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-[var(--surface-page)]">
			<header className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-1)]">
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-blue)] text-sm font-bold text-white">
							C
						</div>
						<span className="text-sm font-semibold text-[var(--text-primary)]">Portal Cliente</span>
					</div>
					<div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
						<a
							href="/portal"
							className="font-medium text-[var(--color-brand-blue)] hover:underline"
						>
							Inicio
						</a>
						<a href="/portal/orders" className="hover:text-[var(--text-primary)]">
							Órdenes
						</a>
						<a href="/portal/invoices" className="hover:text-[var(--text-primary)]">
							Facturas
						</a>
						<a href="/portal/proposals" className="hover:text-[var(--text-primary)]">
							Propuestas
						</a>
						<a href="/logout" className="ml-4 text-[var(--color-danger)] hover:underline">
							Salir
						</a>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
		</div>
	);
}
