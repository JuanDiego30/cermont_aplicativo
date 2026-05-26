import type {
	DocumentIngestionMode,
	DocumentPurpose,
	IngestDocumentRequest,
} from "../schemas/document-ingestion.schema";

/**
 * Resuelve el propósito efectivo de ingestión priorizando `mode` cuando viene en el DTO.
 * Mantiene compatibilidad con clientes que solo envían `purpose`.
 */
export function resolveDocumentIngestPurpose(
	request: Pick<IngestDocumentRequest, "purpose" | "mode">,
): DocumentPurpose {
	if (request.mode === "convert_to_template") {
		return "template_source";
	}
	if (request.mode === "library") {
		return "library";
	}
	if (request.mode === "closing_evidence") {
		return "closing_evidence";
	}
	if (request.mode === "support_document") {
		return "support_document";
	}
	return request.purpose;
}

export function mapPurposeToIngestionMode(purpose: DocumentPurpose): DocumentIngestionMode {
	switch (purpose) {
		case "template_source":
			return "convert_to_template";
		case "closing_evidence":
			return "closing_evidence";
		case "support_document":
			return "support_document";
		default:
			return "library";
	}
}

export function shouldCreateTemplateDraft(purpose: DocumentPurpose): boolean {
	return purpose === "template_source";
}

export function isClosingEvidencePurpose(purpose: DocumentPurpose): boolean {
	return purpose === "closing_evidence";
}

export function isLibraryOnlyPurpose(purpose: DocumentPurpose): boolean {
	return purpose === "library" || purpose === "support_document";
}
