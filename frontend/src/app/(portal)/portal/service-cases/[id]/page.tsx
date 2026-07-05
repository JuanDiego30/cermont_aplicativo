"use client";

import { use } from "react";

interface Props {
	params: Promise<{ id: string }>;
}

export default function PortalServiceCaseDetailPage({ params }: Props) {
	const { id } = use(params);

	return (
		<div className="p-4 md:p-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Detalle de la orden</h1>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">Código: SC-{id.slice(-8)}</p>

			<div className="mt-6 grid gap-4 md:grid-cols-2">
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
					<h2 className="text-sm font-semibold text-[var(--text-secondary)]">Estado actual</h2>
					<span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
						En ejecución
					</span>
				</div>

				<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
					<h2 className="text-sm font-semibold text-[var(--text-secondary)]">Documentos</h2>
					<ul className="mt-2 space-y-1 text-sm">
						<li>
							<a
								href="/portal/service-cases/[id]/documents/propuesta"
								className="text-[var(--color-brand-blue)] hover:underline"
							>
								Propuesta comercial
							</a>
						</li>
						<li>
							<a
								href="/portal/service-cases/[id]/documents/orden-compra"
								className="text-[var(--color-brand-blue)] hover:underline"
							>
								Orden de compra
							</a>
						</li>
						<li>
							<a
								href="/portal/service-cases/[id]/documents/acta-entrega"
								className="text-[var(--color-brand-blue)] hover:underline"
							>
								Acta de entrega
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
