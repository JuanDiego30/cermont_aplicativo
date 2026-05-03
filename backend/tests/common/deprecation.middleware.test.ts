import { describe, expect, it, vi } from "vitest";
import { deprecatedRoute } from "@/middlewares/deprecation.middleware";

describe("deprecatedRoute middleware", () => {
	it("adds deprecation metadata and continues the request", () => {
		const next = vi.fn();
		const headers = new Map<string, string>();
		const response = {
			setHeader: vi.fn((name: string, value: string) => {
				headers.set(name, value);
			}),
		};
		const middleware = deprecatedRoute({
			successor: "/api/checklists/:id/validate",
			sunset: "Wed, 30 Sep 2026 23:59:59 GMT",
		});

		middleware({} as never, response as never, next);

		expect(headers.get("Deprecation")).toBe("true");
		expect(headers.get("Sunset")).toBe("Wed, 30 Sep 2026 23:59:59 GMT");
		expect(headers.get("Link")).toBe('</api/checklists/:id/validate>; rel="successor-version"');
		expect(next).toHaveBeenCalledTimes(1);
	});
});
