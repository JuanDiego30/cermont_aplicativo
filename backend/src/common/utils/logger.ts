/**
 * Structured Logger for Cermont Backend
 *
 * Outputs JSON-structured log lines for easy parsing by log aggregators.
 * Drop-in replacement for `console.log/error/warn/info` with:
 *   - Timestamp
 *   - Log level
 *   - Context (module/controller name)
 *   - Optional metadata
 *
 * Can be swapped for winston/pino later without changing call sites.
 */

import { env } from "../../config/env";
import type { JsonObject, JsonValue } from "../types/safe-types";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface StructuredLogEntry extends JsonObject {
	timestamp: string;
	level: LogLevel;
	context: string;
	message: string;
}

export type LogMetadata = Record<string, JsonValue | Error>;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

const currentLevel: LogLevel = (env.LOG_LEVEL as LogLevel) ?? "info";

function shouldLog(level: LogLevel): boolean {
	return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
}

const SENSITIVE_LOG_KEY =
	/(?:password|passphrase|token|authorization|cookie|secret|api[-_]?key|private[-_]?key)/i;

function serializeError(error: Error): JsonObject {
	return {
		name: error.name,
		message: error.message,
		...(error.stack ? { stack: error.stack } : {}),
	};
}

function sanitizeJsonValue(value: JsonValue): JsonValue {
	if (Array.isArray(value)) {
		return value.map(sanitizeJsonValue);
	}

	if (typeof value === "object") {
		const sanitized: JsonObject = {};
		for (const [key, nestedValue] of Object.entries(value)) {
			sanitized[key] = SENSITIVE_LOG_KEY.test(key) ? "[REDACTED]" : sanitizeJsonValue(nestedValue);
		}
		return sanitized;
	}

	return value;
}

function sanitizeMetadata(meta: LogMetadata = {}): JsonObject {
	const sanitized: JsonObject = {};

	for (const [key, value] of Object.entries(meta)) {
		if (SENSITIVE_LOG_KEY.test(key)) {
			sanitized[key] = "[REDACTED]";
			continue;
		}

		sanitized[key] = value instanceof Error ? serializeError(value) : sanitizeJsonValue(value);
	}

	return sanitized;
}

export function buildStructuredLogEntry(
	level: LogLevel,
	context: string,
	message: string,
	meta: LogMetadata = {},
	now: Date = new Date(),
): StructuredLogEntry {
	return {
		...sanitizeMetadata(meta),
		timestamp: now.toISOString(),
		level,
		context,
		message,
	};
}

function formatEntry(entry: StructuredLogEntry): string {
	if (env.NODE_ENV === "production") {
		return JSON.stringify(entry);
	}
	// Pretty format for development
	const { timestamp, level, context, message, ...meta } = entry;
	const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
	return `[${timestamp}] ${level.toUpperCase().padEnd(5)} [${context}] ${message}${metaStr}`;
}

function log(level: LogLevel, context: string, message: string, meta?: LogMetadata): void {
	if (!shouldLog(level)) {
		return;
	}

	const entry = buildStructuredLogEntry(level, context, message, meta);

	const output = formatEntry(entry);

	switch (level) {
		case "error":
			console.error(output);
			break;
		case "warn":
			console.warn(output);
			break;
		default:
			console.log(output);
	}
}

export function createLogger(context: string) {
	return {
		debug: (message: string, meta?: LogMetadata) => log("debug", context, message, meta),
		info: (message: string, meta?: LogMetadata) => log("info", context, message, meta),
		warn: (message: string, meta?: LogMetadata) => log("warn", context, message, meta),
		error: (message: string, meta?: LogMetadata) => log("error", context, message, meta),
	};
}

// Default logger instance
export const logger = createLogger("app");
