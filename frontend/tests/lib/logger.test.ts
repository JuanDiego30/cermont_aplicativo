import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger, logger } from "@/lib/monitoring/logger";

describe("logger", () => {
	beforeEach(() => {
		vi.spyOn(console, "debug").mockImplementation(() => {});
		vi.spyOn(console, "info").mockImplementation(() => {});
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("exports a default logger with all levels", () => {
		expect(logger.debug).toBeTypeOf("function");
		expect(logger.info).toBeTypeOf("function");
		expect(logger.warn).toBeTypeOf("function");
		expect(logger.error).toBeTypeOf("function");
	});

	it("creates a context-scoped logger", () => {
		const apiLogger = createLogger("API:test");
		expect(apiLogger.debug).toBeTypeOf("function");
		expect(apiLogger.info).toBeTypeOf("function");
		expect(apiLogger.warn).toBeTypeOf("function");
		expect(apiLogger.error).toBeTypeOf("function");
	});

	it("warn logs always output", () => {
		const testLogger = createLogger("TEST");
		testLogger.warn("test warning");
		expect(console.warn).toHaveBeenCalled();
	});

	it("error logs always output", () => {
		const testLogger = createLogger("TEST");
		testLogger.error("test error");
		expect(console.error).toHaveBeenCalled();
	});

	it("handles Error objects in data", () => {
		const testLogger = createLogger("TEST");
		const error = new Error("Test error");
		testLogger.error("Something failed", error);
		expect(console.error).toHaveBeenCalled();
	});

	it("handles null/undefined data gracefully", () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const testLogger = createLogger("TEST");
		testLogger.warn("null data", null);
		testLogger.warn("undefined data", undefined);
		// At least 2 calls from this test (may be more from module-level warnings)
		expect(warnSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
		warnSpy.mockRestore();
	});
});
