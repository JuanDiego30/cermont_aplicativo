"use client";

import type {
	CrewMember,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningResponsible,
	PlanningTool,
	SupportDocument,
	WorkerRequirements,
} from "@cermont/shared-types";
import {
	AlertTriangle,
	CheckCircle2,
	ClipboardList,
	Loader2,
	ShieldCheck,
	ThumbsUp,
	XCircle,
} from "lucide-react";
import type { ReadinessCheck } from "../helpers/readiness-helpers";
import { computeReadiness } from "../helpers/readiness-helpers";
import { localeDate } from "@/lib/utils/format-date";

interface RequiredCertification {
	certificationId?: string;
	name: string;
	requiredForRoles?: string[];
	verified?: boolean;
	expiresAt?: string;
}

interface PlanningReadinessGateProps {
	place: string;
	plannedDate: string;
	scope: string;
	materials: PlanningResourceLine[];
	tools: PlanningTool[];
	equipment: PlanningEquipment[];
	safetyElements: PlanningResourceLine[];
	workerReqs: WorkerRequirements;
	responsibles: PlanningResponsible[];
	crew?: CrewMember[];
	certifications?: RequiredCertification[];
	supportDocuments?: SupportDocument[];
	astRequired: boolean;
	ptwRequired: boolean;
	schedule?: { plannedStartAt?: string; plannedEndAt?: string };
	isLoading?: boolean;
	onApprove?: () => void;
	isApproving?: boolean;
	approveError?: string | null;
	isApproved?: boolean;
	approvedAt?: string;
}

// ─── Severity Badge ───────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
	blocking: {
		icon: XCircle,
		color: "text-[var(--color-danger)] bg-[var(--color-danger-bg)]",
		label: "Bloqueante",
	},
	warning: { icon: AlertTriangle, color: "text-[var(--color-warning)] bg-[var(--color-warning-bg)]", label: "Advertencia" },
	info: {
		icon: CheckCircle2,
		color: "text-[var(--color-success)] bg-[var(--color-success-bg)]",
		label: "Info",
	},
} as const;

function SeverityBadge({ severity }: { severity: ReadinessCheck["severity"] }) {
	const { icon: Icon, color, label } = SEVERITY_CONFIG[severity];
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}
		>
			<Icon className="size-3" aria-hidden="true" />
			{label}
		</span>
	);
}

// ─── Score Circle ─────────────────────────────────────────────────────────

function ScoreCircle({ score, allPassed }: { score: number; allPassed: boolean }) {
	const color = allPassed
		? "text-[var(--color-success)]"
		: score >= 60
			? "text-[var(--color-warning)]"
			: "text-[var(--color-danger)]";
	const bg = allPassed
		? "bg-[var(--color-success-bg)]"
		: score >= 60
			? "bg-[var(--color-warning-bg)]"
			: "bg-[var(--color-danger-bg)]";
	return (
		<div className={`flex size-20 flex-col items-center justify-center rounded-full ${bg}`}>
			<span className={`text-2xl font-bold ${color}`}>{score}</span>
			<span className="text-[10px] text-[var(--text-secondary)]">%</span>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────

export function PlanningReadinessGate(props: PlanningReadinessGateProps) {
	const readiness = computeReadiness(props);
	const { onApprove, isApproving, approveError, isApproved, approvedAt } = props;

	if (props.isLoading) {
		return (
			<section
				aria-label="Verificando planeación"
				className="flex items-center justify-center py-8"
			>
				<Loader2 className="size-6 animate-spin text-[var(--color-brand)]" />
				<span className="ml-2 text-sm text-[var(--text-secondary)]">Verificando planeación…</span>
			</section>
		);
	}

	return (
		<section
			aria-label="Estado de planeación"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm"
		>
			<header className="flex items-start gap-4">
				<ScoreCircle score={readiness.score} allPassed={readiness.allPassed} />
				<div className="flex-1">
					<h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
						<ClipboardList className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
						Readiness de planeación
					</h2>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{isApproved
							? "Planeación aprobada. Lista para ejecución."
							: readiness.allPassed
								? "Todo listo — la planeación está completa para ejecución."
								: `${readiness.blocking} ítem(s) bloqueante(s) por resolver.`}
					</p>
				</div>
				{isApproved ? (
					<span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
						<ThumbsUp className="size-3" aria-hidden="true" />
						Aprobada
					</span>
				) : readiness.allPassed ? (
					<span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
						<CheckCircle2 className="size-3" aria-hidden="true" />
						Listo
					</span>
				) : (
					<span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-danger)]">
						<XCircle className="size-3" aria-hidden="true" />
						Incompleto
					</span>
				)}
			</header>

			{/* Approved state */}
			{isApproved && approvedAt && (
				<div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-success)]/20 bg-[var(--color-success-bg)] p-4">
					<div className="flex items-start gap-3">
						<ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
						<div>
							<h3 className="text-sm font-semibold text-[var(--color-success)]">Aprobada</h3>
							<p className="mt-0.5 text-xs text-[var(--color-success)]">
								Aprobada el{" "}
								{localeDate(approvedAt, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="mt-4 space-y-2">
				{readiness.checks.map((check) => (
					<div
						key={check.key}
						className={`flex items-center gap-3 rounded-[var(--radius-md)] p-3 text-sm ${
							check.passed
								? "bg-[var(--surface-secondary)]"
								: check.severity === "blocking"
									? "border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]"
									: "border border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)]"
						}`}
					>
						{check.passed ? (
							<CheckCircle2
								className="size-4 shrink-0 text-[var(--color-success)]"
								aria-hidden="true"
							/>
						) : (
							<XCircle className="size-4 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
						)}
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<span className="font-medium text-[var(--text-primary)]">{check.label}</span>
								<SeverityBadge severity={check.severity} />
							</div>
							<p className="mt-0.5 text-xs text-[var(--text-secondary)]">{check.message}</p>
						</div>
					</div>
				))}
			</div>

			{/* Approval Gate — when ready and not yet approved */}
			{readiness.allPassed && !isApproved && (
				<div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-success)]/20 bg-[var(--color-success-bg)] p-4">
					<div className="flex items-start gap-3">
						<ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
						<div className="flex-1">
							<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-success)]">
								Aprobable
								<span className="inline-flex items-center rounded-full bg-[var(--color-success)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
									GER • RES
								</span>
							</h3>
							<p className="mt-0.5 text-xs text-[var(--color-success)]">
								La planeación cumple con todos los requisitos de readiness. Solo Gerente o Residente
								pueden aprobar.
							</p>

							{/* Approve button */}
							{onApprove && (
								<div className="mt-3">
									<button
										type="button"
										onClick={onApprove}
										disabled={isApproving}
										className="inline-flex items-center gap-2 rounded-full bg-[var(--color-success)] px-5 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isApproving ? (
											<>
												<Loader2 className="size-3 animate-spin" aria-hidden="true" /> Aprobando…
											</>
										) : (
											<>
												<ThumbsUp className="size-3" aria-hidden="true" /> Aprobar planeación
											</>
										)}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Approval error */}
					{approveError && (
						<div className="mt-3 flex items-start gap-2 rounded-md border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-3">
							<AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
							<p className="text-xs text-[var(--color-danger)]">{approveError}</p>
						</div>
					)}
				</div>
			)}

			{/* Not approvable */}
			{!readiness.allPassed && readiness.blocking > 0 && (
				<div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)] p-4">
					<div className="flex items-start gap-3">
						<AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
						<div>
							<h3 className="text-sm font-semibold text-[var(--color-warning)]">No aprobable aún</h3>
							<p className="mt-0.5 text-xs text-[var(--color-warning)]">
								{readiness.blocking} ítem(s) bloqueante(s) deben resolverse antes de que Gerente o
								Residente puedan aprobar la planeación.
							</p>
						</div>
					</div>
				</div>
			)}

			<footer className="mt-3 text-xs text-[var(--text-tertiary)]">
				{readiness.passed} de {readiness.total} verificaciones superadas
				{isApproved && " • Planeación aprobada"}
			</footer>
		</section>
	);
}
