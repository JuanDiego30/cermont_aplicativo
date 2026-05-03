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

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	context: string;
	message: string;
	[key: string]: unknown;
}

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

function formatEntry(entry: LogEntry): string {
	if (env.NODE_ENV === "production") {
		return JSON.stringify(entry);
	}
	// Pretty format for development
	const { timestamp, level, context, message, ...meta } = entry;
	const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
	return `[${timestamp}] ${level.toUpperCase().padEnd(5)} [${context}] ${message}${metaStr}`;
}

function log(level: LogLevel, context: string, message: string, meta?: Record<string, unknown>) {
	if (!shouldLog(level)) {
		return;
	}

	const entry: LogEntry = {
		timestamp: new Date().toISOString(),
		level,
		context,
		message,
		...meta,
	};

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
		debug: (message: string, meta?: Record<string, unknown>) =>
			log("debug", context, message, meta),
		info: (message: string, meta?: Record<string, unknown>) => log("info", context, message, meta),
		warn: (message: string, meta?: Record<string, unknown>) => log("warn", context, message, meta),
		error: (message: string, meta?: Record<string, unknown>) =>
			log("error", context, message, meta),
	};
}

// Default logger instance
export const logger = createLogger("app");
