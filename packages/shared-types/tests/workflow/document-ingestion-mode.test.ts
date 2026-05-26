import { describe, expect, it } from "vitest";
import {
	isClosingEvidencePurpose,
	isLibraryOnlyPurpose,
	mapPurposeToIngestionMode,
	resolveDocumentIngestPurpose,
	shouldCreateTemplateDraft,
} from "../../src/workflow/document-ingestion-mode";

describe("document ingestion mode helpers", () => {
	it("prioriza mode sobre purpose para convertir a plantilla", () => {
		expect(
			resolveDocumentIngestPurpose({
				purpose: "library",
				mode: "convert_to_template",
			}),
		).toBe("template_source");
		expect(shouldCreateTemplateDraft("template_source")).toBe(true);
	});

	it("library_only no crea draft", () => {
		expect(
			resolveDocumentIngestPurpose({
				purpose: "library",
				mode: "library",
			}),
		).toBe("library");
		expect(isLibraryOnlyPurpose("library")).toBe(true);
		expect(shouldCreateTemplateDraft("library")).toBe(false);
	});

	it("closing_evidence enruta sin crear draft", () => {
		expect(
			resolveDocumentIngestPurpose({
				purpose: "closing_evidence",
				mode: "closing_evidence",
			}),
		).toBe("closing_evidence");
		expect(isClosingEvidencePurpose("closing_evidence")).toBe(true);
		expect(shouldCreateTemplateDraft("closing_evidence")).toBe(false);
	});

	it("mapea purpose a mode de forma simétrica", () => {
		expect(mapPurposeToIngestionMode("template_source")).toBe("convert_to_template");
		expect(mapPurposeToIngestionMode("closing_evidence")).toBe("closing_evidence");
	});
});
