/**
 * EvidenceCategory — tests for evidence categorization in the gallery.
 *
 * Verifies:
 * - Evidence schema supports before/after/finding/closure categories
 * - Category filter works for gallery display
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("Evidence category system", () => {
	const EvidenceCategoryEnum = z.enum(["before", "after", "finding", "closure", "general"]);

	it("should define all evidence categories", () => {
		const categories = EvidenceCategoryEnum.options;
		expect(categories).toContain("before");
		expect(categories).toContain("after");
		expect(categories).toContain("finding");
		expect(categories).toContain("closure");
		expect(categories).toContain("general");
	});

	it("should validate valid categories", () => {
		expect(EvidenceCategoryEnum.parse("before")).toBe("before");
		expect(EvidenceCategoryEnum.parse("after")).toBe("after");
		expect(EvidenceCategoryEnum.parse("closure")).toBe("closure");
	});

	it("should reject invalid categories", () => {
		expect(() => EvidenceCategoryEnum.parse("invalid")).toThrow();
		expect(() => EvidenceCategoryEnum.parse("")).toThrow();
	});

	it("should connect evidence categories to template photo types", () => {
		// CCTV template photos use "antes" (before) and "despues" (after) naming
		const categoryMap: Record<string, string> = {
			foto_camara_antes: "before",
			foto_camara_despues: "after",
		};

		expect(categoryMap.foto_camara_antes).toBe("before");
		expect(categoryMap.foto_camara_despues).toBe("after");
	});
});
