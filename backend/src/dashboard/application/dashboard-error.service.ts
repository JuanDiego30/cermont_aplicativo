import { getErrorMetrics } from "../../_shared/common/observability/error-metrics";
import type { ErrorDashboardResult } from "./dashboard.types";

export function getErrorDashboard(limit = 10): ErrorDashboardResult {
	const metrics = getErrorMetrics(limit);

	return {
		total_errors: metrics.totalErrors,
		by_module: metrics.modules,
		by_endpoint: metrics.endpoints.map((endpoint) => ({
			module: endpoint.module,
			endpoint: endpoint.endpoint,
			count: endpoint.count,
			last_error_at: endpoint.lastErrorAt,
		})),
		generated_at: metrics.generatedAt,
	};
}
