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

	/* Color-as-signal: brand colors are borders + text only, never background fills.
	   Completed = green border, neutral bg, green icon
	   Blocked   = amber border, neutral bg, amber icon
	   Active    = blue border, neutral bg, blue icon + subtle blue ring
	   Pending   = gray border, neutral bg, gray number */
	if (isDone) {
		return "border-brand-annotate bg-canvas text-brand-annotate";
	}
	if (isBlocked) {
		return "border-brand-warn bg-canvas text-brand-warn";
	}
	if (isCurrent) {
		return "border-brand-green bg-canvas text-brand-green shadow-[0_0_0_4px_rgba(33,84,166,0.12)] ring-2 ring-brand-green/20";
	}
	return "border-hairline bg-canvas text-steel";
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
		.flatMap((blocker) => (blocker.message ? [blocker.message] : []))
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
							isCurrent ? "font-bold text-ink" : "text-steel"
						}`}
					>
						{step.label}
					</span>
					{(missingDocuments > 0 || missingSignatures > 0) && (
						<div className="flex items-center gap-1 text-[9px] text-brand-warn">
							{missingDocuments > 0 && <FileWarning className="size-3" />}
							{missingSignatures > 0 && <PenSquare className="size-3" />}
						</div>
					)}
				</div>
			</div>

			{!isLast && (
				<div
					className={`mx-1 mt-4 h-0.5 w-10 transition-colors duration-500 ${
						isDone ? "bg-brand-annotate/40" : "bg-hairline"
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
