"use client";

import { AlertCircle, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "current" | "pending" | "blocked";

interface CockpitStep {
	number: number;
	label: string;
	status: StepStatus;
}

interface CockpitTimelineProps {
	steps: CockpitStep[];
	currentStep: number;
	className?: string;
}

const STATUS_CONFIG: Record<StepStatus, { color: string; icon: typeof Check }> = {
	completed: { color: "var(--status-success)", icon: Check },
	current: { color: "var(--color-brand)", icon: Loader2 },
	pending: { color: "var(--text-muted)", icon: Clock },
	blocked: { color: "var(--status-danger)", icon: AlertCircle },
};

export function CockpitTimeline({ steps, className }: CockpitTimelineProps) {
	return (
		<nav aria-label="Flujo de 14 pasos" data-testid="cockpit-timeline" className={className}>
			{/* Desktop: horizontal timeline */}
			<div className="hidden lg:flex items-center gap-1 overflow-x-auto pb-2">
				{steps.map((step, index) => {
					const config = STATUS_CONFIG[step.status];
					const StatusIcon = config.icon;
					const isLast = index === steps.length - 1;
					return (
						<div key={step.number} className="flex items-center shrink-0">
							<div className="flex flex-col items-center gap-1.5 w-20">
								<div
									className={cn(
										"flex size-9 items-center justify-center rounded-full border-2 transition-all",
										step.status === "current" &&
											"ring-2 ring-offset-2 ring-offset-[var(--surface-primary)]",
									)}
									style={{
										borderColor: config.color,
										background:
											step.status === "pending" ? "var(--surface-secondary)" : `${config.color}20`,
									}}
								>
									{step.status === "current" ? (
										<StatusIcon
											className="size-4 animate-spin"
											style={{ color: config.color }}
											aria-hidden="true"
										/>
									) : (
										<StatusIcon
											className="size-4"
											style={{ color: config.color }}
											aria-hidden="true"
										/>
									)}
								</div>
								<span
									className={cn(
										"text-[10px] font-medium text-center leading-tight",
										step.status === "current" || step.status === "completed"
											? "text-[var(--text-primary)]"
											: "text-[var(--text-muted)]",
									)}
								>
									{step.label}
								</span>
							</div>
							{!isLast && (
								<div
									className="h-0.5 w-4 rounded-full transition-colors"
									style={{
										background:
											step.status === "completed"
												? "var(--status-success)"
												: "var(--border-default)",
									}}
								/>
							)}
						</div>
					);
				})}
			</div>

			{/* Mobile: vertical timeline */}
			<div className="lg:hidden flex flex-col">
				{steps.map((step, index) => {
					const config = STATUS_CONFIG[step.status];
					const StatusIcon = config.icon;
					const isLast = index === steps.length - 1;
					return (
						<div key={step.number} className="flex gap-3">
							<div className="flex flex-col items-center">
								<div
									className="flex size-8 items-center justify-center rounded-full border-2 shrink-0"
									style={{
										borderColor: config.color,
										background:
											step.status === "pending" ? "var(--surface-secondary)" : `${config.color}20`,
									}}
								>
									{step.status === "current" ? (
										<StatusIcon
											className="size-3.5 animate-spin"
											style={{ color: config.color }}
											aria-hidden="true"
										/>
									) : (
										<StatusIcon
											className="size-3.5"
											style={{ color: config.color }}
											aria-hidden="true"
										/>
									)}
								</div>
								{!isLast && (
									<div
										className="w-0.5 flex-1 my-1 rounded-full"
										style={{
											background:
												step.status === "completed"
													? "var(--status-success)"
													: "var(--border-default)",
											minHeight: "24px",
										}}
									/>
								)}
							</div>
							<div className="pb-4 flex-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-[var(--text-muted)]">
										{String(step.number).padStart(2, "0")}
									</span>
									<span
										className={cn(
											"text-sm font-medium",
											step.status === "current" || step.status === "completed"
												? "text-[var(--text-primary)]"
												: "text-[var(--text-secondary)]",
										)}
									>
										{step.label}
									</span>
									{step.status === "current" && (
										<span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-semibold text-white">
											Actual
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</nav>
	);
}

export type { CockpitStep, StepStatus };
