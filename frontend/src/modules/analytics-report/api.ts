import type {
	AnalyticsCsvExport,
	AnalyticsReportDomain,
	AnalyticsReportFilter,
	AnalyticsReportResult,
	OperationalKpiResult,
} from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

interface ApiEnvelope<T> {
	success: true;
	data: T;
}

function buildQuery(filters: AnalyticsReportFilter): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		if (value) {
			params.set(key, value);
		}
	}
	const query = params.toString();
	return query ? `?${query}` : "";
}

export async function getOperationalKpis(
	filters: AnalyticsReportFilter,
): Promise<OperationalKpiResult> {
	const response = await apiClient.get<ApiEnvelope<OperationalKpiResult>>(
		`/analytics/kpi${buildQuery(filters)}`,
	);
	return response.data;
}

export async function generateAnalyticsReport(
	domain: AnalyticsReportDomain,
	filters: AnalyticsReportFilter,
): Promise<AnalyticsReportResult> {
	const response = await apiClient.post<ApiEnvelope<AnalyticsReportResult>>(
		`/analytics/${domain}`,
		filters,
	);
	return response.data;
}

export async function exportAnalyticsCsv(
	domain: AnalyticsReportDomain,
	filters: AnalyticsReportFilter,
): Promise<void> {
	const response = await apiClient.post<ApiEnvelope<AnalyticsCsvExport>>(
		`/analytics/${domain}/export`,
		filters,
	);
	const blob = new Blob([response.data.content], { type: "text/csv;charset=utf-8" });
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = objectUrl;
	anchor.download = response.data.fileName;
	anchor.click();
	URL.revokeObjectURL(objectUrl);
}
