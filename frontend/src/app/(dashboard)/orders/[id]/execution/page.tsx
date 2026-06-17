"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import {
	useCreateExecutionSessionForOrder,
	useExecutionSessionByOrder,
} from "@/modules/execution/queries";

type OrderExecutionPageProps = {
	params: Promise<{ id: string }>;
};

export default function OrderExecutionPage({ params }: OrderExecutionPageProps) {
	const { id } = use(params);
	const executionQuery = useExecutionSessionByOrder(id);
	const createMutation = useCreateExecutionSessionForOrder(id);
	const session = executionQuery.data;
	const sessionId = session?._id ?? session?.id ?? "";

	if (executionQuery.isLoading) {
		return (
			<output className="flex items-center justify-center py-24" aria-live="polite">
				<Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
				<span className="sr-only">Cargando ejecución de la orden</span>
			</output>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="order-execution-title">
			<Link
				href={`/orders/${id}`}
				className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a la orden
			</Link>

			<header className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
				<p className="text-sm font-medium text-[var(--color-brand)]">Orden / Ejecucion</p>
				<h1
					id="order-execution-title"
					className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
				>
					Sesion de ejecucion
				</h1>
				<p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
					La sesion conecta planeacion aprobada, evidencias, formularios dinamicos y cierre tecnico
					de la orden.
				</p>
			</header>

			{session ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="font-mono text-sm text-[var(--text-tertiary)]">{session.code}</p>
							<h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
								Estado {session.status}
							</h2>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								{session.evidenceIds.length + session.evidences.length} evidencias ·{" "}
								{session.laborEntries.length} registros de mano de obra
							</p>
						</div>
						<Button asChild>
							<Link href={sessionId ? `/execution/${sessionId}` : "/execution"}>
								Abrir sesion
								<ArrowRight aria-hidden="true" />
							</Link>
						</Button>
					</div>
				</div>
			) : (
				<EmptyState
					icon={PlayCircle}
					title="Sin sesion creada"
					description="Crea la sesion cuando la orden tenga planeacion aprobada y este lista para campo."
					action={{
						label: createMutation.isPending ? "Creando..." : "Crear sesion",
						onClick: () => createMutation.mutate(),
					}}
				/>
			)}

			{executionQuery.isError || createMutation.isError ? (
				<div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm text-brand-warn">
					<div className="flex gap-2">
						<AlertTriangle className="mt-0.5 size-4" aria-hidden="true" />
						<span>
							No hay sesion disponible o el backend rechazo la creacion. Verifica que la planeacion
							este aprobada.
						</span>
					</div>
				</div>
			) : null}
		</section>
	);
}
