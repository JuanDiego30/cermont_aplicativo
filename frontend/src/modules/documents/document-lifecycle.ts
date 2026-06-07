import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type DocumentAssociation,
	type DocumentLinkedEntityType,
	type DocumentPurpose,
	type Document as DocumentRecord,
} from "@cermont/shared-types";

const CRITICAL_DOCUMENT_STEPS = new Set<CermontOperationalStepCode>([
	"step_07_technical_report",
	"step_08_delivery_record",
	"step_09_client_signature",
	"step_10_ses_submission",
	"step_11_ses_approval",
	"step_12_invoice_submission",
	"step_13_invoice_approval",
	"step_14_payment_closure",
]);

const CRITICAL_DOCUMENT_ENTITIES = new Set<DocumentLinkedEntityType>([
	"technical_report",
	"delivery_record",
	"service_entry_sheet",
	"invoice",
	"payment",
	"ses",
	"report",
]);

const PURPOSE_LABELS: Record<DocumentPurpose, string> = {
	library: "Library",
	template_source: "Template source",
	closing_evidence: "Closeout evidence",
	support_document: "Operational support",
};

const ENTITY_LABELS: Partial<Record<DocumentLinkedEntityType, string>> = {
	service_case: "Service case",
	work_request: "Request",
	site_visit: "Site visit",
	proposal: "Proposal",
	purchase_order: "Purchase order",
	work_order: "Work order",
	planning_packet: "Planning packet",
	execution_session: "Execution session",
	technical_report: "Technical report",
	delivery_record: "Delivery record",
	service_entry_sheet: "SES",
	invoice: "Invoice",
	payment: "Payment",
	asset: "Asset",
	maintenance_event: "Maintenance event",
	template_library: "Library",
	order: "Order",
	planning: "Planning",
	execution: "Execution",
	report: "Report",
	ses: "SES",
	maintenance: "Maintenance",
};

function humanizeSnakeCase(value: string): string {
	return value
		.split("_")
		.filter(Boolean)
		.map((token) => token.charAt(0).toUpperCase() + token.slice(1))
		.join(" ");
}

function getFirstAssociationWithStep(document: DocumentRecord): DocumentAssociation | false {
	return document.associations.find((association) => Boolean(association.targetStepCode)) || false;
}

function getFirstAssociationWithPurpose(document: DocumentRecord): DocumentAssociation | false {
	return document.associations.find((association) => Boolean(association.purpose)) || false;
}

function getFirstAssociationWithEntity(document: DocumentRecord): DocumentAssociation | false {
	return (
		document.associations.find((association) => Boolean(association.linkedEntityType)) || false
	);
}

function getPrimaryPurpose(document: DocumentRecord): DocumentPurpose | "" {
	const association = getFirstAssociationWithPurpose(document);
	return document.purpose || (association ? association.purpose : "");
}

function getPrimaryStepCode(document: DocumentRecord): CermontOperationalStepCode | "" {
	const association = getFirstAssociationWithStep(document);
	return document.targetStepCode || (association ? association.targetStepCode || "" : "");
}

function getPrimaryEntityType(document: DocumentRecord): DocumentLinkedEntityType | "" {
	const association = getFirstAssociationWithEntity(document);
	return document.linkedEntityType || (association ? association.linkedEntityType || "" : "");
}

export function getDocumentAssociationCount(document: DocumentRecord): number {
	return document.associations.length;
}

export function getDocumentPurposeLabel(document: DocumentRecord): string {
	const purpose = getPrimaryPurpose(document);
	return purpose ? PURPOSE_LABELS[purpose] : "No purpose";
}

export function getDocumentStepLabel(document: DocumentRecord): string {
	const stepCode = getPrimaryStepCode(document);
	if (!stepCode) {
		return "";
	}

	const step = CERMONT_OPERATIONAL_STEPS.find((candidate) => candidate.code === stepCode);
	if (!step) {
		return humanizeSnakeCase(stepCode);
	}

	return `${step.stepNumber}. ${step.label}`;
}

export function getDocumentLinkedEntityLabel(document: DocumentRecord): string {
	const linkedEntityType = getPrimaryEntityType(document);
	if (!linkedEntityType) {
		return "";
	}

	return ENTITY_LABELS[linkedEntityType] ?? humanizeSnakeCase(linkedEntityType);
}

export function getDocumentProtectionReason(document: DocumentRecord): string {
	if (document.signed) {
		return "Signed document";
	}

	if (document.purpose === "closing_evidence") {
		return "Closeout evidence";
	}

	if (document.purpose === "template_source") {
		return "Template source";
	}

	if (document.closingEvidenceKind) {
		return "Administrative closeout support";
	}

	const closingAssociation = document.associations.find(
		(association) => association.purpose === "closing_evidence",
	);
	if (closingAssociation) {
		return "Linked to closeout evidence";
	}

	const criticalStepAssociation = document.associations.find((association) =>
		Boolean(association.targetStepCode && CRITICAL_DOCUMENT_STEPS.has(association.targetStepCode)),
	);
	if (criticalStepAssociation?.targetStepCode) {
		const stepLabel = getDocumentStepLabel({
			...document,
			targetStepCode: criticalStepAssociation.targetStepCode,
		});
		return stepLabel ? `Linked to ${stepLabel}` : "Linked to admin closeout";
	}

	const criticalEntityAssociation = document.associations.find((association) =>
		Boolean(
			association.linkedEntityType && CRITICAL_DOCUMENT_ENTITIES.has(association.linkedEntityType),
		),
	);
	if (criticalEntityAssociation?.linkedEntityType) {
		const entityLabel = ENTITY_LABELS[criticalEntityAssociation.linkedEntityType];
		return entityLabel ? `Linked to ${entityLabel}` : "Linked to admin closeout";
	}

	return "";
}

export function isProtectedDocument(document: DocumentRecord): boolean {
	return getDocumentProtectionReason(document).length > 0;
}

export type { DocumentRecord };
