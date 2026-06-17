"use client";

import {
	CERMONT_OPERATIONAL_STEPS,
	mapLegacyServiceCaseStageToStep,
	type ServiceCase,
} from "@cermont/shared-types";
import {
	AlertTriangle,
	ArrowRight,
	FileText,
	Loader2,
	ShieldAlert,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/core/ui/EmptyState";
import { useServiceCaseList } from "@/modules/service-cases/queries";

const TOTAL_CERMONT_STEPS = CERMONT_OPERATIONAL_STEPS.length;

function resolveCurrentStep(serviceCase: ServiceCase) {
	const stepCode =
		serviceCase.currentStepCode ?? mapLegacyServiceCaseStageToStep(serviceCase.currentStage);
	return (
		CERMONT_OPERATIONAL_STEPS.find((step) => step.code === stepCode) ?? CERMONT_OPERATIONAL_STEPS[0]
	);
}

function resolveCompletedSteps(serviceCase: ServiceCase, currentStepNumber: number): number {
	const completedFromChecklist =
		serviceCase.stepsChecklist?.filter((step) => step.status === "completed").length ?? 0;

	return completedFromChecklist > 0 ? completedFromChecklist : Math.max(currentStepNumber - 1, 0);
}

function resolvePendingRequirementCount(serviceCase: ServiceCase): number {
	const activeRequirements = serviceCase.currentStepRequirements ?? [];
	const pendingRequirements = activeRequirements.filter(
		(requirement) => requirement.status !== "satisfied" && requirement.status !== "not_applicable",
	);

	if (pendingRequirements.length > 0) {
		return pendingRequirements.length;
	}

	const currentStep = resolveCurrentStep(serviceCase);
	return currentStep.requiredDocuments.length + currentStep.requiredEvidences.length;
}

function resolveNextAction(serviceCase: ServiceCase): string {
	const currentStep = resolveCurrentStep(serviceCase);
	return serviceCase.nextActions?.[0]?.label ?? currentStep.nextAction;
}

function resolveOwner(serviceCase: ServiceCase): string {
	return (
		serviceCase.nextActions?.[0]?.requiredRole ??
		serviceCase.operationalSummary?.currentOwnerRole ??
		"Responsable por definir"
	);
}

function resolveCostStatus(serviceCase: ServiceCase): string {
	if (serviceCase.financialSummary?.status === "complete") {
		return "Costos completos";
	}
	if (serviceCase.financialSummary?.status === "not_available") {
		return "Sin costos registrados";
	}
	return "Costos pendientes";
}

function ServiceCaseCard({ serviceCase }: { serviceCase: ServiceCase }) {
	const currentStep = resolveCurrentStep(serviceCase);
	const completedSteps = resolveCompletedSteps(serviceCase, currentStep.stepNumber);
	const progressPercentage = Math.round((completedSteps / TOTAL_CERMONT_STEPS) * 100);
	const blockersCount = serviceCase.blockers?.length ?? 0;
	const pendingRequirementCount = resolvePendingRequirementCount(serviceCase);
	const evidenceCount = serviceCase.operationalSummary?.evidenceCount;

	return (
		<article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-2)]">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-blue)]">
						{serviceCase.code}
					</p>
					<h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
						{serviceCase.clientName}
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Paso {currentStep.stepNumber}: {currentStep.label}
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
					{blockersCount > 0 ? (
						<>
							<AlertTriangle className="size-3.5 text-[var(--color-warning)]" />
							{blockersCount} bloqueadores
						</>
					) : (
						<>Sin bloqueadores</>
					)}
				</div>
			</div>

			<div className="mt-5">
				<div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
					<span>Progreso del flujo</span>
					<span>
						{completedSteps}/{TOTAL_CERMONT_STEPS}
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
					<div
						className="h-full rounded-full bg-[var(--color-brand-blue)]"
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>
			</div>

			<div className="mt-5 grid gap-3 md:grid-cols-3">
				<ServiceCaseMetric
					icon={ShieldAlert}
					label="Requisitos pendientes"
					value={String(pendingRequirementCount)}
				/>
				<ServiceCaseMetric
					icon={FileText}
					label="Evidencias"
					value={typeof evidenceCount === "number" ? String(evidenceCount) : "Por asociar"}
				/>
				<ServiceCaseMetric
					icon={TrendingUp}
					label="Costos"
					value={resolveCostStatus(serviceCase)}
				/>
			</div>

			<div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
				<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
					Próxima acción
				</p>
				<p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
					{resolveNextAction(serviceCase)}
				</p>
				<p className="mt-1 text-xs text-[var(--text-secondary)]">
					Responsable: {resolveOwner(serviceCase)}
				</p>
			</div>

			<div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
				<Link
					href={`/service-cases/${serviceCase._id}`}
					className="inline-flex items-center gap-1 font-medium text-[var(--color-brand)]"
				>
					Abrir cockpit
					<ArrowRight className="size-4" />
				</Link>
				<Link
					href={`/service-cases/${serviceCase._id}`}
					className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-3 py-2 font-semibold text-white shadow-[var(--shadow-brand)]"
				>
					Continuar siguiente paso
					<ArrowRight className="size-4" />
				</Link>
			</div>
		</article>
	);
}

function ServiceCaseMetric({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof ShieldAlert;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3">
			<div className="flex items-center gap-2">
				<Icon className="size-4 text-[var(--color-brand)]" />
				<p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
					{label}
				</p>
			</div>
			<p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
		</div>
	);
}

function ServiceCasesList() {
	const { data, isLoading, error } = useServiceCaseList();
	const isOfflineSnapshot = data?.source.status === "offline_snapshot";
	const isOfflineEmpty = data?.source.status === "offline_empty";

	if (isLoading) {
		return (
			<output className="flex items-center justify-center py-24" aria-live="polite">
				<Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
				<span className="sr-only">Cargando casos…</span>
			</output>
		);
	}

	if (error) {
		return (
			<EmptyState
				icon="service-cases"
				title="Error al cargar casos"
				description="No se pudo construir el cockpit de casos de servicio."
			/>
		);
	}

	if (!data || data.items.length === 0) {
		return (
			<EmptyState
				icon="service-cases"
				title={isOfflineEmpty ? "Sin casos guardados localmente" : "Sin casos de servicio"}
				description={
					isOfflineEmpty
						? "Este dispositivo todavía no tiene casos sincronizados para trabajar sin conexión."
						: "Aún no hay casos proyectados en el cockpit. Revise la conversión desde solicitudes, propuestas y órdenes."
				}
			/>
		);
	}

	return (
		<section className="space-y-4" aria-label="Casos de servicio">
			{isOfflineSnapshot ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--text-primary)]">
					Mostrando casos guardados localmente. Última actualización:{" "}
					{new Date(data.source.updatedAt).toLocaleString("es-CO")}
				</div>
			) : (
				false
			)}
			<div className="grid gap-4 lg:grid-cols-2">
				{data.items.map((serviceCase) => (
					<ServiceCaseCard key={serviceCase._id} serviceCase={serviceCase} />
				))}
			</div>
		</section>
	);
}

export default function ServiceCasesPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-primary">Casos de Servicio</h1>
				<p className="mt-1 text-sm text-secondary">
					Caso → 14 pasos → documentos → evidencias → bloqueadores → costos → cierre
				</p>
			</div>
			<ServiceCasesList />
		</div>
	);
}
