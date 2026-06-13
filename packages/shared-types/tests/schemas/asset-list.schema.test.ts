import { describe, expect, it } from "vitest";
import { ListAssetsQuerySchema } from "../../src/schemas/asset.schema";

describe("ListAssetsQuerySchema", () => {
	it("accepts and trims an asset search term", () => {
		const query = ListAssetsQuerySchema.parse({ search: "  ACT-001  " });
		expect(query.search).toBe("ACT-001");
	});

	it("rejects oversized search terms", () => {
		const result = ListAssetsQuerySchema.safeParse({ search: "x".repeat(121) });
		expect(result.success).toBe(false);
	});
});
