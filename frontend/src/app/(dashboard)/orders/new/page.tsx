import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateOrderForm } from "@/modules/orders/ui/CreateOrderForm";

type NewOrderPageProps = {
	searchParams: Promise<Record<string, string | string[]>>;
};

function readParam(params: Record<string, string | string[]>, key: string): string {
	const value = params[key];
	return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function NewOrderPage({ searchParams }: NewOrderPageProps) {
	const params = await searchParams;
	const serviceCaseId = readParam(params, "serviceCaseId");
	const workRequestId = readParam(params, "workRequestId");
	const proposalId = readParam(params, "proposalId");
	const hasContext = Boolean(serviceCaseId || workRequestId || proposalId);

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-order-title">
			<div className="flex items-center gap-3">
				<Link
					href="/orders"
					className="flex items-center gap-1 text-sm text-steel dark:text-stone hover:text-charcoal"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver
				</Link>
				<h1 id="new-order-title" className="text-2xl font-semibold text-ink dark:text-white">
					Nueva Orden de Trabajo
				</h1>
			</div>

			{hasContext ? (
				<CreateOrderForm
					proposalId={proposalId}
					serviceCaseId={serviceCaseId}
					workRequestId={workRequestId}
				/>
			) : (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">
						Primero cree o seleccione un caso de servicio.
					</h2>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">
						La orden de trabajo debe partir de una solicitud, propuesta aprobada o cockpit del caso.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<Link
							href="/service-cases"
							className="rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white"
						>
							Abrir cockpit
						</Link>
						<Link
							href="/work-requests/new"
							className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
						>
							Nueva solicitud
						</Link>
					</div>
				</div>
			)}
		</section>
	);
}
