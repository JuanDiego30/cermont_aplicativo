"use client";

import type {
	DomainBlocker,
	ResolvedStepRequirement,
	ServiceCaseOperationalStep,
} from "@cermont/shared-types";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	ClipboardList,
	FileText,
	ImageIcon,
	PenSquare,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePermissions } from "../../core/hooks/usePermissions";

interface StepRequirementPanelProps {
	blockers: DomainBlocker[];
	canAdvance: boolean;
	isAdvancing?: boolean;
	onAdvance?: () => void;
	requirements: ResolvedStepRequirement[];
	showBlockers?: boolean;
	step: ServiceCaseOperationalStep;
}

const REQUIREMENT_SECTIONS: Array<{
	icon: typeof FileText;
	label: string;
	type: ResolvedStepRequirement["type"];
}> = [
	{ type: "document", label: "Documentos obligatorios", icon: FileText },
	{ type: "evidence", label: "Evidencias requeridas", icon: ImageIcon },
	{ type: "signature", label: "Firmas requeridas", icon: PenSquare },
	{ type: "template_response", label: "Formularios dinámicos", icon: ClipboardList },
	{ type: "approval", label: "Validaciones del paso", icon: AlertCircle },
];

function humanizeStatus(status: ResolvedStepRequirement["status"]): string {
	switch (status) {
		case "satisfied":
			return "Completo";
		case "warning":
			return "Advertencia";
		case "pending":
			return "Pendiente";
		case "not_applicable":
			return "No aplica";
		default:
			return "Faltante";
	}
}

function RequirementRow({ requirement }: { requirement: ResolvedStepRequirement }) {
	const isResolved = requirement.status === "satisfied";
	return (
		<li className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-2">
					{isResolved ? (
						<CheckCircle className="mt-0.5 size-4 text-[var(--color-success)]" />
					) : (
						<div className="mt-1 size-2 rounded-full bg-[var(--color-warning)]" />
					)}
					<div>
						<p className="text-xs font-semibold text-[var(--text-primary)]">{requirement.label}</p>
						{requirement.blockerMessage && (
							<p className="mt-1 text-[11px] text-[var(--text-secondary)]">
								{requirement.blockerMessage}
							</p>
						)}
						{requirement.recommendedAction && !isResolved && (
							<p className="mt-2 text-[10px] font-medium text-[var(--color-brand)]">
								Acción sugerida: {requirement.recommendedAction}
							</p>
						)}
						{!isResolved && requirement.blocksTransition && (
							<p className="mt-1 text-[10px] font-bold uppercase text-[var(--color-warning)]">
								Bloquea avance de paso
							</p>
						)}
					</div>
				</div>
				<span
					className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
						isResolved
							? "border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
							: "border-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
					}`}
				>
					{humanizeStatus(requirement.status)}
				</span>
			</div>
		</li>
	);
}

export function StepRequirementPanel({
	blockers,
	canAdvance,
	isAdvancing,
	onAdvance,
	requirements,
	showBlockers = true,
	step,
}: StepRequirementPanelProps) {
	const { user } = useAuth();
	const { hasRoleLevel } = usePermissions({ userRole: user?.role });
	const canUserAdvance = hasRoleLevel(4);

	return (
		<div className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
						<AlertCircle className="size-4 text-[var(--color-warning)]" />
						Requisitos del Paso {step.stepNumber}
					</h3>
					<p className="mt-1 text-xs text-[var(--text-secondary)]">{step.description}</p>
				</div>
				<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
					{step.phase === "operational" ? "Fase Operativa" : "Fase Administrativa"}
				</span>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				{REQUIREMENT_SECTIONS.map(({ icon: Icon, label, type }) => {
					const sectionRequirements = requirements.filter(
						(requirement) => requirement.type === type,
					);
					if (sectionRequirements.length === 0) {
						return null;
					}

					return (
						<section key={type} className="space-y-2.5">
							<p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
								<Icon className="size-3.5" />
								{label}
							</p>
							<ul className="space-y-2">
								{sectionRequirements.map((requirement) => (
									<RequirementRow key={requirement.id} requirement={requirement} />
								))}
							</ul>
						</section>
					);
				})}
			</div>

			{showBlockers ? (
				blockers.length > 0 ? (
					<section className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] p-4">
						<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-warning)]">
							Bloqueadores activos ({blockers.length})
						</p>
						<ul className="space-y-2">
							{blockers.map((blocker) => (
								<li
									key={`${blocker.code}-${blocker.field || blocker.artifactType}`}
									className="rounded-md border border-[var(--color-warning)]/30 bg-canvas/60 p-3 text-xs"
								>
									<p className="font-semibold text-[var(--text-primary)]">{blocker.message}</p>
									<p className="mt-1 text-[11px] text-[var(--text-secondary)]">
										Responsable: {blocker.ownerRole} · {blocker.recommendedAction}
									</p>
								</li>
							))}
						</ul>
					</section>
				) : (
					<div className="rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] px-4 py-3 text-xs text-[var(--color-success)]">
						El paso actual no tiene bloqueadores activos.
					</div>
				)
			) : null}

			<div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
				<p className="max-w-[60%] text-[11px] text-[var(--text-muted)]">
					Próxima acción:{" "}
					<span className="font-medium italic text-[var(--text-primary)]">{step.nextAction}</span>
				</p>
				{step.stepNumber < 14 ? (
					<button
						type="button"
						className="rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-40"
						disabled={!canAdvance || !canUserAdvance || isAdvancing}
						onClick={onAdvance}
					>
						{isAdvancing ? "Avanzando..." : `Avanzar al Paso ${step.stepNumber + 1}`}
						{!isAdvancing && <ArrowRight className="ml-2 inline size-3.5" />}
					</button>
				) : (
					<span className="rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] px-4 py-1.5 text-xs font-bold text-[var(--color-success)]">
						{canAdvance ? "Cierre definitivo habilitado" : "Complete pago y soportes"}
					</span>
				)}
			</div>
		</div>
	);
}
