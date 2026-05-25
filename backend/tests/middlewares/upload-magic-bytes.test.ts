import { describe, expect, it } from "vitest";
import { validateFileSignature } from "../../src/middlewares/uploadMiddleware";

describe("upload magic byte validation", () => {
	it("accepts a PDF whose binary signature matches its MIME type", () => {
		const pdf = Buffer.from("%PDF-1.7\n");
		expect(() => validateFileSignature(pdf, "application/pdf", "ats.pdf")).not.toThrow();
	});

	it("rejects content that only pretends to be a PDF", () => {
		const disguised = Buffer.from("not really a pdf");
		expect(() => validateFileSignature(disguised, "application/pdf", "ats.pdf")).toThrow(
			/does not match/i,
		);
	});

	it("accepts Office Open XML containers for Word and Excel uploads", () => {
		const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);

		expect(() =>
			validateFileSignature(
				zipHeader,
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"formato.docx",
			),
		).not.toThrow();
		expect(() =>
			validateFileSignature(
				zipHeader,
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"costos.xlsx",
			),
		).not.toThrow();
	});
});
