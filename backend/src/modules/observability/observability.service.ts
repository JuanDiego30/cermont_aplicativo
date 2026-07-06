/**
 * Observability Service — System health metrics and error dashboard
 *
 * SEPARATION OF CONCERNS:
 * - Business KPIs → analytics module (orders, costs, checklists)
 * - Technical errors → error-metrics common utility (in-memory endpoint error tracking)
 * - System health → this service (MongoDB, uptime, memory)
 *
 * All functions are pure or stateless — no req/res dependencies.
 */

import mongoose from "mongoose";
import { getErrorMetrics } from "../../common/observability/error-metrics";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("observability-service");

const START_TIME = Date.now();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthStatus {
	status: "operational" | "degraded" | "down";
	mongodb: {
		status: "connected" | "disconnected" | "connecting";
		host: string | null;
		name: string | null;
	};
	system: {
		uptime_seconds: number;
		memory_usage_mb: number;
		node_version: string;
	};
	generated_at: string;
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

// ─── MongoDB Helpers ─────────────────────────────────────────────────────────

function getMongoStatus(): {
	status: "connected" | "disconnected" | "connecting";
	host: string | null;
	name: string | null;
} {
	const readyState = mongoose.connection.readyState;
	switch (readyState) {
		case 1:
			return {
				status: "connected",
				host: mongoose.connection.host ?? null,
				name: mongoose.connection.name ?? null,
			};
		case 2:
			return { status: "connecting", host: null, name: null };
		default:
			return { status: "disconnected", host: null, name: null };
	}
}

function getMemoryUsageMb(): number {
	try {
		const usage = process.memoryUsage();
		return Math.round(usage.heapUsed / 1024 / 1024);
	} catch {
		return -1;
	}
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the current system health status, including MongoDB connectivity
 * and Node.js process metrics.
 */
export function getSystemHealth(): HealthStatus {
	const mongo = getMongoStatus();
	const overallStatus: HealthStatus["status"] =
		mongo.status === "connected" ? "operational" : mongo.status === "connecting" ? "degraded" : "down";

	log.debug("Health check", { status: overallStatus, mongodb: mongo.status });

	return {
		status: overallStatus,
		mongodb: mongo,
		system: {
			uptime_seconds: Math.floor((Date.now() - START_TIME) / 1000),
			memory_usage_mb: getMemoryUsageMb(),
			node_version: process.version,
		},
		generated_at: new Date().toISOString(),
	};
}

/**
 * Returns the error dashboard snapshot from in-memory error metrics.
 * Delegates to the common error-metrics utility.
 */
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
