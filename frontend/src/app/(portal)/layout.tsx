import Link from "next/link";
import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-[var(--surface-page)]">
			<header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-1)]">
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-blue)] text-sm font-bold text-white">
							C
						</div>
						<span className="text-sm font-semibold text-[var(--text-primary)]">Portal Cliente</span>
					</div>
					<div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
						<Link
							href="/portal"
							className="font-medium text-[var(--color-brand-blue)] hover:underline"
						>
							Inicio
						</Link>
						<Link href="/portal/orders" className="hover:text-[var(--text-primary)]">
							Órdenes
						</Link>
						<Link href="/portal/invoices" className="hover:text-[var(--text-primary)]">
							Facturas
						</Link>
						<Link href="/portal/proposals" className="hover:text-[var(--text-primary)]">
							Propuestas
						</Link>
						<form action="/api/auth/logout" method="POST" className="ml-4">
							<button type="submit" className="text-[var(--color-danger)] hover:underline">
								Salir
							</button>
						</form>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
		</div>
	);
}
