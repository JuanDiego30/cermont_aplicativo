"use client";

import { AlertTriangle, Check, Circle, Lock } from "lucide-react";
import type { StepProgress } from "../model/cockpit.types";

const STATUS_STYLES: Record<string, { bg: string; border: string; icon: typeof Check }> = {
	completed: { bg: "bg-[#4CAF50]", border: "border-[#4CAF50]", icon: Check },
	in_progress: { bg: "bg-[#FFC107]", border: "border-[#FFC107]", icon: Circle },
	blocked: { bg: "bg-[#F44336]", border: "border-[#F44336]", icon: AlertTriangle },
	pending: { bg: "bg-[#9E9E9E]", border: "border-[#9E9E9E]", icon: Lock },
};

interface Props {
	steps: StepProgress[];
	currentStep: number;
	onStepClick?: (step: number) => void;
}

export function FourteenStepProgressBar({ steps, currentStep, onStepClick }: Props) {
	return (
		<nav aria-label="Progreso de los 14 pasos" className="overflow-x-auto pb-2">
			<ol className="flex min-w-max items-center gap-0 px-4 py-4">
				{steps.map((step, index) => {
					const style = STATUS_STYLES[step.status] ?? STATUS_STYLES.pending;
					const Icon = style.icon;
					const isCurrent = step.step === currentStep;

					return (
						<li key={step.step} className="flex items-center gap-0">
							<button
								type="button"
								onClick={() => onStepClick?.(step.step)}
								title={`Paso ${step.step}: ${step.label} — ${step.status}${step.completedAt ? ` (${new Date(step.completedAt).toLocaleDateString("es-CO")})` : ""}`}
								className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${style.bg} ${style.border} ${isCurrent ? "ring-2 ring-[var(--color-brand-blue)] ring-offset-2" : ""} text-white`}
								style={{ minWidth: 44, minHeight: 44 }}
							>
								<Icon className="size-4" aria-hidden="true" />
								<span className="sr-only">
									Paso {step.step}: {step.label}
								</span>
							</button>
							{index < steps.length - 1 && (
								<div
									className={`mx-1 h-0.5 w-6 shrink-0 rounded-full ${
										step.status === "completed" ? "bg-[#4CAF50]" : "bg-[#9E9E9E]"
									}`}
									aria-hidden="true"
								/>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
