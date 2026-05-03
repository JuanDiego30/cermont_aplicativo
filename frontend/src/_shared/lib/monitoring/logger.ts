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
import { env, isProduction } from "@cermont/shared-types/config";

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

function shouldRedactField(key: string): boolean {
	return SENSITIVE_FIELDS.has(key.toLowerCase());
}

function formatPrimitive(data: unknown): unknown {
	if (data === null || data === undefined) {
		return data;
	}
	if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
		return data;
	}
	if (data instanceof Error) {
		return {
			name: data.name,
			message: data.message,
			...(isDev ? { stack: data.stack } : {}),
		};
	}
	return data;
}

function processObject(data: Record<string, unknown>, depth: number): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data)) {
		result[key] = shouldRedactField(key) ? "[REDACTED]" : redactSensitive(value, depth + 1);
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

	const primitive = formatPrimitive(data);
	if (primitive !== data) {
		return primitive;
	}

	if (Array.isArray(data)) {
		return data.map((item) => redactSensitive(item, depth + 1));
	}

	if (typeof data === "object") {
		return processObject(data as Record<string, unknown>, depth);
	}

	return typeof data === "symbol" ? (data.description ?? "[Symbol]") : data;
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	context: string;
	message: string;
	data?: unknown;
}

function formatProductionLog(entry: LogEntry): string {
	return JSON.stringify({
		ts: entry.timestamp,
		level: entry.level,
		ctx: entry.context,
		msg: entry.message,
		...(entry.data !== undefined ? { data: entry.data } : {}),
	});
}

function formatDevelopmentLog(entry: LogEntry): string {
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

function formatLogEntry(entry: LogEntry): string {
	return isProd ? formatProductionLog(entry) : formatDevelopmentLog(entry);
}

function shouldLog(level: LogLevel): boolean {
	if (level === "debug" && !isDev) {
		return false;
	}
	if (level === "info" && !isDev && !isProd) {
		return false;
	}
	return true;
}

function getConsoleMethod(level: LogLevel): typeof console.log {
	switch (level) {
		case "debug":
			return console.debug;
		case "info":
			return console.info;
		case "warn":
			return console.warn;
		case "error":
			return console.error;
	}
}

function log(level: LogLevel, context: string, message: string, data?: unknown): void {
	if (!shouldLog(level)) {
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
	const consoleMethod = getConsoleMethod(level);
	if (entry.data !== undefined && isDev) {
		consoleMethod(formatted, entry.data);
		return;
	}
	consoleMethod(formatted);
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
