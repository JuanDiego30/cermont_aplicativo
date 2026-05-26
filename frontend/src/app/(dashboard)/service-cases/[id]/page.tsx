"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { ServiceCaseWorkflowCockpit } from "@/modules/service-cases/components/ServiceCaseWorkflowCockpit";
import { useAdvanceServiceCaseStep, useServiceCase } from "@/modules/service-cases/queries";

export default function ServiceCaseDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<ServiceCaseDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando caso">
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
		</section>
	);
}

function ServiceCaseDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useServiceCase(id);
	const sc = envelope?.data;
	const advance = useAdvanceServiceCaseStep(id);

	return (
		<section className="space-y-6" aria-labelledby="sc-detail-title">
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver al Dashboard
			</Link>
			{isLoading && (
				<div className="flex items-center justify-center py-16" role="status">
					<Loader2 className="size-7 animate-spin text-[var(--color-brand)]" aria-hidden="true" />
					<span className="sr-only">Cargando caso</span>
				</div>
			)}
			{isError && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar el caso
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Ocurrió un error al obtener los datos.
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
					>
						Reintentar
					</button>
				</div>
			)}
			{!isLoading && !isError && !sc && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">Caso no encontrado</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El identificador no corresponde a ningún caso registrado.
					</p>
				</div>
			)}
			{sc ? (
				<ServiceCaseWorkflowCockpit
					serviceCase={sc}
					onAdvance={() => advance.mutate()}
					isAdvancing={advance.isPending}
				/>
			) : null}
		</section>
	);
}
