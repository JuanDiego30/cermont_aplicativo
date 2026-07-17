"use client";

/**
 * PlanningSignaturesSection — Displays assigned responsibles/signatures
 * for the planning packet (ingeniero_residente, tecnico_electricista, hes).
 */

import type { PlanningResponsible } from "@cermont/shared-types";
import { UserCheck, UserX } from "lucide-react";
import { localeDate } from "@/lib/utils/format-date";

interface PlanningSignaturesSectionProps {
	responsibles?: PlanningResponsible[];
}

const ROLE_LABELS: Record<string, string> = {
	ingeniero_residente: "Ing. Residente",
	tecnico_electricista: "Técnico Electricista",
	hes: "Coordinador HES",
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
	signed: { label: "Firmado", color: "text-[var(--color-success)] bg-[var(--color-success-bg)]" },
	assigned: { label: "Asignado", color: "text-amber-600 bg-amber-50" },
	pending: { label: "Pendiente", color: "text-[var(--text-muted)] bg-[var(--surface-secondary)]" },
};

export function PlanningSignaturesSection({ responsibles = [] }: PlanningSignaturesSectionProps) {
	if (responsibles.length === 0) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
					<UserCheck className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					Firmas / Responsables
				</h3>
				<p className="mt-2 text-xs text-[var(--text-secondary)]">
					No se han asignado responsables para esta planeación.
				</p>
			</section>
		);
	}

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
			<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
				<UserCheck className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
				Firmas / Responsables
				<span className="rounded-full bg-[var(--color-brand-blue-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand)]">
					{responsibles.length}
				</span>
			</h3>
			<ul className="mt-4 space-y-2">
				{responsibles.map((r, idx) => {
					const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending;
					return (
						<li
							key={r.role + (r.userId ?? idx)}
							className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3"
						>
							<div className="flex items-center gap-3">
								{r.status === "signed" ? (
									<UserCheck className="size-4 text-[var(--color-success)]" aria-hidden="true" />
								) : (
									<UserX className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
								)}
								<div>
									<p className="text-xs font-medium text-[var(--text-primary)]">
										{ROLE_LABELS[r.role] ?? r.role}
									</p>
									{r.name && <p className="text-[10px] text-[var(--text-secondary)]">{r.name}</p>}
								</div>
							</div>
							<div className="flex items-center gap-2">
								{r.signedAt && (
									<span className="text-[9px] text-[var(--text-muted)]">
										{localeDate(r.signedAt)}
									</span>
								)}
								<span
									className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${badge.color}`}
								>
									{badge.label}
								</span>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
