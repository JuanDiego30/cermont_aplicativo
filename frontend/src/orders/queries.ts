import type {
	ApiBody,
	BatchAssignOrdersInput,
	BatchCloseOrdersInput,
	BatchMarkReadyForInvoicingInput,
	BatchRegisterSesInput,
	BatchUpdatePriorityInput,
	BatchUpdateStatusInput,
	BillingPipelineResponse,
	CreateDeliveryRecordInput,
	CreateOrderInput,
	CursorPaginationResult,
	Order,
	OrderListQuery,
	TransitionExecutionPhaseInput,
	UpdateOrderBillingInput,
	UpdateOrderInput,
	UpdateOrderPlanningInput,
	UpdateOrderStatusInput,
} from "@cermont/shared-types";
import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

// ── Query Keys ────────────────────────────────────────────────
export const ORDERS_KEYS = {
	all: ["orders"] as const,
	list: (filters?: Partial<OrderListQuery>) => [...ORDERS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...ORDERS_KEYS.all, "detail", id] as const,
} as const;

type OrdersCursorResponse = ApiBody<Order[]> & CursorPaginationResult<Order>;

function appendOrderQueryParam(params: URLSearchParams, key: string, value: unknown) {
	if (value === undefined || value === null || value === "") {
		return;
	}
	if (Array.isArray(value)) {
		for (const entry of value) {
			appendOrderQueryParam(params, key, entry);
		}
		return;
	}
	params.append(key, String(value));
}

function buildOrdersQueryString(filters?: Partial<OrderListQuery>): string {
	const queryParams = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (key === "limit" && typeof value === "number") {
				queryParams.set(key, String(Math.min(value, 100)));
				return;
			}
			appendOrderQueryParam(queryParams, key, value);
		});
	}
	return queryParams.toString();
}

// ── Queries ───────────────────────────────────────────────────
// NOTE: useOrders (page-based) removed - was causing ?page=1 infinite loop
// page.tsx uses useOrdersInfinite (cursor-based)

export function useOrdersInfinite(filters?: Partial<OrderListQuery>) {
	return useInfiniteQuery({
		queryKey: [...ORDERS_KEYS.list(filters), "infinite"] as const,
		queryFn: async ({ pageParam }) => {
			const queryString = buildOrdersQueryString({
				...filters,
				page: undefined,
				cursor: pageParam,
				pagination: "cursor",
				limit: Math.min(filters?.limit ?? 50, 100),
			});
			const body = await apiClient.get<OrdersCursorResponse>(`/orders?${queryString}`);
			return {
				data: body?.data ?? [],
				pagination: body?.pagination ?? { nextCursor: null, hasNextPage: false },
			};
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) =>
			lastPage.pagination.hasNextPage ? lastPage.pagination.nextCursor : undefined,
		staleTime: STALE_TIMES.REALTIME,
	});
}

/**
 * Legacy hook for backwards compatibility.
 * Wraps useOrdersInfinite to return flattened items array in a { items } wrapper.
 */
export function useOrders(filters?: Partial<OrderListQuery>) {
	const query = useOrdersInfinite(filters);
	return {
		data: { items: flattenInfinitePages(query.data) },
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

export function flattenInfinitePages<T>(
	data: InfiniteData<CursorPaginationResult<T>> | undefined,
): T[] {
	return data?.pages.flatMap((page) => page.data) ?? [];
}

/**
 * Hook to fetch billing pipeline with aging metrics
 */
export function useBillingPipeline() {
	return useQuery({
		queryKey: [...ORDERS_KEYS.all, "billing-pipeline"] as const,
		queryFn: async (): Promise<BillingPipelineResponse> => {
			const body = await apiClient.get<ApiBody<BillingPipelineResponse>>(
				"/orders/billing-pipeline",
			);
			if (!body?.success) {
				throw new Error("Error al cargar pipeline de facturación");
			}
			return body.data;
		},
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function useOrder(id: string) {
	return useQuery({
		queryKey: ORDERS_KEYS.detail(id),
		queryFn: async () => {
			const body = await apiClient.get<ApiBody<Order>>(`/orders/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "Error al cargar orden");
			}
			return body.data;
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

// ── Mutations ─────────────────────────────────────────────────
export function useCreateOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrderInput) => apiClient.post<Order>("/orders", data),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function useUpdateOrder(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateOrderInput) => apiClient.put<Order>(`/orders/${id}`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}

export function useUpdateOrderPlanning(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateOrderPlanningInput) =>
			apiClient.patch<Order>(`/orders/${id}/planning`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}

export function useUpdateOrderBilling(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateOrderBillingInput) =>
			apiClient.patch<Order>(`/orders/${id}/billing`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
			void qc.invalidateQueries({ queryKey: [...ORDERS_KEYS.all, "billing-pipeline"] });
		},
	});
}

export function useBatchCloseOrders() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: BatchCloseOrdersInput) =>
			apiClient.post<Order[]>("/orders/billing/batch-close", data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
			void qc.invalidateQueries({ queryKey: [...ORDERS_KEYS.all, "billing-pipeline"] });
		},
	});
}

export function useBatchMarkReadyForInvoicing() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: BatchMarkReadyForInvoicingInput) =>
			apiClient.post<Order[]>("/orders/billing/batch-ready", data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
			void qc.invalidateQueries({ queryKey: [...ORDERS_KEYS.all, "billing-pipeline"] });
		},
	});
}

export function useBatchRegisterSes() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: BatchRegisterSesInput): Promise<Order[]> => {
			const body = await apiClient.post<ApiBody<Order[]>>("/orders/billing/batch-ses", data);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || body?.error || "No se pudo registrar el SES");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
			void qc.invalidateQueries({ queryKey: [...ORDERS_KEYS.all, "billing-pipeline"] });
		},
	});
}

export function useCreateDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateDeliveryRecordInput): Promise<Order> => {
			const body = await apiClient.post<ApiBody<Order>>(`/orders/${id}/delivery-record`, data);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || body?.error || "No se pudo registrar el acta");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
			void qc.invalidateQueries({ queryKey: [...ORDERS_KEYS.all, "billing-pipeline"] });
			void qc.invalidateQueries({ queryKey: ["documents"] });
		},
	});
}

export function useBatchUpdateStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: BatchUpdateStatusInput) =>
			apiClient.patch<Order[]>("/orders/batch-status", data),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function useBatchUpdatePriority() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: BatchUpdatePriorityInput) =>
			apiClient.patch<Order[]>("/orders/batch-priority", data),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function useBatchAssignOrders() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: BatchAssignOrdersInput) =>
			apiClient.patch<Order[]>("/orders/batch-assign", data),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function buildOrdersExportUrl(
	filters?: Partial<OrderListQuery>,
	format: "csv" | "pdf" = "csv",
) {
	const queryString = buildOrdersQueryString({ ...filters, format } as Partial<OrderListQuery>);
	return queryString ? `/api/backend/orders/export?${queryString}` : "/api/backend/orders/export";
}

export function useDeleteOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiClient.delete(`/orders/${id}`),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function useUpdateOrderStatus(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateOrderStatusInput) =>
			apiClient.patch<Order>(`/orders/${id}/transition`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}

export function useTransitionExecutionPhase(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: TransitionExecutionPhaseInput) => {
			const body = await apiClient.patch<ApiBody<Order>>(`/orders/${id}/execution-phase`, data);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || "No se pudo cambiar la fase de ejecución");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}

export function useUpdatePreStartVerification(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: { items: Array<{ id: string; checked: boolean }> }) => {
			const body = await apiClient.patch<ApiBody<Order>>(
				`/orders/${id}/pre-start-verification`,
				data,
			);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || "No se pudo actualizar la verificación");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
		},
	});
}
