/**
 * Regression tests for the `TypeError: Illegal invocation` bug that
 * affected /delivery-records, /billing/ses, /billing/invoices, and
 * /payments pages.
 *
 * Root cause: destructuring `.get` from `useSearchParams()` strips the
 * `this` binding from `URLSearchParams.prototype.get`. Calling the
 * destructured function as a standalone throws "Illegal invocation"
 * because the method requires `this` to be a valid URLSearchParams
 * instance.
 *
 * Fix: keep the full `searchParams` object and call `.get()` as a
 * method on it.
 *
 * These tests assert the corrected pattern is used in all four
 * affected pages.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FRONTEND_SRC = path.resolve(__dirname, "../../../src");

const AFFECTED_PAGES = [
	"app/(dashboard)/delivery-records/page.tsx",
	"app/(dashboard)/billing/ses/page.tsx",
	"app/(dashboard)/billing/invoices/page.tsx",
	"app/(dashboard)/payments/page.tsx",
] as const;

function readPage(relativePath: string): string {
	return readFileSync(path.join(FRONTEND_SRC, relativePath), "utf-8");
}

const BUGGY_DESTRUCTURE_RE = /const\s*\{\s*get\s*\}\s*=\s*useSearchParams\s*\(\s*\)/;

function walkTsxFiles(dir: string): string[] {
	const results: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			results.push(...walkTsxFiles(full));
		} else if (entry.endsWith(".tsx")) {
			results.push(full);
		}
	}
	return results;
}

describe("Illegal invocation regression — useSearchParams destructuring", () => {
	for (const pagePath of AFFECTED_PAGES) {
		describe(pagePath, () => {
			const source = readPage(pagePath);

			it("does NOT destructure .get from useSearchParams()", () => {
				// The buggy pattern was: const { get } = useSearchParams();
				// This strips `this` from URLSearchParams.prototype.get and
				// throws "TypeError: Illegal invocation" at render time.
				expect(source).not.toMatch(/const\s*\{\s*get\s*\}\s*=\s*useSearchParams\s*\(\s*\)/);
				expect(source).not.toMatch(
					/const\s*\{\s*get\s*,\s*has\s*\}\s*=\s*useSearchParams\s*\(\s*\)/,
				);
			});

			it("keeps the full searchParams object so .get() is called as a method", () => {
				// The fix is: const searchParams = useSearchParams();
				//             const x = searchParams.get("...");
				expect(source).toMatch(/const\s+searchParams\s*=\s*useSearchParams\s*\(\s*\)/);
				// And then it must call .get() on that object, not on a
				// destructured local.
				expect(source).toMatch(/searchParams\.get\s*\(\s*["']workOrderId["']\s*\)/);
			});

			it("wraps the page content in <Suspense> (required by useSearchParams in Next.js 16)", () => {
				// useSearchParams() in Next.js 16 must be called inside a
				// <Suspense> boundary, otherwise it triggers a build-time
				// error or runtime bailout.
				expect(source).toMatch(/<Suspense\b/);
				expect(source).toMatch(/<\/Suspense>/);
			});
		});
	}

	it("no other frontend page destructures URL methods from useSearchParams", () => {
		// Scan all .tsx files under src/ for the buggy pattern.
		// This guards against the bug being reintroduced in new pages.
		const tsxFiles = walkTsxFiles(FRONTEND_SRC);
		const violations: string[] = [];
		for (const file of tsxFiles) {
			const source = readFileSync(file, "utf-8");
			if (BUGGY_DESTRUCTURE_RE.test(source)) {
				violations.push(path.relative(FRONTEND_SRC, file));
			}
		}
		expect(violations).toEqual([]);
	});
});
