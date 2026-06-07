import type {
	ApiEnvelope,
	CreateWorkReportInput,
	ReportStatus,
	UpdateWorkReportInput,
	WorkReport,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/lib/constants/query-config";
import { apiClient, isOfflineLikeError, toApiUrl } from "@/lib/http/api-client";
import { enqueue } from "@/lib/offline/sync-queue";
import { useOfflineStore } from "@/store/offline.store";

function createUuid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isNetworkFailure(error: Error): boolean {
	return !useOfflineStore.getState().isOnline || isOfflineLikeError(error);
}

export interface ReportListFilters {
	orderId?: string;
	status?: ReportStatus;
	page?: number;
	limit?: number;
}

export interface LegacyReportListItem {
	_id: string;
	title: string;
	titulo: string;
	type: string;
	tipo: string;
	orderId: string;
	workOrderId: string;
	work_order_id: string;
	workOrder: { numero_ot: string; cliente: string };
	pdfUrl?: string;
	pdf_url?: string;
	generatedBy: string;
	generado_por: string;
	createdAt: string;
	created_at: string;
	summary: string;
	content: string;
	status: ReportStatus;
}

interface ReportsEnvelope extends ApiEnvelope<WorkReport[]> {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
}

type ReportEnvelope = ApiEnvelope<WorkReport | null>;

function getApiErrorMessage(body: unknown, fallback: string): string {
	if (body && typeof body === "object") {
		const candidate = body as { message?: unknown; error?: unknown };

		if (typeof candidate.message === "string" && candidate.message.trim()) {
			return candidate.message;
		}

		if (typeof candidate.error === "string" && candidate.error.trim()) {
			return candidate.error;
		}
	}

	return fallback;
}

const REPORTS_KEYS = {
	all: ["reports"] as const,
	list: (filters?: ReportListFilters) => [...REPORTS_KEYS.all, "list", filters] as const,
	order: (orderId: string) => [...REPORTS_KEYS.all, "order", orderId] as const,
	detail: (id: string) => [...REPORTS_KEYS.all, "detail", id] as const,
	legacyList: (filters?: ReportListFilters) =>
		[...REPORTS_KEYS.all, "legacy-list", filters] as const,
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

function mapReportToLegacyItem(report: WorkReport): LegacyReportListItem {
	return {
		_id: report._id,
		title: report.title,
		titulo: report.title,
		type: "technical",
		tipo: "technical",
		orderId: report.orderId,
		workOrderId: report.orderId,
		work_order_id: report.orderId,
		workOrder: { numero_ot: report.orderId, cliente: "" },
		pdfUrl: report.pdfUrl,
		pdf_url: report.pdfUrl,
		generatedBy: report.generatedBy,
		generado_por: report.generatedBy,
		createdAt: report.createdAt,
		created_at: report.createdAt,
		summary: report.summary,
		content: report.summary,
		status: report.status,
	};
}

export function useReports(filters?: ReportListFilters) {
	const normalizedFilters = {
		orderId: filters?.orderId?.trim() || undefined,
		status: filters?.status,
		page: filters?.page,
		limit: filters?.limit,
	} satisfies ReportListFilters;

	return useQuery({
		queryKey: REPORTS_KEYS.legacyList(normalizedFilters),
		queryFn: async (): Promise<LegacyReportListItem[]> => {
			const queryString = buildQueryString(normalizedFilters);
			const url = queryString ? `/reports?${queryString}` : "/reports";
			const body = await apiClient.get<ReportsEnvelope>(url);

			if (body?.success === false) {
				return [];
			}

			return (body?.data ?? []).map(mapReportToLegacyItem);
		},
		staleTime: CACHE_CONFIG.LIST,
		placeholderData: keepPreviousData,
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

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el informe"));
			}

			return body?.data ?? null;
		},
		enabled: !!normalizedOrderId,
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useCreateReport() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["reports", "create"],
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (data: CreateWorkReportInput): Promise<WorkReport> => {
			try {
				const body = await apiClient.post<ApiEnvelope<WorkReport>>("/reports", data);

				if (body?.success === false) {
					throw new Error(getApiErrorMessage(body, "No se pudo crear el informe"));
				}

				if (!body?.data) {
					throw new Error("No se pudo crear el informe");
				}

				return body.data;
			} catch (error) {
				if (error instanceof Error && isNetworkFailure(error)) {
					const tempId = `report-${createUuid()}`;
					const idempotencyKey = createUuid();
					const entry = {
						id: createUuid(),
						endpoint: "/reports",
						method: "POST" as const,
						payload: {
							orderId: data.orderId,
							title: data.title,
							summary: data.summary ?? "",
							idempotencyKey,
						},
						createdAt: Date.now(),
						retryCount: 0,
						idempotencyKey,
						dedupeKey: `reports:create:${data.orderId}`,
					};

					await enqueue(entry);

					const mockReport: WorkReport = {
						_id: tempId,
						orderId: data.orderId,
						title: data.title,
						summary: data.summary ?? "",
						status: "draft",
						includesChecklist: false,
						includesCosts: false,
						includesEvidences: false,
						generatedBy: "operator",
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};

					queryClient.setQueryData(REPORTS_KEYS.order(data.orderId), mockReport);
					queryClient.invalidateQueries({ queryKey: ["orders", data.orderId] });

					return mockReport;
				}
				throw error;
			}
		},
		onSuccess: (report) => {
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: ["orders", report.orderId] });
		},
	});
}

export function useUpdateReport(id: string) {
	const queryClient = useQueryClient();
	const normalizedId = id.trim();

	return useMutation({
		mutationKey: ["reports", "update"],
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (data: UpdateWorkReportInput): Promise<WorkReport> => {
			try {
				const body = await apiClient.patch<ApiEnvelope<WorkReport>>(
					`/reports/${encodeURIComponent(normalizedId)}`,
					data,
				);

				if (body?.success === false) {
					throw new Error(getApiErrorMessage(body, "No se pudo actualizar el informe"));
				}

				if (!body?.data) {
					throw new Error("No se pudo actualizar el informe");
				}

				return body.data;
			} catch (error) {
				if (error instanceof Error && isNetworkFailure(error)) {
					const idempotencyKey = createUuid();
					const entry = {
						id: createUuid(),
						endpoint: `/reports/${encodeURIComponent(normalizedId)}`,
						method: "PATCH" as const,
						payload: {
							...data,
							idempotencyKey,
						},
						createdAt: Date.now(),
						retryCount: 0,
						idempotencyKey,
						dedupeKey: `reports:update:${normalizedId}:${JSON.stringify(data)}`,
					};

					await enqueue(entry);

					// Optimistically update report
					let orderId = "";
					interface OptimisticReport {
						_id?: string;
						orderId?: string;
						workOrderId?: string;
					}
					queryClient.setQueriesData({ queryKey: REPORTS_KEYS.all }, (old: unknown) => {
						if (!old) {
							return old;
						}
						if (Array.isArray(old)) {
							return old.map((item: unknown) => {
								const typedItem = item as OptimisticReport;
								if (typedItem._id === normalizedId) {
									orderId = typedItem.orderId || typedItem.workOrderId || "";
									return { ...(item as Record<string, unknown>), ...data };
								}
								return item;
							});
						}
						const typedSingle = old as OptimisticReport;
						if (typedSingle._id === normalizedId) {
							orderId = typedSingle.orderId || "";
							return { ...(old as Record<string, unknown>), ...data };
						}
						return old;
					});

					const cache = queryClient.getQueryCache();
					const orderQueries = cache.findAll({ queryKey: REPORTS_KEYS.all });
					for (const query of orderQueries) {
						const queryKey = query.queryKey;
						if (queryKey[1] === "order" && typeof queryKey[2] === "string") {
							const cachedReport = query.state.data as WorkReport | null;
							if (cachedReport && cachedReport._id === normalizedId) {
								orderId = queryKey[2];
								queryClient.setQueryData(queryKey, { ...cachedReport, ...data });
								break;
							}
						}
					}

					if (orderId) {
						queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
					}

					const currentCached =
						queryClient.getQueryData<WorkReport>(REPORTS_KEYS.detail(normalizedId)) ||
						({} as WorkReport);
					const mockReport = {
						...currentCached,
						_id: normalizedId,
						...data,
					} as WorkReport;

					queryClient.setQueryData(REPORTS_KEYS.detail(normalizedId), mockReport);

					return mockReport;
				}
				throw error;
			}
		},
		onSuccess: (report) => {
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(normalizedId) });
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(report.orderId) });
		},
	});
}

export function useApproveReport(id: string) {
	const queryClient = useQueryClient();
	const normalizedId = id.trim();

	return useMutation({
		mutationKey: ["reports", "approve"],
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (): Promise<WorkReport> => {
			const body = await apiClient.patch<ApiEnvelope<WorkReport>>(
				`/reports/${encodeURIComponent(normalizedId)}/approve`,
			);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudo aprobar el informe"));
			}

			if (!body?.data) {
				throw new Error("No se pudo aprobar el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(normalizedId) });
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(report.orderId) });
		},
	});
}

export function useRejectReport(id: string) {
	const queryClient = useQueryClient();
	const normalizedId = id.trim();

	return useMutation({
		mutationKey: ["reports", "reject"],
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (reason: string): Promise<WorkReport> => {
			const body = await apiClient.patch<ApiEnvelope<WorkReport>>(
				`/reports/${encodeURIComponent(normalizedId)}/reject`,
				{ rejectionReason: reason },
			);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudo rechazar el informe"));
			}

			if (!body?.data) {
				throw new Error("No se pudo rechazar el informe");
			}

			return body.data;
		},
		onSuccess: (report) => {
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(normalizedId) });
			queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(report.orderId) });
		},
	});
}

export function useDownloadReportPdf() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["reports", "download-pdf"],
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (orderId: string): Promise<void> => {
			const response = await fetch(toApiUrl(`/reports/order/${encodeURIComponent(orderId)}/pdf`), {
				credentials: "include",
			});

			if (!response.ok) {
				const body = await response.json().catch(() => null);
				const message =
					body && typeof body === "object" && "message" in body && typeof body.message === "string"
						? body.message
						: "No se pudo descargar el informe";
				throw new Error(message);
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `work-report-${orderId}.pdf`;
			anchor.click();
			URL.revokeObjectURL(url);
		},
		// Invalidate the order report query so the pdfUrl field stays fresh
		// if the backend generates the PDF lazily on first download.
		onSuccess: (_data, orderId) => {
			void queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.order(orderId) });
		},
	});
}
