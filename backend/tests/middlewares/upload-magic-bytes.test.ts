import { describe, expect, it } from "vitest";
import {
	hasValidImageSignature,
	validateFileSignature,
} from "../../src/middlewares/uploadMiddleware";

describe("upload magic byte validation", () => {
	it("accepts a PDF whose binary signature matches its MIME type", () => {
		const pdf = Buffer.from("%PDF-1.7\n");
		expect(() => validateFileSignature(pdf, "application/pdf", "ats.pdf")).not.toThrow();
	});

	it("rejects content that only pretends to be a PDF", () => {
		const disguised = Buffer.from("not really a pdf");
		try {
			validateFileSignature(disguised, "application/pdf", "ats.pdf");
			throw new Error("Expected spoofed PDF to be rejected");
		} catch (error) {
			expect(error).toMatchObject({
				statusCode: 415,
				code: "FILE_SIGNATURE_MISMATCH",
			});
		}
	});

	it("accepts Office Open XML containers for Word and Excel uploads", () => {
		for (const signature of ["504b0304", "504b0506", "504b0708"]) {
			const zipHeader = Buffer.from(`${signature}1400`, "hex");

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
		}
	});

	it.each([
		["image/jpeg", "evidence.jpg", Buffer.from("ffd8ffe000104a464946", "hex")],
		["image/png", "evidence.png", Buffer.from("89504e470d0a1a0a", "hex")],
		["image/gif", "evidence.gif", Buffer.from("GIF87a", "ascii")],
		["image/gif", "evidence.gif", Buffer.from("GIF89a", "ascii")],
		[
			"image/webp",
			"evidence.webp",
			Buffer.concat([Buffer.from("RIFF", "ascii"), Buffer.alloc(4), Buffer.from("WEBP", "ascii")]),
		],
		["application/msword", "format.doc", Buffer.from("d0cf11e0a1b11ae1", "hex")],
		["application/vnd.ms-excel", "cost.xls", Buffer.from("d0cf11e0a1b11ae1", "hex")],
	])("accepts the expected binary signature for %s", (mimeType, filename, content) => {
		expect(() => validateFileSignature(content, mimeType, filename)).not.toThrow();
	});

	it("detects supported image signatures without trusting a declared MIME type", () => {
		expect(hasValidImageSignature(Buffer.from("ffd8ffe0", "hex"))).toBe(true);
		expect(hasValidImageSignature(Buffer.from("plain text", "utf8"))).toBe(false);
	});

	it("rejects MIME types outside the upload allowlist", () => {
		expect(() =>
			validateFileSignature(Buffer.from("plain text"), "text/plain", "notes.txt"),
		).toThrow("Invalid file type: text/plain");
	});
});
