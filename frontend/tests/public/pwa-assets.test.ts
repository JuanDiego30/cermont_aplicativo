import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

describe("PWA production assets", () => {
	it.each([
		"manifest.json",
		"favicon.ico",
		"icons/icon-192.png",
		"icons/icon-512.png",
		"icons/maskable-icon-192.png",
		"icons/maskable-icon-512.png",
	])("ships %s", (assetPath) => {
		expect(fs.existsSync(path.join(PUBLIC_DIR, assetPath))).toBe(true);
	});

	it("exposes canonical robots metadata", () => {
		expect(robots()).toMatchObject({
			rules: { allow: "/", userAgent: "*" },
			sitemap: expect.stringContaining("/sitemap.xml"),
		});
	});
});
