import { createLogger } from "../utils";

const log = createLogger("error-metrics");

interface ErrorMetricEntry {
	module: string;
	endpoint: string;
	count: number;
	lastErrorAt: string;
}

interface ErrorMetricMapValue {
	module: string;
	endpoint: string;
	count: number;
	lastErrorAt: Date;
}

const errorMetrics = new Map<string, ErrorMetricMapValue>();

function buildMetricKey(module: string, endpoint: string): string {
	return `${module}::${endpoint}`;
}

function normalizePath(path: string): string {
	if (!path || path === "/") {
		return "/";
	}
	return path.split("?")[0] ?? "/";
}

function getModuleFromPath(path: string): string {
	const normalizedPath = normalizePath(path);
	const pathSegments = normalizedPath.split("/").filter(Boolean);
	if (pathSegments.length >= 2 && pathSegments[0] === "api") {
		return pathSegments[1] ?? "unknown";
	}
	return pathSegments[0] ?? "unknown";
}

export function trackErrorMetric(method: string, path: string): void {
	const module = getModuleFromPath(path);
	const endpoint = `${method.toUpperCase()} ${normalizePath(path)}`;
	const metricKey = buildMetricKey(module, endpoint);
	const now = new Date();
	const existing = errorMetrics.get(metricKey);

	if (existing) {
		existing.count += 1;
		existing.lastErrorAt = now;
		errorMetrics.set(metricKey, existing);
		return;
	}

	errorMetrics.set(metricKey, {
		module,
		endpoint,
		count: 1,
		lastErrorAt: now,
	});
}

export function getErrorMetrics(limit = 10): {
	totalErrors: number;
	modules: Array<{ module: string; count: number }>;
	endpoints: ErrorMetricEntry[];
	generatedAt: string;
} {
	const moduleCountMap = new Map<string, number>();
	const endpoints: ErrorMetricEntry[] = [];
	let totalErrors = 0;

	for (const entry of errorMetrics.values()) {
		totalErrors += entry.count;
		moduleCountMap.set(entry.module, (moduleCountMap.get(entry.module) ?? 0) + entry.count);
		endpoints.push({
			module: entry.module,
			endpoint: entry.endpoint,
			count: entry.count,
			lastErrorAt: entry.lastErrorAt.toISOString(),
		});
	}

	const modules = Array.from(moduleCountMap.entries())
		.map(([module, count]) => ({ module, count }))
		.sort((a, b) => b.count - a.count);

	const topEndpoints = endpoints.sort((a, b) => b.count - a.count).slice(0, Math.max(1, limit));

	log.debug("Error metrics snapshot generated", {
		totalErrors,
		modules: modules.length,
		endpoints: topEndpoints.length,
	});

	return {
		totalErrors,
		modules,
		endpoints: topEndpoints,
		generatedAt: new Date().toISOString(),
	};
}

export function resetErrorMetrics(): void {
	errorMetrics.clear();
}
