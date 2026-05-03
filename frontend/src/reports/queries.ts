import type {
	ApiBody,
	CreateWorkReportInput,
	ReportMonthlyStats,
	ReportPipelineResponse,
	ReportStatus,
	ReportTemplateSettings,
	UpdateWorkReportInput,
	WorkReport,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";
import { requestBinaryDownload } from "@/_shared/lib/http/download-client";

export interface ReportListFilters {
	orderId?: string;
	status?: ReportStatus;
	page?: number;
	limit?: number;
}

interface ReportsEnvelope extends ApiBody<WorkReport[]> {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
}

type ReportEnvelope = ApiBody<WorkReport | null>;

interface ReportArchiveRow {
	periodo?: string;
	period?: string;
	key?: string;
	count?: number;
	total?: number;
}

type ReportArchiveEnvelope = ApiBody<ReportArchiveRow[]>;

interface ApiErrorMessageBody {
	message?: string;
	error?: string | null;
}

const EVIDENCE_ZIP_DOWNLOAD_ERROR = "No se pudo descargar el ZIP de evidencias";

function getApiErrorMessage(
	body: ApiErrorMessageBody | null | undefined,
	fallback: string,
): string {
	if (typeof body?.message === "string" && body.message.trim()) {
		return body.message;
	}

	if (typeof body?.error === "string" && body.error.trim()) {
		return body.error;
	}

	return fallback;
}

export const REPORTS_KEYS = {
	all: ["reports"] as const,
	list: (filters?: ReportListFilters) => [...REPORTS_KEYS.all, "list", filters] as const,
	order: (orderId: string) => [...REPORTS_KEYS.all, "order", orderId] as const,
	detail: (id: string) => [...REPORTS_KEYS.all, "detail", id] as const,
	pipeline: () => [...REPORTS_KEYS.all, "pipeline"] as const,
	archive: () => [...REPORTS_KEYS.all, "archive"] as const,
	monthlyStats: () => [...REPORTS_KEYS.all, "monthly-stats"] as const,
} as const;

function buildQueryString(filters?: ReportListFilters): string {
	const params = new URLSearchParams();

	if (filters?.orderId?.trim()) {
		params.set("orderId", filters.orderId.trim());
	}

	if (filters?.status) {
		params.set("status", filters.status);
	}

	if (typeof filters?.page === "number") {
		params.set("page", String(filters.page));
	}

	if (typeof filters?.limit === "number") {
		params.set("limit", String(filters.limit));
	}

	return params.toString();
}

function mapLegacyArchive(data?: ReportArchiveRow[] | null): Record<string, number> {
	return (data ?? []).reduce<Record<string, number>>((accumulator, row) => {
		const key = String(row.periodo ?? row.period ?? row.key ?? "unknown");
		accumulator[key] = Number(row.count ?? row.total ?? 0);
		return accumulator;
	}, {});
}

export function useReports(filters?: ReportListFilters) {
	const normalizedFilters = {
		orderId: filters?.orderId?.trim() || undefined,
		status: filters?.status,
		page: filters?.page,
		limit: filters?.limit,
	} satisfies ReportListFilters;

	return useQuery({
		queryKey: REPORTS_KEYS.list(normalizedFilters),
		queryFn: async (): Promise<WorkReport[]> => {
			const queryString = buildQueryString(normalizedFilters);
			const url = queryString ? `/reports?${queryString}` : "/reports";
			const body = await apiClient.get<ReportsEnvelope>(url);

			if (!body.success) {
				return [];
			}

			return body?.data ?? [];
		},
		staleTime: CACHE_CONFIG.LIST,
		placeholderData: keepPreviousData,
	});
}

/**
 * Hook to fetch orders awaiting report approval
 */
export function useReportPipeline() {
	return useQuery({
		queryKey: REPORTS_KEYS.pipeline(),
		queryFn: async (): Promise<ReportPipelineResponse> => {
			const body = await apiClient.get<ApiBody<ReportPipelineResponse>>("/reports/pipeline");
			if (!body?.success) {
				throw new Error(getApiErrorMessage(body, "Error al cargar pipeline de informes"));
			}
			return body.data;
		},
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useOrderReport(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: REPORTS_KEYS.order(normalizedOrderId),
		queryFn: async (): Promise<WorkReport | null> => {
			const body = await apiClient.get<ReportEnvelope>(
				`/reports/order/${encodeURIComponent(normalizedOrderId)}`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el informe"));
			}

			return body?.data ?? null;
		},
		enabled: !!normalizedOrderId,
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useSyncReport(orderId: string) {
	const queryClient = useQueryClient();
	const normalizedOrderId = orderId.trim();

	return useMutation({
		mutationFn: async (): Promise<WorkReport> => {
			const body = await apiClient.post<ApiBody<WorkReport>>(
				`/reports/order/${encodeURIComponent(normalizedOrderId)}/sync`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo sincronizar el informe"));
			}

			if (!body.data) {
				throw new Error("No se pudo sincronizar el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(normalizedOrderId) });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(report._id) });
			void queryClient.invalidateQueries({ queryKey: ["orders", "detail", report.orderId] });
		},
	});
}

export function useReport(id: string) {
	const normalizedId = id.trim();

	return useQuery({
		queryKey: REPORTS_KEYS.detail(normalizedId),
		queryFn: async (): Promise<WorkReport | null> => {
			const body = await apiClient.get<ReportEnvelope>(
				`/reports/${encodeURIComponent(normalizedId)}`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "Error al cargar reporte"));
			}

			return body?.data ?? null;
		},
		enabled: !!normalizedId,
		staleTime: CACHE_CONFIG.DETAIL,
	});
}

export function useReportArchive() {
	return useQuery({
		queryKey: REPORTS_KEYS.archive(),
		queryFn: async (): Promise<Record<string, number>> => {
			const body = await apiClient.get<ReportArchiveEnvelope>("/reports/archive");

			if (!body.success) {
				throw new Error(body.message || body.error || "No fue posible cargar el histórico");
			}

			return mapLegacyArchive(body?.data ?? []);
		},
		staleTime: CACHE_CONFIG.ANALYTICS,
	});
}

export function useCreateReport() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateWorkReportInput): Promise<WorkReport> => {
			const body = await apiClient.post<ApiBody<WorkReport>>("/reports", data);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo crear el informe"));
			}

			if (!body.data) {
				throw new Error("No se pudo crear el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: ["orders", report.orderId] });
		},
	});
}

export function useUpdateReport(id: string) {
	const queryClient = useQueryClient();
	const normalizedId = id.trim();

	return useMutation({
		mutationFn: async (data: UpdateWorkReportInput): Promise<WorkReport> => {
			const body = await apiClient.patch<ApiBody<WorkReport>>(
				`/reports/${encodeURIComponent(normalizedId)}`,
				data,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo actualizar el informe"));
			}

			if (!body.data) {
				throw new Error("No se pudo actualizar el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(normalizedId) });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(report.orderId) });
		},
	});
}

export function useApproveReport(id: string) {
	const queryClient = useQueryClient();
	const normalizedId = id.trim();

	return useMutation({
		mutationFn: async (): Promise<WorkReport> => {
			const body = await apiClient.patch<ApiBody<WorkReport>>(
				`/reports/${encodeURIComponent(normalizedId)}/approve`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo aprobar el informe"));
			}

			if (!body.data) {
				throw new Error("No se pudo aprobar el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(normalizedId) });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(report.orderId) });
		},
	});
}

export function useRejectReport(id: string) {
	const queryClient = useQueryClient();
	const normalizedId = id.trim();

	return useMutation({
		mutationFn: async (reason: string): Promise<WorkReport> => {
			const body = await apiClient.patch<ApiBody<WorkReport>>(
				`/reports/${encodeURIComponent(normalizedId)}/reject`,
				{ rejectionReason: reason },
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo rechazar el informe"));
			}

			if (!body.data) {
				throw new Error("No se pudo rechazar el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(normalizedId) });
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(report.orderId) });
		},
	});
}

export function useDownloadReportPdf() {
	return useMutation({
		mutationFn: async (orderId: string): Promise<void> => {
			await requestBinaryDownload({
				path: `/reports/order/${encodeURIComponent(orderId)}/pdf`,
				filename: `work-report-${orderId}.pdf`,
				fallbackMessage: "No se pudo descargar el informe",
			});
		},
	});
}

export function useDownloadEvidencesZip() {
	return useMutation({
		mutationFn: async (orderIds: string[]): Promise<void> => {
			if (orderIds.length === 0) {
				throw new Error("No hay órdenes para exportar");
			}

			if (orderIds.length === 1) {
				await requestBinaryDownload({
					path: `/reports/order/${encodeURIComponent(orderIds[0])}/evidences/zip`,
					filename: `evidencias-${orderIds[0]}.zip`,
					fallbackMessage: EVIDENCE_ZIP_DOWNLOAD_ERROR,
				});
				return;
			}

			await requestBinaryDownload({
				path: "/reports/evidences/bulk-zip",
				filename: "evidencias-reportes.zip",
				method: "POST",
				body: { orderIds },
				fallbackMessage: EVIDENCE_ZIP_DOWNLOAD_ERROR,
			});
		},
	});
}

export function useReportMonthlyStats() {
	return useQuery({
		queryKey: REPORTS_KEYS.monthlyStats(),
		queryFn: async (): Promise<ReportMonthlyStats> => {
			const body = await apiClient.get<ApiBody<ReportMonthlyStats>>("/reports/stats/monthly");
			if (!body?.success) {
				throw new Error(body?.message || "Error al cargar estadísticas mensuales");
			}
			return body.data;
		},
		staleTime: CACHE_CONFIG.ANALYTICS,
	});
}

// ── Report Template Settings ────────────────────────────────

export function useReportTemplateSettings() {
	return useQuery({
		queryKey: ["reports", "settings", "template"],
		queryFn: async (): Promise<ReportTemplateSettings> => {
			const body = await apiClient.get<ApiBody<ReportTemplateSettings>>(
				"/reports/settings/template",
			);
			if (!body?.success) {
				throw new Error(body?.message || "Error al cargar configuración de plantillas");
			}
			return body.data;
		},
		staleTime: CACHE_CONFIG.DETAIL,
	});
}

export function useUpdateReportTemplateSettings() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: ReportTemplateSettings) =>
			apiClient.patch<ReportTemplateSettings>("/reports/settings/template", data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ["reports", "settings", "template"] });
		},
	});
}
