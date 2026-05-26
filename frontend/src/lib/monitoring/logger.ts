/**
 * Structured logging utility for Cermont S.A.S.
 *
 * - Development: Pretty-printed colored console output
 * - Production: JSON structured logs for aggregation
 *
 * Features:
 * - Automatic timestamps
 * - Log levels: debug, info, warn, error
 * - Context-scoped loggers
 * - PII filtering (passwords, tokens, secrets)
 *
 * @module lib/logger
 */

import { env, isProduction } from "@cermont/config";

const isProd = isProduction();
const isDev = env.NODE_ENV === "development";

/** Fields that should be redacted from log output. */
const SENSITIVE_FIELDS = new Set([
	"password",
	"token",
	"secret",
	"authorization",
	"cookie",
	"auth_secret",
	"creditcard",
	"ssn",
	"token_hash",
	"smtp_pass",
]);

type LogLevel = "debug" | "info" | "warn" | "error";

function isScalarLogValue(data: unknown): boolean {
	return (
		data === null ||
		data === undefined ||
		typeof data === "string" ||
		typeof data === "number" ||
		typeof data === "boolean"
	);
}

function redactError(error: Error): Record<string, unknown> {
	return {
		name: error.name,
		message: error.message,
		...(isDev ? { stack: error.stack } : {}),
	};
}

function redactObjectEntries(
	data: Record<string, unknown>,
	depth: number,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data)) {
		result[key] = SENSITIVE_FIELDS.has(key.toLowerCase())
			? "[REDACTED]"
			: redactSensitive(value, depth + 1);
	}
	return result;
}

/**
 * Recursively redact sensitive fields from an object.
 */
function redactSensitive(data: unknown, depth = 0): unknown {
	if (depth > 5) {
		return "[MAX_DEPTH]";
	}
	if (isScalarLogValue(data)) {
		return data;
	}

	if (data instanceof Error) {
		return redactError(data);
	}

	if (Array.isArray(data)) {
		return data.map((item) => redactSensitive(item, depth + 1));
	}

	if (typeof data === "object") {
		return redactObjectEntries(data as Record<string, unknown>, depth);
	}

	return String(data);
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	context: string;
	message: string;
	data?: unknown;
}

function formatLogEntry(entry: LogEntry): string {
	if (isProd) {
		// JSON structured logging for production log aggregation
		return JSON.stringify({
			ts: entry.timestamp,
			level: entry.level,
			ctx: entry.context,
			msg: entry.message,
			...(entry.data !== undefined ? { data: entry.data } : {}),
		});
	}

	// Pretty-print for development
	const levelColors: Record<LogLevel, string> = {
		debug: "\x1b[36m", // cyan
		info: "\x1b[32m", // green
		warn: "\x1b[33m", // yellow
		error: "\x1b[31m", // red
	};
	const reset = "\x1b[0m";
	const color = levelColors[entry.level];
	const levelLabel = `${color}[${entry.level.toUpperCase()}]${reset}`;
	const contextLabel = `\x1b[90m[${entry.context}]${reset}`;
	const dataStr = entry.data !== undefined ? ` ${JSON.stringify(entry.data, null, 2)}` : "";

	return `${levelLabel}${contextLabel} ${entry.message}${dataStr}`;
}

function log(level: LogLevel, context: string, message: string, data?: unknown): void {
	// Suppress debug/info in production unless explicitly enabled
	if (level === "debug" && !isDev) {
		return;
	}
	if (level === "info" && !isDev && !isProd) {
		return;
	}

	const entry: LogEntry = {
		timestamp: new Date().toISOString(),
		level,
		context,
		message,
		data: data !== undefined ? redactSensitive(data) : undefined,
	};

	const formatted = formatLogEntry(entry);

	switch (level) {
		case "debug":
			console.debug(formatted);
			break;
		case "info":
			console.info(formatted);
			break;
		case "warn":
			console.warn(formatted);
			break;
		case "error":
			console.error(formatted);
			break;
	}
}

/** Default logger instance. */
export const logger = {
	debug: (message: string, data?: unknown) => log("debug", "APP", message, data),
	info: (message: string, data?: unknown) => log("info", "APP", message, data),
	warn: (message: string, data?: unknown) => log("warn", "APP", message, data),
	error: (message: string, data?: unknown) => log("error", "APP", message, data),
};

/**
 * Create a context-scoped logger.
 *
 * @example
 * ```ts
 * const logger = createLogger("API:orders");
 * logger.info("Order created", { id: "abc" });
 * // Production: {"ts":"...","level":"info","ctx":"API:orders","msg":"Order created","data":{"id":"abc"}}
 * // Dev: [INFO][API:orders] Order created {"id":"abc"}
 * ```
 */
export function createLogger(context: string) {
	return {
		debug: (message: string, data?: unknown) => log("debug", context, message, data),
		info: (message: string, data?: unknown) => log("info", context, message, data),
		warn: (message: string, data?: unknown) => log("warn", context, message, data),
		error: (message: string, data?: unknown) => log("error", context, message, data),
	};
}
