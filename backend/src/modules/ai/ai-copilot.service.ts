import type { Types } from "mongoose";
import { NotFoundError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("ai-copilot");

interface Suggestion {
	step: number;
	action: string;
	reason: string;
	module: string;
}

function getStepLabel(step: number): string {
	const labels: Record<number, string> = {
		1: "Work Request",
		2: "Site Visit",
		3: "Proposal",
		4: "Purchase Order",
		5: "Planning",
		6: "Execution",
		7: "Technical Report",
		8: "Delivery Record",
		9: "Acceptance",
		10: "SES",
		11: "SES Approval",
		12: "Invoice",
		13: "Invoice Approval",
		14: "Payment",
	};
	return labels[step] || `Step ${step}`;
}

export async function getSuggestedNextAction(serviceCaseId: string): Promise<Suggestion[]> {
	const ServiceCase = require("../../models/ServiceCase").default;
	const Evidence = require("../../models/Evidence").default;
	const TechnicalReport = require("../../models/TechnicalReport").default;
	const Invoice = require("../../models/Invoice").default;

	const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const sc = serviceCase as Record<string, unknown>;
	const currentStep = (sc.currentStep as number) || 0;
	const orderId = (sc.workOrderId as Types.ObjectId)?.toString() || "";
	const suggestions: Suggestion[] = [];

	if (currentStep >= 5) {
		const reports = await TechnicalReport.countDocuments({ workOrderId: orderId }).lean();
		if (reports === 0) {
			suggestions.push({
				step: 7,
				module: "technical-report",
				action: "Generate Technical Report from execution data",
				reason: "Execution complete but no technical report exists",
			});
		}
	}

	if (currentStep >= 6) {
		const evidenceCount = await Evidence.countDocuments({
			ownerType: "execution_session",
			ownerId: sc.executionSessionId as string,
		});
		if (evidenceCount === 0) {
			suggestions.push({
				step: 6,
				module: "evidences",
				action: "Capture execution evidence photos",
				reason: "No evidence recorded yet for this execution session",
			});
		}
	}

	if (currentStep >= 12) {
		const invoices = await Invoice.countDocuments({ workOrderId: orderId });
		if (invoices === 0) {
			suggestions.push({
				step: 12,
				module: "invoices",
				action: "Create invoice from approved Service Entry Sheet",
				reason: "SES is approved but no invoice has been created",
			});
		}
	}

	suggestions.push({
		step: currentStep,
		module: "service-cases",
		action: `Continue processing ${getStepLabel(currentStep)}`,
		reason: `Current active step is ${getStepLabel(currentStep)}`,
	});

	log.info("Copilot suggestions generated", {
		serviceCaseId,
		currentStep,
		suggestionCount: suggestions.length,
	});

	return suggestions;
}
