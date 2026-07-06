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

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the current system health status, including MongoDB connectivity
 * and Node.js process metrics.
 */
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
