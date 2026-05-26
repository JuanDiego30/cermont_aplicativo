"use client";

import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type ServiceCaseOperationalStep,
} from "@cermont/shared-types";
import { AlertTriangle, CheckCircle2, Clock, FileWarning, PenSquare } from "lucide-react";

interface OperationalStepProgressProps {
	currentStepCode: CermontOperationalStepCode;
	steps?: ServiceCaseOperationalStep[];
}

function buildFallbackSteps(
	currentStepCode: CermontOperationalStepCode,
): ServiceCaseOperationalStep[] {
	const currentStepIndex = CERMONT_OPERATIONAL_STEPS.findIndex(
		(step) => step.code === currentStepCode,
	);

	return CERMONT_OPERATIONAL_STEPS.map((step, index) => ({
		...step,
		status:
			index < currentStepIndex ? "completed" : index === currentStepIndex ? "active" : "pending",
		blockers: [],
		requirements: [],
		canAdvanceFromHere: false,
	}));
}

function StepIcon({ step, isCurrent }: { step: ServiceCaseOperationalStep; isCurrent: boolean }) {
	const isDone = step.status === "completed";
	const isBlocked = step.status === "blocked";

	if (isDone) {
		return <CheckCircle2 className="size-5" />;
	}
	if (isBlocked) {
		return <AlertTriangle className="size-4" />;
	}
	if (isCurrent) {
		return <Clock className="size-5" />;
	}
	return <span className="text-xs font-bold">{step.stepNumber}</span>;
}

function StepStatusClasses({
	step,
	isCurrent,
}: {
	step: ServiceCaseOperationalStep;
	isCurrent: boolean;
}) {
	const isDone = step.status === "completed";
	const isBlocked = step.status === "blocked";

	if (isDone) {
		return "border-[var(--color-success)] bg-[var(--color-success)] text-white";
	}
	if (isBlocked) {
		return "border-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]";
	}
	if (isCurrent) {
		return "border-[var(--color-brand)] bg-[var(--surface-primary)] text-[var(--color-brand)] shadow-[0_0_0_4px_var(--color-brand-blue-bg)]";
	}
	return "border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-muted)]";
}

function StepItem({
	step,
	currentStepCode,
	isLast,
}: {
	step: ServiceCaseOperationalStep;
	currentStepCode: CermontOperationalStepCode;
	isLast: boolean;
}) {
	const isDone = step.status === "completed";
	const isCurrent = step.code === currentStepCode;
	const isBlocked = step.status === "blocked";
	const blockerSummary = step.blockers
		.map((blocker) => blocker.message)
		.filter(Boolean)
		.join(" · ");
	const missingDocuments = step.requirements.filter(
		(requirement) => requirement.type === "document" && requirement.status !== "satisfied",
	).length;
	const missingSignatures = step.requirements.filter(
		(requirement) => requirement.type === "signature" && requirement.status !== "satisfied",
	).length;

	return (
		<div className="flex items-start">
			<div className="relative flex flex-col items-center gap-2">
				<div
					className={`flex size-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${StepStatusClasses({ step, isCurrent })}`}
					title={isBlocked && blockerSummary ? blockerSummary : step.description}
				>
					<StepIcon step={step} isCurrent={isCurrent} />
				</div>
				<div className="absolute -bottom-10 flex w-24 flex-col items-center gap-1 text-center">
					<span
						className={`text-[9px] leading-tight transition-colors ${
							isCurrent ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-muted)]"
						}`}
					>
						{step.label}
					</span>
					{(missingDocuments > 0 || missingSignatures > 0) && (
						<div className="flex items-center gap-1 text-[9px] text-[var(--color-warning)]">
							{missingDocuments > 0 && <FileWarning className="size-3" />}
							{missingSignatures > 0 && <PenSquare className="size-3" />}
						</div>
					)}
				</div>
			</div>

			{!isLast && (
				<div
					className={`mx-1 mt-4 h-0.5 w-10 transition-colors duration-500 ${
						isDone ? "bg-[var(--color-success)]" : "bg-[var(--border-subtle)]"
					}`}
				/>
			)}
		</div>
	);
}

export function OperationalStepProgress({ currentStepCode, steps }: OperationalStepProgressProps) {
	const workflowSteps =
		steps && steps.length === CERMONT_OPERATIONAL_STEPS.length
			? steps
			: buildFallbackSteps(currentStepCode);

	return (
		<div className="w-full overflow-x-auto py-4 no-scrollbar">
			<div className="flex min-w-max items-start px-4">
				{workflowSteps.map((step, index) => (
					<StepItem
						key={step.code}
						step={step}
						currentStepCode={currentStepCode}
						isLast={index === workflowSteps.length - 1}
					/>
				))}
			</div>
			<div className="h-12" aria-hidden="true" />
		</div>
	);
}
