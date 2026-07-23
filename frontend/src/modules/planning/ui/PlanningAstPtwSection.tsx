"use client";

/**
 * PlanningAstPtwSection — Displays AST (Análisis Seguro de Trabajo) and
 * PTW (Permiso de Trabajo) requirements with linked support documents.
 */

import type { SupportDocument } from "@cermont/shared-types";
import { FileText, ShieldAlert, ShieldCheck } from "lucide-react";

interface PlanningAstPtwSectionProps {
	astRequired: boolean;
	ptwRequired: boolean;
	supportDocuments?: SupportDocument[];
}

export function PlanningAstPtwSection({
	astRequired,
	ptwRequired,
	supportDocuments = [],
}: PlanningAstPtwSectionProps) {
	const hasAstDocs = supportDocuments.some(
		(d) => d.documentType === "ast" || d.documentType === "ats",
	);
	const hasPtwDocs = supportDocuments.some((d) => d.documentType === "ptw");
	const hasAnyRequired = astRequired || ptwRequired;

	if (!hasAnyRequired && supportDocuments.length === 0) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
					<ShieldCheck className="size-4 text-[var(--color-success)]" aria-hidden="true" />
					AST / PTW
				</h3>
				<p className="mt-2 text-xs text-[var(--text-secondary)]">
					No se requieren permisos especiales para esta actividad.
				</p>
			</section>
		);
	}

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
			<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
				<ShieldAlert className="size-4 text-amber-500" aria-hidden="true" />
				Permisos y análisis de seguridad (AST / PTW)
			</h3>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				{astRequired && (
					<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
						<div className="flex items-center gap-2">
							<ShieldCheck
								className={`size-4 ${hasAstDocs ? "text-[var(--color-success)]" : "text-amber-500"}`}
								aria-hidden="true"
							/>
							<span className="text-xs font-semibold text-[var(--text-primary)]">
								Análisis Seguro de Trabajo (AST)
							</span>
						</div>
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							{hasAstDocs
								? "Documento AST adjunto"
								: "Requerido — debe completarse antes de ejecutar"}
						</p>
					</div>
				)}
				{ptwRequired && (
					<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
						<div className="flex items-center gap-2">
							<ShieldCheck
								className={`size-4 ${hasPtwDocs ? "text-[var(--color-success)]" : "text-amber-500"}`}
								aria-hidden="true"
							/>
							<span className="text-xs font-semibold text-[var(--text-primary)]">
								Permiso de Trabajo (PTW)
							</span>
						</div>
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							{hasPtwDocs
								? "Documento PTW adjunto"
								: "Requerido — debe gestionarse antes de ejecutar"}
						</p>
					</div>
				)}
			</div>

			{supportDocuments.length > 0 && (
				<div className="mt-4">
					<p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						Documentos de soporte ({supportDocuments.length})
					</p>
					<ul className="space-y-2">
						{supportDocuments.map((doc) => (
							<li
								key={doc.documentId}
								className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2"
							>
								<FileText
									className="size-3.5 shrink-0 text-[var(--color-brand)]"
									aria-hidden="true"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-xs font-medium text-[var(--text-primary)]">
										{doc.name}
									</p>
									<p className="text-[10px] text-[var(--text-muted)]">
										{doc.documentType}
										{doc.required ? " • Obligatorio" : ""}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}
