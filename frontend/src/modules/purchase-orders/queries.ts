"use client";

import type { ApiEnvelope, PurchaseOrderAuthorization } from "@cermont/shared-types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type ListEnvelope<T> = ApiEnvelope<T[]> & {
	meta?: { total?: number; page?: number; limit?: number; pages?: number };
};

const PURCHASE_ORDER_KEYS = {
	all: ["purchase-orders"] as const,
	list: () => [...PURCHASE_ORDER_KEYS.all, "list"] as const,
	detail: (id: string) => [...PURCHASE_ORDER_KEYS.all, "detail", id] as const,
};

export function usePurchaseOrdersList() {
	return useQuery({
		queryKey: PURCHASE_ORDER_KEYS.list(),
		queryFn: async () => {
			const response = await apiClient.get<ListEnvelope<PurchaseOrderAuthorization>>(
				"/purchase-orders?limit=50",
			);
			return {
				items: response.data,
				total: response.meta?.total ?? response.data.length,
				page: response.meta?.page ?? 1,
				limit: response.meta?.limit ?? 20,
				pages: response.meta?.pages ?? 1,
			};
		},
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function usePurchaseOrder(id: string) {
	return useQuery({
		queryKey: PURCHASE_ORDER_KEYS.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<PurchaseOrderAuthorization>>(`/purchase-orders/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}
