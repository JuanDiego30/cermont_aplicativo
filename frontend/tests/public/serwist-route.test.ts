import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROUTE_PATH = path.resolve(__dirname, "../../src/app/serwist/[path]/route.ts");

describe("Serwist route headers", () => {
	const route = readFileSync(ROUTE_PATH, "utf8");

	it("forces the Service Worker script to revalidate instead of using a year-long cache", () => {
		expect(route).toMatch(/Cache-Control/);
		expect(route).toMatch(/no-store/);
		expect(route).toMatch(/must-revalidate/);
	});
});
