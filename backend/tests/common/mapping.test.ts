import { describe, expect, it } from "vitest";
import { offsetToPage, parseNumberQuery } from "@/common/utils/mapping";

describe("mapping utilities", () => {
	it("caps numeric query values when a maximum is provided", () => {
		expect(parseNumberQuery("250", 50, 100)).toBe(100);
		expect(parseNumberQuery("25", 50, 100)).toBe(25);
	});

	it("falls back when the numeric query value is invalid", () => {
		expect(parseNumberQuery("invalid", 50, 100)).toBe(50);
		expect(parseNumberQuery("0", 50, 100)).toBe(50);
	});

	it("derives the correct page from an offset and limit", () => {
		expect(offsetToPage(50, 25)).toBe(3);
	});
});
