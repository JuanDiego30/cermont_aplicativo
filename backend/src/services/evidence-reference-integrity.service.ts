import { UnprocessableError } from "../common/errors/AppError";

interface EvidenceReferences {
	workOrderId?: string;
	executionSessionId?: string;
}

function assertMatchingReference(
	label: string,
	requestedId: string | undefined,
	canonicalId: string | undefined,
): void {
	if (!requestedId) {
		return;
	}

	if (!canonicalId || requestedId !== canonicalId) {
		throw new UnprocessableError(
			`Evidence ${label} does not belong to the selected service case`,
			"EVIDENCE_REFERENCE_MISMATCH",
		);
	}
}

export function assertEvidenceReferencesBelongToCase(
	requested: EvidenceReferences,
	canonical: EvidenceReferences,
): void {
	assertMatchingReference("work order", requested.workOrderId, canonical.workOrderId);
	assertMatchingReference(
		"execution session",
		requested.executionSessionId,
		canonical.executionSessionId,
	);
}
