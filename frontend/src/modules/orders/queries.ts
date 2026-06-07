import type {
	ClosureReport,
	CreateOrderInput,
	Order,
	OrderListQuery,
	UpdateOrderInput,
	UpdateOrderStatusInput,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient, isOfflineLikeError } from "@/lib/http/api-client";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";
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

// ── Query Keys ────────────────────────────────────────────────
export const ORDERS_KEYS = {
	all: ["orders"] as const,
	list: (filters?: Partial<OrderListQuery>) => [...ORDERS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...ORDERS_KEYS.all, "detail", id] as const,
	closureReport: (id: string) => [...ORDERS_KEYS.all, "closure-report", id] as const,
} as const;

// ── Response Types ───────────────────────────────────────────
interface OrderListContract {
	success?: boolean;
	data?: Order[];
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
}

interface OrderDetail {
	success?: boolean;
	data?: Order;
	error?: string;
	message?: string;
}

// ── Queries ───────────────────────────────────────────────────
export function useOrders(filters?: Partial<OrderListQuery>) {
	return useQuery({
		queryKey: ORDERS_KEYS.list(filters),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						queryParams.set(key, String(value));
					}
				});
			}
			const queryString = queryParams.toString();
			const url = queryString ? `/orders?${queryString}` : "/orders";
			const body = await apiClient.get<OrderListContract>(url);
			const total = body?.meta?.total ?? body?.data?.length ?? 0;
			const limit = body?.meta?.limit ?? Number(filters?.limit ?? 20);
			const page = body?.meta?.page ?? Number(filters?.page ?? 1);

			return {
				items: body?.data ?? [],
				total,
				page,
				limit,
				pages: body?.meta?.pages ?? Math.ceil(total / Math.max(limit, 1)),
			};
		},
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useOrder(id: string) {
	return useQuery({
		queryKey: ORDERS_KEYS.detail(id),
		queryFn: async () => {
			const body = await apiClient.get<OrderDetail>(`/orders/${id}`);
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
		mutationKey: OFFLINE_MUTATION_KEYS.orderCreate,
		mutationFn: (data: CreateOrderInput) => apiClient.post<Order>("/orders", data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function useUpdateOrder(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.orderUpdate,
		mutationFn: (data: UpdateOrderInput) => apiClient.put<Order>(`/orders/${id}`, data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}

export function useOrderClosureReport(orderId: string) {
	return useQuery({
		queryKey: ORDERS_KEYS.closureReport(orderId),
		queryFn: async () => {
			const body = await apiClient.get<{ success?: boolean; data?: ClosureReport }>(
				`/orders/${orderId}/closure-report`,
			);
			if (!body?.data) {
				throw new Error("No se pudo cargar el reporte de cierre administrativo");
			}
			return body.data;
		},
		enabled: !!orderId,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useUpdateOrderStatus(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.orderUpdate,
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (data: UpdateOrderStatusInput): Promise<Order> => {
			try {
				const body = await apiClient.patch<Order>(`/orders/${id}/status`, data);
				return body;
			} catch (error) {
				if (error instanceof Error && isNetworkFailure(error)) {
					const idempotencyKey = createUuid();
					const entry = {
						id: createUuid(),
						endpoint: `/orders/${id}/status`,
						method: "PATCH" as const,
						payload: {
							...data,
							idempotencyKey,
						},
						createdAt: Date.now(),
						retryCount: 0,
						idempotencyKey,
						dedupeKey: `orders:status:${id}:${data.status}`,
					};

					await enqueue(entry);

					const cachedOrder = qc.getQueryData<Order>(ORDERS_KEYS.detail(id));
					if (cachedOrder) {
						const updatedOrder = {
							...cachedOrder,
							status: data.status,
							updatedAt: new Date().toISOString(),
						};
						qc.setQueryData(ORDERS_KEYS.detail(id), updatedOrder);
					}

					qc.invalidateQueries({ queryKey: ORDERS_KEYS.list() });

					return {
						_id: id,
						status: data.status,
						updatedAt: new Date().toISOString(),
					} as Order;
				}
				throw error;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.closureReport(id) });
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}
