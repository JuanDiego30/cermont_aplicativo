"use client";

import Link from "next/link";
import { Button } from "@/core/ui/Button";

export function CtaSection() {
	return (
		<section data-landing-section aria-labelledby="cta-title" className="relative overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.06))]" />
			<div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-20 text-center lg:px-8">
				<h2 id="cta-title" className="text-3xl font-bold tracking-tight text-text-primary">
					Accede a tu plataforma
				</h2>
				<p className="max-w-lg text-lg text-text-secondary">
					Gestiona órdenes, evidencias, costos y cumplimiento HSE desde cualquier lugar con o sin
					conexión.
				</p>
				<div className="flex flex-wrap items-center justify-center gap-4">
					<Button asChild size="lg" className="rounded-lg">
						<Link href="/login">Iniciar sesión</Link>
					</Button>
					<Link
						href="/#contacto"
						className="inline-flex items-center rounded-lg border border-border-default bg-surface-primary px-6 py-3 text-sm font-semibold text-text-primary shadow-1 transition-colors hover:bg-surface-secondary"
					>
						Solicitar acceso
					</Link>
				</div>
			</div>
		</section>
	);
}
