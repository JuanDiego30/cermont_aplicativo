import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("service worker listener registration", () => {
	it("registers custom messages before Serwist and prioritizes auth NetworkOnly rules", () => {
		const source = readFileSync(resolve(process.cwd(), "src/app/sw.ts"), "utf8");
		const messageListener = source.indexOf('self.addEventListener("message"');
		const serwistListeners = source.indexOf("serwist.addEventListeners()");
		const skipSwRule = source.indexOf("skipSwHeaderBypass,");
		const authRule = source.indexOf("authApiNoCache,");
		const genericApiRule = source.indexOf("noApiCaching,");

		expect(messageListener).toBeGreaterThan(-1);
		expect(serwistListeners).toBeGreaterThan(-1);
		expect(skipSwRule).toBeGreaterThan(-1);
		expect(authRule).toBeGreaterThan(-1);
		expect(genericApiRule).toBeGreaterThan(-1);
		expect(messageListener).toBeLessThan(serwistListeners);
		expect(skipSwRule).toBeLessThan(authRule);
		expect(authRule).toBeLessThan(genericApiRule);
		expect(source).not.toContain('self.addEventListener("fetch"');
	});
});
