import type { CermontOperationalStepCode, ClosingEvidenceKind } from "@cermont/shared-types";
import { Types } from "mongoose";
import type { IDocument } from "../models/Document";

export type ClosingEvidenceClassification = ClosingEvidenceKind;

interface ApplyClosingEvidenceMetadataOptions {
	serviceCaseId?: string;
	targetStepCode?: CermontOperationalStepCode;
}

export interface ClosingEvidenceRoutingOutcome {
	classification: ClosingEvidenceClassification;
	targetStepCode?: CermontOperationalStepCode;
}

type ClassificationRule = {
	keywords: string[];
	result: ClosingEvidenceClassification;
	requireAll?: boolean;
};

const CLASSIFICATION_RULES: ClassificationRule[] = [
	{ keywords: ["pago", "payment", "transferencia"], result: "payment_support" },
	{ keywords: ["factura", "invoice"], result: "invoice_sent" },
	{ keywords: ["ses", "ariba"], result: "ses_filing" },
	{ keywords: ["firma", "signed", "aceptacion"], result: "client_signature" },
	{ keywords: ["acta", "entrega", "delivery"], result: "acta_delivery" },
];

const COMPOUND_RULES: ClassificationRule[] = [
	{
		keywords: ["factura", "invoice", "aprob", "acept"],
		result: "invoice_approval",
		requireAll: true,
	},
	{
		keywords: ["ses", "ariba", "aprob", "accept"],
		result: "ses_approval",
		requireAll: true,
	},
];

function matchesRule(name: string, rule: ClassificationRule): boolean {
	if (rule.requireAll) {
		const firstGroup = rule.keywords.slice(0, Math.ceil(rule.keywords.length / 2));
		const secondGroup = rule.keywords.slice(Math.ceil(rule.keywords.length / 2));
		return firstGroup.some((k) => name.includes(k)) && secondGroup.some((k) => name.includes(k));
	}
	return rule.keywords.some((k) => name.includes(k));
}

export function classifyClosingEvidence(
	fileName: string,
	mimeType?: string,
): ClosingEvidenceClassification {
	const name = fileName.toLowerCase();

	for (const rule of COMPOUND_RULES) {
		if (matchesRule(name, rule)) {
			return rule.result;
		}
	}

	for (const rule of CLASSIFICATION_RULES) {
		if (matchesRule(name, rule)) {
			return rule.result;
		}
	}

	return mimeType?.startsWith("image/") ? "other_support" : "other_support";
}

export function mapClassificationToStepCode(
	classification: ClosingEvidenceClassification,
): CermontOperationalStepCode | undefined {
	switch (classification) {
		case "acta_delivery":
			return "step_08_delivery_record";
		case "client_signature":
			return "step_09_client_signature";
		case "ses_filing":
			return "step_10_ses_submission";
		case "ses_approval":
			return "step_11_ses_approval";
		case "invoice_sent":
			return "step_12_invoice_submission";
		case "invoice_approval":
			return "step_13_invoice_approval";
		case "payment_support":
			return "step_14_payment_closure";
		default:
			return;
	}
}

function mapStepCodeToClassification(
	stepCode: CermontOperationalStepCode,
): ClosingEvidenceClassification | undefined {
	switch (stepCode) {
		case "step_08_delivery_record":
			return "acta_delivery";
		case "step_09_client_signature":
			return "client_signature";
		case "step_10_ses_submission":
			return "ses_filing";
		case "step_11_ses_approval":
			return "ses_approval";
		case "step_12_invoice_submission":
			return "invoice_sent";
		case "step_13_invoice_approval":
			return "invoice_approval";
		case "step_14_payment_closure":
			return "payment_support";
		default:
			return;
	}
}

export function applyClosingEvidenceMetadata(
	document: IDocument,
	options: ApplyClosingEvidenceMetadataOptions = {},
): ClosingEvidenceRoutingOutcome {
	const classification =
		(options.targetStepCode ? mapStepCodeToClassification(options.targetStepCode) : undefined) ??
		classifyClosingEvidence(document.title, document.mime_type);
	const targetStepCode = options.targetStepCode ?? mapClassificationToStepCode(classification);

	document.purpose = "closing_evidence";
	document.closingEvidenceKind = classification;
	document.linkedEntityType = "service_case";

	if (options.serviceCaseId) {
		document.linkedEntityId = new Types.ObjectId(options.serviceCaseId);
	}

	if (targetStepCode) {
		document.targetStepCode = targetStepCode;
	}

	return {
		classification,
		targetStepCode,
	};
}
