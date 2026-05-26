import { describe, expect, it } from "vitest";
import { getNextRetryDelay, hasExceededMaxRetries } from "@/lib/offline/retry-strategy";

describe("retry-strategy", () => {
	it("returns the configured exponential backoff sequence", () => {
		expect(getNextRetryDelay(1)).toBe(1_000);
		expect(getNextRetryDelay(2)).toBe(2_000);
		expect(getNextRetryDelay(3)).toBe(4_000);
		expect(getNextRetryDelay(4)).toBe(8_000);
		expect(getNextRetryDelay(5)).toBe(30_000);
	});

	it("detects when the retry limit has been reached", () => {
		expect(hasExceededMaxRetries(4)).toBe(false);
		expect(hasExceededMaxRetries(5)).toBe(true);
		expect(hasExceededMaxRetries(6)).toBe(true);
	});
});
