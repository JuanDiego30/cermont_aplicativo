"use client";

import { CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useServiceCaseContext } from "../hooks/useServiceCaseContext";

/**
 * StepBreadcrumb — Muestra el paso actual del workflow en el contexto de un service case.
 * Se usa en páginas de módulo (proposals, purchase-orders, planning, etc.)
 * para mantener visible la secuencia de 14 pasos.
 *
 * Requiere que la URL tenga ?serviceCaseId=<id>
 *
 * Design tokens: Colores como borde/título únicamente (color-as-signal).
 * Fondos siempre neutros (bg-canvas / bg-surface).
 */
export function StepBreadcrumb() {
	const { serviceCaseId, workflow, isLoading, hasServiceCase } = useServiceCaseContext();

	if (!hasServiceCase || isLoading || !workflow) {
		return void 0;
	}

	const currentStep = workflow.steps?.find((s) => s.code === workflow.currentStepCode);

	return (
		<div className="rounded-lg border border-hairline bg-surface p-4 mb-6">
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-semibold text-ink">
					{workflow.code} &mdash; {workflow.clientName}
				</span>
				<Link
					href={`/service-cases/${serviceCaseId}`}
					className="text-xs text-brand-green hover:underline"
				>
					Ver flujo completo &rarr;
				</Link>
			</div>

			{/* Paso actual */}
			{currentStep && (
				<div className="text-xs text-brand-green mb-2">
					Paso actual: <strong>{currentStep.label}</strong>
					{currentStep.stepNumber && <span className="ml-1">({currentStep.stepNumber}/14)</span>}
				</div>
			)}

			{/* Mini timeline — pasos del workflow */}
			{workflow.steps && workflow.steps.length > 0 && (
				<div className="flex items-center gap-1 overflow-x-auto pb-1">
					{workflow.steps.map((step) => {
						const isActive = step.code === workflow.currentStepCode;
						const isDone = step.status === "completed";
						const isBlocked = step.status === "blocked";

						return (
							<div
								key={step.code}
								className={`flex flex-col items-center min-w-[48px] ${
									isActive ? "opacity-100" : "opacity-40"
								}`}
							>
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 bg-canvas ${
										isDone
											? "border-brand-annotate text-brand-annotate"
											: isBlocked
												? "border-brand-warn text-brand-warn"
												: isActive
													? "border-brand-green text-brand-green ring-2 ring-brand-green/20"
													: "border-hairline text-steel"
									}`}
								>
									{isDone ? (
										<CheckCircle className="w-3.5 h-3.5" />
									) : isBlocked ? (
										<Lock className="w-3 h-3" />
									) : (
										<span>{step.stepNumber}</span>
									)}
								</div>
								<span className="text-[9px] text-center mt-0.5 leading-tight max-w-[40px] truncate text-ink">
									{step.label}
								</span>
							</div>
						);
					})}
				</div>
			)}

			{/* Bloqueadores activos */}
			{workflow.blockers && workflow.blockers.length > 0 && (
				<div className="mt-2 text-xs text-brand-error font-medium">
					⚠️{" "}
					{workflow.blockers.filter((b: { severity?: string }) => b.severity === "blocking").length}{" "}
					bloqueador(es) activo(s) en este paso
				</div>
			)}
		</div>
	);
}
