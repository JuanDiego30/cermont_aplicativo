import { describe, expect, it } from "vitest";

const { buildStructuredLogEntry } = await vi.importActual<
	typeof import("../../src/common/utils/logger")
>("../../src/common/utils/logger");

describe("structured logger", () => {
	it("emits structured fields and recursively redacts secrets", () => {
		const entry = buildStructuredLogEntry(
			"info",
			"auth",
			"Session created",
			{
				requestId: "trace-123",
				authorization: "Bearer private",
				nested: {
					password: "private",
					result: "success",
				},
			},
			new Date("2026-06-11T12:00:00.000Z"),
		);

		expect(entry).toEqual({
			timestamp: "2026-06-11T12:00:00.000Z",
			level: "info",
			context: "auth",
			message: "Session created",
			requestId: "trace-123",
			authorization: "[REDACTED]",
			nested: {
				password: "[REDACTED]",
				result: "success",
			},
		});
		expect(JSON.parse(JSON.stringify(entry))).toEqual(entry);
	});

	it("serializes Error metadata without losing its diagnostic message", () => {
		const entry = buildStructuredLogEntry(
			"error",
			"database",
			"Connection failed",
			{ error: new Error("connection refused") },
			new Date("2026-06-11T12:00:00.000Z"),
		);

		expect(entry.error).toMatchObject({
			name: "Error",
			message: "connection refused",
		});
	});
});
