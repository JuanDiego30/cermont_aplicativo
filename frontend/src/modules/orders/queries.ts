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
import { apiClient } from "@/lib/http/api-client";

// ── Query Keys ────────────────────────────────────────────────
export const ORDERS_KEYS = {
	all: ["orders"] as const,
	list: (filters?: Partial<OrderListQuery>) => [...ORDERS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...ORDERS_KEYS.all, "detail", id] as const,
	closureReport: (id: string) => [...ORDERS_KEYS.all, "closure-report", id] as const,
} as const;

// ── Response Types ───────────────────────────────────────────
interface OrderListResponse {
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
			const body = await apiClient.get<OrderListResponse>(url);
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
		mutationFn: (data: CreateOrderInput) => apiClient.post<Order>("/orders", data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
	});
}

export function useUpdateOrder(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateOrderInput) => apiClient.put<Order>(`/orders/${id}`, data),
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
		mutationFn: (data: UpdateOrderStatusInput) =>
			apiClient.patch<Order>(`/orders/${id}/status`, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.closureReport(id) });
			qc.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
	});
}
