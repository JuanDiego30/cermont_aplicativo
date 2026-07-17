import { ArrowLeft, Plug } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";

export default function NewErpConnectorPage() {
	return (
		<main className="mx-auto flex max-w-2xl flex-col gap-6 p-6" aria-labelledby="erp-new-title">
			<Link
				href={APP_ROUTES.erpConnectors}
				className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-3 text-sm font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a conectores
			</Link>

			<section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 text-center shadow-sm">
				<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]">
					<Plug className="size-6" aria-hidden="true" />
				</div>
				<h1 id="erp-new-title" className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
					Nuevo conector ERP
				</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Módulo en construcción. La configuración de nuevos conectores estará disponible próximamente.
				</p>
			</section>
		</main>
	);
}
