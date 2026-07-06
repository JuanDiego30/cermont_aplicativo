"use client";

import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface ReadinessCheck {
	name: string;
	label: string;
	passed: boolean;
	reason?: string;
}

interface ReadinessGateProps {
	checks: ReadinessCheck[];
	canExecute: boolean;
	loading?: boolean;
}

const CHECK_LABELS: Record<string, string> = {
	approvedProposalExists: "Approved proposal",
	allTechsHaveValidCerts: "Technician certifications",
	allVehiclesDocumentsOk: "Vehicle documents",
	allToolsCalibrated: "Tool calibration",
	safetyChecklistComplete: "Safety checklist",
	evidenceSlotsComplete: "Evidence slots",
};

export function ReadinessGate({ checks, canExecute, loading }: ReadinessGateProps) {
	if (loading) {
		return (
			<div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center gap-2">
				<Loader2 className="size-5 animate-spin text-gray-400" />
				<span className="text-sm text-gray-500">Checking readiness...</span>
			</div>
		);
	}

	const borderColor = canExecute
		? "border-green-200 dark:border-green-800"
		: "border-amber-200 dark:border-amber-800";
	const bgColor = canExecute
		? "bg-green-50 dark:bg-green-950/20"
		: "bg-amber-50 dark:bg-amber-950/20";

	return (
		<div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
			<h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
				{canExecute ? (
					<CheckCircle2 className="size-5 text-green-500" />
				) : (
					<AlertTriangle className="size-5 text-amber-500" />
				)}
				{canExecute ? "Ready to Execute" : "Readiness Check Failed"}
			</h3>
			<ul className="space-y-2">
				{checks.map((check) => {
					const label = CHECK_LABELS[check.name] || check.label || check.name;
					return (
						<li key={check.name} className="flex items-center gap-2">
							{check.passed ? (
								<CheckCircle2 className="size-4 text-green-500 shrink-0" />
							) : (
								<XCircle className="size-4 text-red-500 shrink-0" />
							)}
							<span
								className={`text-sm ${check.passed ? "text-gray-600 dark:text-gray-400" : "text-red-600 dark:text-red-400"}`}
							>
								{label}
							</span>
							{!check.passed && check.reason && (
								<span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
									{check.reason}
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
