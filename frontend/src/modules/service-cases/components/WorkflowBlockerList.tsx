"use client";

import type { DomainBlocker } from "@cermont/shared-types";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface WorkflowBlockerListProps {
	blockers: DomainBlocker[];
	serviceCaseId?: string;
}

function severityTone(severity: DomainBlocker["severity"]): string {
	switch (severity) {
		case "info":
			return "border-sky-200 bg-sky-50 text-brand-green";
		case "warning":
			return "border-amber-200 bg-warning-bg text-brand-warn";
		default:
			return "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]";
	}
}

function BlockerMessage({
	blocker,
	serviceCaseId,
}: {
	blocker: DomainBlocker;
	serviceCaseId?: string;
}) {
	if (blocker.artifactType === "Proposal" && serviceCaseId) {
		return (
			<Link
				href={`/proposals/new?serviceCaseId=${serviceCaseId}`}
				className="text-blue-600 hover:text-blue-800 underline font-medium"
				aria-label="Elaborar propuesta económica para este caso"
			>
				{blocker.message}
			</Link>
		);
	}
	return <>{blocker.message}</>;
}

export function WorkflowBlockerList({ blockers, serviceCaseId }: WorkflowBlockerListProps) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
						Bloqueadores
					</p>
					<h3 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
						Estado de avance del paso actual
					</h3>
				</div>
				<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--text-secondary)]">
					{blockers.length} activos
				</span>
			</div>

			{blockers.length === 0 ? (
				<div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] px-4 py-3 text-xs text-[var(--color-success)]">
					No hay bloqueadores críticos. El caso puede continuar cuando el responsable confirme la
					acción siguiente.
				</div>
			) : (
				<ul className="mt-4 space-y-3">
					{blockers.map((blocker) => (
						<li
							key={`${blocker.code}-${blocker.field || blocker.artifactType}`}
							className={`rounded-[var(--radius-md)] border p-4 ${severityTone(blocker.severity)}`}
						>
							<div className="flex items-start gap-3">
								<ShieldAlert className="mt-0.5 size-4 shrink-0" />
								<div className="space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<p className="text-sm font-semibold text-[var(--text-primary)]">
											<BlockerMessage blocker={blocker} serviceCaseId={serviceCaseId} />
										</p>
										<span className="rounded-full border border-current/20 bg-canvas/70 px-2 py-0.5 text-[10px] font-bold uppercase">
											{blocker.severity}
										</span>
									</div>
									<p className="text-xs text-[var(--text-secondary)]">
										Responsable: <span className="font-semibold">{blocker.ownerRole}</span>
									</p>
									<p className="text-xs text-[var(--text-secondary)]">
										Acción recomendada: {blocker.recommendedAction}
									</p>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}

			<div className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
				<AlertTriangle className="size-3.5 text-[var(--color-warning)]" />
				Cada bloqueador corresponde a una compuerta real del flujo y no a un aviso decorativo.
			</div>
		</section>
	);
}
