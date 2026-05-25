import { describe, expect, it } from "vitest";
import { parsePaginationParams } from "@/lib/utils/pagination";

describe("parsePaginationParams", () => {
	it("parsea parámetros válidos", () => {
		const params = new URLSearchParams(
			"page=2&limit=10&search=cliente&sortBy=created_at&sortOrder=asc",
		);

		const result = parsePaginationParams(params);

		expect(result.page).toBe(2);
		expect(result.limit).toBe(10);
		expect(result.search).toBe("cliente");
		expect(result.sortBy).toBe("created_at");
		expect(result.sortOrder).toBe("asc");
	});

	it("usa default params", () => {
		const params = new URLSearchParams("page=abc&limit=-5");
		const result = parsePaginationParams(params);

		expect(result.page).toBe(1);
		expect(result.limit).toBe(20);
		expect(result.search).toBeUndefined();
	});
});
