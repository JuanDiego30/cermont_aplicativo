"use client";

import { AlertTriangle, CheckCircle2, Circle, Clock, Lock } from "lucide-react";

interface Step {
	id: number;
	label: string;
	status: "pending" | "active" | "completed" | "blocked" | "skipped";
	description?: string;
}

const STEPS: Step[] = [
	{ id: 1, label: "Work Request", status: "pending", description: "Client requests service" },
	{ id: 2, label: "Site Visit", status: "pending", description: "Technical site visit" },
	{ id: 3, label: "Proposal", status: "pending", description: "Economic proposal" },
	{ id: 4, label: "Purchase Order", status: "pending", description: "Client approval" },
	{ id: 5, label: "Planning", status: "pending", description: "Work planning" },
	{ id: 6, label: "Execution", status: "pending", description: "Field execution" },
	{ id: 7, label: "Technical Report", status: "pending", description: "Technical report" },
	{ id: 8, label: "Delivery Record", status: "pending", description: "Delivery record" },
	{ id: 9, label: "Acceptance", status: "pending", description: "Client acceptance" },
	{ id: 10, label: "SES", status: "pending", description: "Service Entry Sheet" },
	{ id: 11, label: "SES Approval", status: "pending", description: "SES approval" },
	{ id: 12, label: "Invoice", status: "pending", description: "Invoicing" },
	{ id: 13, label: "Invoice Approval", status: "pending", description: "Invoice approval" },
	{ id: 14, label: "Payment", status: "pending", description: "Payment & closure" },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
	completed: <CheckCircle2 className="size-5 text-green-500" />,
	active: <Clock className="size-5 text-blue-500 animate-pulse" />,
	blocked: <AlertTriangle className="size-5 text-amber-500" />,
	skipped: <Lock className="size-5 text-gray-300" />,
	pending: <Circle className="size-5 text-gray-300" />,
};

export function FourteenStepProgress({
	currentStep,
	stepStatuses,
}: {
	currentStep: number;
	stepStatuses: Record<number, Step["status"]>;
}) {
	const steps = STEPS.map((s) => ({ ...s, status: stepStatuses[s.id] || s.status }));

	return (
		<div className="w-full overflow-x-auto pb-2">
			<div className="flex gap-1 min-w-max">
				{steps.map((step, idx) => (
					<div key={step.id} className="flex items-center">
						<div
							className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
								step.status === "active" ? "bg-blue-50 dark:bg-blue-950/30" : ""
							} ${step.status === "completed" ? "bg-green-50 dark:bg-green-950/20" : ""} ${
								step.status === "blocked" ? "bg-amber-50 dark:bg-amber-950/20" : ""
							} ${step.id === currentStep ? "ring-2 ring-blue-200" : ""}`}
						>
							<div className="flex items-center gap-1.5">
								{STATUS_ICONS[step.status]}
								<span
									className={`text-xs font-medium whitespace-nowrap ${
										step.status === "completed" ? "text-green-700 dark:text-green-400" : ""
									} ${step.status === "active" ? "text-blue-700 dark:text-blue-400" : ""} ${
										step.status === "blocked" ? "text-amber-700 dark:text-amber-400" : ""
									} ${step.status === "pending" ? "text-gray-500" : ""}`}
								>
									{step.id}. {step.label}
								</span>
							</div>
							{step.description && (
								<span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
									{step.description}
								</span>
							)}
						</div>
						{idx < steps.length - 1 && (
							<div
								className={`h-0.5 w-4 mx-0.5 rounded-full ${
									step.status === "completed" ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
								}`}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
