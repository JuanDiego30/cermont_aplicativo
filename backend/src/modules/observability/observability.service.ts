import mongoose from "mongoose";
import { getErrorMetrics } from "../../common/observability/error-metrics";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("observability-service");

export interface HealthStatus {
	readonly status: "healthy" | "degraded" | "unhealthy";
	readonly mongo: {
		readonly connected: boolean;
		readonly readyState: number;
		readonly responseTimeMs: number;
	};
	readonly uptime: number;
	readonly timestamp: string;
}

export interface ErrorDashboardEntry {
	total_errors: number;
	by_module: Array<{ module: string; count: number }>;
	by_endpoint: Array<{
		module: string;
		endpoint: string;
		count: number;
		last_error_at: string;
	}>;
	generated_at: string;
}

export interface ComponentStatus {
	name: string;
	status: "healthy" | "degraded" | "unhealthy";
	detail: string;
	responseTimeMs: number;
}

export interface FullSystemStatus {
	status: "healthy" | "degraded" | "unhealthy";
	uptime: number;
	version: string;
	timestamp: string;
	components: ComponentStatus[];
}

async function checkMongo(): Promise<ComponentStatus> {
	const startedAt = Date.now();
	const readyState = mongoose.connection.readyState;

	if (readyState !== 1) {
		return {
			name: "mongodb",
			status: readyState === 2 ? "degraded" : "unhealthy",
			detail: readyState === 2 ? "connecting" : "disconnected",
			responseTimeMs: Date.now() - startedAt,
		};
	}

	const db = mongoose.connection.db;
	if (!db) {
		return {
			name: "mongodb",
			status: "degraded",
			detail: "db handle unavailable",
			responseTimeMs: Date.now() - startedAt,
		};
	}

	try {
		await db.admin().ping();
		return {
			name: "mongodb",
			status: "healthy",
			detail: "connected",
			responseTimeMs: Date.now() - startedAt,
		};
	} catch (error) {
		return {
			name: "mongodb",
			status: "degraded",
			detail: `ping failed: ${error instanceof Error ? error.message : "unknown"}`,
			responseTimeMs: Date.now() - startedAt,
		};
	}
}

async function checkRedis(): Promise<ComponentStatus> {
	const startedAt = Date.now();
	const REDIS_URL = process.env.REDIS_URL ?? "";

	if (!REDIS_URL) {
		return {
			name: "redis",
			status: "healthy",
			detail: "not configured — using MongoDB fallback",
			responseTimeMs: Date.now() - startedAt,
		};
	}

	try {
		const url = new URL(REDIS_URL);
		const host = url.hostname || "localhost";
		const port = Number(url.port) || 6379;
		const { connect } = await import("node:net");
		const socket = connect(port, host);
		await new Promise<void>((resolve, reject) => {
			socket.once("connect", () => {
				socket.end();
				resolve();
			});
			socket.once("error", reject);
			setTimeout(() => {
				socket.destroy();
				reject(new Error("connection timeout"));
			}, 3000);
		});
		return {
			name: "redis",
			status: "healthy",
			detail: `connected to ${host}:${port}`,
			responseTimeMs: Date.now() - startedAt,
		};
	} catch {
		return {
			name: "redis",
			status: "degraded",
			detail: "unreachable — notifications fall back to MongoDB",
			responseTimeMs: Date.now() - startedAt,
		};
	}
}

async function checkFilesystem(): Promise<ComponentStatus> {
	const startedAt = Date.now();
	const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";

	try {
		const fs = await import("node:fs/promises");
		await fs.access(uploadDir);
		return {
			name: "filesystem",
			status: "healthy",
			detail: `accessible: ${uploadDir}`,
			responseTimeMs: Date.now() - startedAt,
		};
	} catch (error) {
		return {
			name: "filesystem",
			status: "unhealthy",
			detail: `cannot access ${uploadDir}: ${error instanceof Error ? error.message : "unknown"}`,
			responseTimeMs: Date.now() - startedAt,
		};
	}
}

async function checkAiProvider(): Promise<ComponentStatus> {
	const startedAt = Date.now();
	const enabled = process.env.ENABLE_CERMONT_AI === "true";

	if (!enabled) {
		return {
			name: "ai-provider",
			status: "healthy",
			detail: "disabled",
			responseTimeMs: Date.now() - startedAt,
		};
	}

	const hasKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
	if (!hasKey) {
		return {
			name: "ai-provider",
			status: "degraded",
			detail: "enabled but no API key configured",
			responseTimeMs: Date.now() - startedAt,
		};
	}

	return {
		name: "ai-provider",
		status: "healthy",
		detail: "configured",
		responseTimeMs: Date.now() - startedAt,
	};
}

export async function getSystemHealth(): Promise<HealthStatus> {
	const startedAt = Date.now();
	const readyState = mongoose.connection.readyState;
	const baseHealth = {
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	} as const;

	if (readyState !== 1) {
		return {
			status: readyState === 2 ? "degraded" : "unhealthy",
			mongo: {
				connected: false,
				readyState,
				responseTimeMs: Date.now() - startedAt,
			},
			...baseHealth,
		};
	}

	const database = mongoose.connection.db;
	if (!database) {
		return {
			status: "degraded",
			mongo: {
				connected: false,
				readyState,
				responseTimeMs: Date.now() - startedAt,
			},
			...baseHealth,
		};
	}

	try {
		await database.admin().ping();
	} catch (error) {
		if (!(error instanceof Error)) {
			throw error;
		}
		log.warn("MongoDB health ping failed", { message: error.message });
		return {
			status: "degraded",
			mongo: {
				connected: false,
				readyState,
				responseTimeMs: Date.now() - startedAt,
			},
			...baseHealth,
		};
	}

	return {
		status: "healthy",
		mongo: {
			connected: true,
			readyState,
			responseTimeMs: Date.now() - startedAt,
		},
		...baseHealth,
	};
}

export const getHealthStatus = getSystemHealth;

export async function getFullSystemStatus(): Promise<FullSystemStatus> {
	const [mongo, redis, fs, ai] = await Promise.all([
		checkMongo(),
		checkRedis(),
		checkFilesystem(),
		checkAiProvider(),
	]);

	const components = [mongo, redis, fs, ai];
	const degraded = components.some((c) => c.status === "degraded");
	const unhealthy = components.some((c) => c.status === "unhealthy");

	const status: FullSystemStatus["status"] = unhealthy
		? "unhealthy"
		: degraded
			? "degraded"
			: "healthy";

	let version = "1.0.0";
	try {
		const { readFileSync } = await import("node:fs");
		const { resolve } = await import("node:path");
		const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as {
			version?: string;
		};
		version = pkg.version ?? "1.0.0";
	} catch {
		// use default
	}

	return {
		status,
		uptime: process.uptime(),
		version,
		timestamp: new Date().toISOString(),
		components,
	};
}

export function getErrorDashboard(limit = 10): ErrorDashboardEntry {
	const metrics = getErrorMetrics(limit);
	return {
		total_errors: metrics.totalErrors,
		by_module: metrics.modules,
		by_endpoint: metrics.endpoints.map((e) => ({
			module: e.module,
			endpoint: e.endpoint,
			count: e.count,
			last_error_at: e.lastErrorAt,
		})),
		generated_at: metrics.generatedAt,
	};
}
