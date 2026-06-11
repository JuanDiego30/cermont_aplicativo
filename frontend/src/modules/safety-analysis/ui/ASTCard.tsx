"use client";

/**
 * ASTCard — Tarjeta de un AST con firmas, pasos y acciones de flujo.
 */

import type { AST, ASTStatus } from "@cermont/shared-types";
import { CheckCircle2, PenLine, ShieldCheck } from "lucide-react";
import { useSignAST, useTransitionAST } from "../queries";

const STATUS_LABELS: Record<string, string> = {
	draft: "Borrador",
	reviewed: "Revisado",
	approved: "Aprobado",
	completed: "Completado",
	cancelled: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
	draft: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]",
	reviewed: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
	approved: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	completed: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	cancelled: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

const NEXT_TRANSITION: Partial<Record<string, { target: ASTStatus; label: string }>> = {
	draft: { target: "reviewed", label: "Marcar revisado" },
	reviewed: { target: "approved", label: "Aprobar" },
	approved: { target: "completed", label: "Completar" },
};

const SIGNATURE_SLOTS = [
	{ role: "elaborated" as const, label: "Elaboró", field: "elaboratedBy" as const },
	{ role: "reviewed" as const, label: "Revisó", field: "reviewedBy" as const },
	{ role: "approved" as const, label: "Aprobó (HES)", field: "approvedBy" as const },
];

interface ASTCardProps {
	ast: AST;
	currentUserName: string;
}

export function ASTCard({ ast, currentUserName }: ASTCardProps) {
	const transitionMutation = useTransitionAST();
	const signMutation = useSignAST();
	const astId = ast._id ?? "";
	const nextTransition = NEXT_TRANSITION[ast.status];

	return (
		<article className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<header className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<ShieldCheck
							className="size-4 shrink-0 text-[var(--color-brand-blue)]"
							aria-hidden="true"
						/>
						<h3 className="truncate text-sm font-medium text-[var(--text-primary)]">
							{ast.workDescription}
						</h3>
					</div>
					<p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
						{ast.location} — Líder: {ast.crewLeader}
						{ast.crewMembers.length > 0 ? ` — Cuadrilla: ${ast.crewMembers.join(", ")}` : ""}
					</p>
				</div>
				<span
					className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[ast.status] ?? ""}`}
				>
					{STATUS_LABELS[ast.status] ?? ast.status}
				</span>
			</header>

			{ast.steps.length > 0 && (
				<ol className="space-y-1.5">
					{ast.steps.map((step) => (
						<li
							key={step.stepNumber}
							className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-2 text-xs"
						>
							<p className="font-medium text-[var(--text-primary)]">
								{step.stepNumber}. {step.taskDescription}
							</p>
							{step.hazards.length > 0 && (
								<p className="mt-0.5 text-[var(--color-danger)]">
									Peligros: {step.hazards.join("; ")}
								</p>
							)}
							{step.controls.length > 0 && (
								<p className="mt-0.5 text-[var(--color-success)]">
									Controles: {step.controls.join("; ")}
								</p>
							)}
						</li>
					))}
				</ol>
			)}

			{ast.ppeRequired.length > 0 && (
				<p className="text-xs text-[var(--text-secondary)]">
					EPP requerido: {ast.ppeRequired.join(", ")}
				</p>
			)}

			<div className="flex flex-wrap gap-2">
				{SIGNATURE_SLOTS.map((slot) => {
					const signature = ast[slot.field];
					return signature ? (
						<span
							key={slot.role}
							className="flex items-center gap-1 rounded-full bg-[var(--color-success-bg)] px-2 py-1 text-[10px] font-medium text-[var(--color-success)]"
						>
							<CheckCircle2 className="size-3" aria-hidden="true" />
							{slot.label}: {signature.signedByName}
						</span>
					) : (
						<button
							type="button"
							key={slot.role}
							disabled={signMutation.isPending || ast.status === "cancelled"}
							onClick={() =>
								signMutation.mutate({
									id: astId,
									input: { role: slot.role, signedByName: currentUserName },
								})
							}
							className="flex items-center gap-1 rounded-full border border-dashed border-[var(--border-default)] px-2 py-1 text-[10px] font-medium text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] disabled:opacity-40"
						>
							<PenLine className="size-3" aria-hidden="true" />
							Firmar {slot.label}
						</button>
					);
				})}
			</div>

			{nextTransition && (
				<footer className="flex justify-end">
					<button
						type="button"
						disabled={transitionMutation.isPending}
						onClick={() => transitionMutation.mutate({ id: astId, status: nextTransition.target })}
						className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
					>
						{nextTransition.label}
					</button>
				</footer>
			)}
		</article>
	);
}
