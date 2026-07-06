/**
 * Cockpit Data Transformer
 *
 * Converts the backend's ServiceCaseWorkflowViewModel response
 * into the CockpitData format expected by cockpit UI components.
 */

import type { ServiceCaseWorkflowViewModel } from "@cermont/shared-types";
import type { CockpitData } from "../model/cockpit.types";

export function transformWorkflowToCockpitData(
	workflow: ServiceCaseWorkflowViewModel,
): CockpitData {
	const steps = workflow.steps.map((step) => {
		const isCurrent = step.code === workflow.currentStepCode;
		// A step is blocked only if there are blockers with "blocking" severity
		// AND the blocker targets the current workflow state
		const hasActiveBlockers = workflow.blockers.some((b) => b.severity === "blocking");
		const isBlocked = isCurrent && hasActiveBlockers;
		let status: "completed" | "in_progress" | "blocked" | "pending";
		if (step.status === "completed") {
			status = "completed";
		} else if (isCurrent && isBlocked) {
			status = "blocked";
		} else if (isCurrent) {
			status = "in_progress";
		} else {
			status = "pending";
		}
		return { step: step.stepNumber, label: step.label, status };
	});

	const currentStepNumber =
		workflow.steps.find((s) => s.code === workflow.currentStepCode)?.stepNumber ?? 1;

	const nextAction = workflow.nextActions?.[0]
		? {
				stepNumber: currentStepNumber,
				description:
					workflow.nextActions[0].label ??
					workflow.nextActions[0].command ??
					"Revisar requisitos del paso actual",
				assignedRoles: [],
				urgency: (workflow.deadline
					? new Date(workflow.deadline).getTime() - Date.now() < 172800000
						? "overdue"
						: "urgent"
					: "normal") as "normal" | "urgent" | "overdue",
				deepLink: workflow.nextActions[0].route ?? "",
			}
		: null;

	const blockers = workflow.blockers.map((b) => ({
		code: b.code,
		message: b.message,
		severity: b.severity === "blocking" ? ("error" as const) : ("warning" as const),
	}));

	const evidenceCollection = workflow.evidences.map((ev) => ({
		id: ev.evidenceId,
		type: (ev.evidenceType ?? "during") as
			| "before"
			| "during"
			| "after"
			| "defect"
			| "safety"
			| "signature",
		url: ev.url ?? "",
		caption: ev.filename,
		takenAt: ev.capturedAt ?? new Date().toISOString(),
		status: "captured" as const,
	}));

	const estimated = workflow.costs?.estimated?.estimatedTotalCost ?? 0;
	const actual = workflow.costs?.actual?.actualTotalCost ?? 0;
	const variance = actual - estimated;
	const marginPercent = estimated > 0 ? ((estimated - actual) / estimated) * 100 : 0;

	const costSummary = workflow.costs
		? {
				estimatedTotal: estimated,
				actualTotal: actual,
				variance,
				marginPercent: Math.round(marginPercent * 100) / 100,
				riskLevel: (marginPercent < -10 ? "high" : marginPercent < 0 ? "medium" : "low") as
					| "low"
					| "medium"
					| "high",
			}
		: null;

	const closureStatus = workflow.closure
		? {
				sesStatus: (workflow.closure.sesApproved ? "approved" : "pending") as
					| "pending"
					| "approved"
					| "rejected",
				invoiceStatus: (workflow.closure.invoiceApproved
					? "approved"
					: workflow.closure.invoiceSubmitted
						? "issued"
						: "pending") as "pending" | "issued" | "approved" | "paid",
				paymentStatus: (workflow.closure.paymentReconciled ? "confirmed" : "pending") as
					| "pending"
					| "registered"
					| "confirmed",
			}
		: null;

	const mappedDocs = workflow.documents.map((doc) => {
		const step = workflow.steps.find((s) => s.code === doc.stepCode);
		return {
			name: doc.title,
			step: step?.stepNumber ?? 0,
			status: (doc.fileUrl ? "ready" : "pending") as "ready" | "pending" | "rejected",
			fileUrl: doc.fileUrl,
		};
	});

	return {
		serviceCaseId: workflow.serviceCaseId,
		code: workflow.code,
		clientName: workflow.clientName,
		description: workflow.serviceType ?? "",
		riskLevel: workflow.blockers.some((b) => b.severity === "blocking")
			? "critical"
			: ((workflow.costs?.variance?.status === "loss" ? "high" : "low") as
					| "low"
					| "medium"
					| "high"
					| "critical"),
		slaDeadline: workflow.deadline,
		steps,
		currentStep: currentStepNumber,
		nextAction,
		blockers,
		documents: mappedDocs,
		evidences: evidenceCollection,
		costSummary,
		closureStatus,
		generatedAt: new Date().toISOString(),
	};
}
