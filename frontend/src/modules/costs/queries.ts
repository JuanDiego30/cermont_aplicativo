import type {
	ApiEnvelope,
	Cost,
	CostCategory,
	CostResponse,
	CostSummary,
	CreateCostInput,
	UpdateCostInput,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

export interface CostListFilters {
	orderId?: string;
	status?: string;
	category?: CostCategory;
	page?: number;
	limit?: number;
}

export interface CostListResult {
	costs: Cost[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}

export interface CostLegacySummaryItem {
	type: string;
	amount: number;
	estimated?: number;
	actual?: number;
	tax?: number;
	variance?: number;
}

interface CostListApiEnvelope extends ApiEnvelope<Cost[]> {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
}

type CostSummaryApiEnvelope = ApiEnvelope<CostSummary>;

type CostDetailApiEnvelope = ApiEnvelope<CostResponse>;

type LegacySummaryEnvelope = ApiEnvelope<Array<Record<string, unknown>>>;

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

export const COSTS_KEYS = {
	all: ["costs"] as const,
	list: (filters?: CostListFilters) => [...COSTS_KEYS.all, "list", filters] as const,
	orderList: (orderId: string, filters?: Omit<CostListFilters, "orderId">) =>
		[...COSTS_KEYS.all, "order-list", orderId, filters] as const,
	detail: (id: string) => [...COSTS_KEYS.all, "detail", id] as const,
	summary: (orderId: string) => [...COSTS_KEYS.all, "summary", orderId] as const,
	legacyList: (filters?: CostListFilters) => [...COSTS_KEYS.all, "legacy-list", filters] as const,
	legacySummary: (orderId: string) => [...COSTS_KEYS.all, "legacy-summary", orderId] as const,
} as const;

function buildQueryString(filters?: CostListFilters): string {
	const params = new URLSearchParams();

	if (filters?.status) {
		params.set("status", filters.status);
	}

	if (filters?.orderId?.trim()) {
		params.set("orderId", filters.orderId.trim());
	}

	if (filters?.category) {
		params.set("category", filters.category);
	}

	if (typeof filters?.page === "number") {
		params.set("page", String(filters.page));
	}

	if (typeof filters?.limit === "number") {
		params.set("limit", String(filters.limit));
	}

	return params.toString();
}

function toCostListResult(body?: CostListApiEnvelope | null): CostListResult {
	const meta = body?.meta ?? {};
	const costs = body?.data ?? [];
	const total = meta.total ?? costs.length;
	const page = meta.page ?? 1;
	const limit = meta.limit ?? 20;
	const pages = meta.pages ?? Math.max(Math.ceil(total / Math.max(limit, 1)), 1);

	return {
		costs,
		total,
		page,
		limit,
		pages,
	};
}

function mapLegacySummaryItems(
	rows?: Array<Record<string, unknown>> | null,
): CostLegacySummaryItem[] {
	return (rows ?? []).map((row) => {
		return {
			type: String(row.type ?? row.category ?? "other"),
			amount: Number(
				row.amount ?? row.actualAmount ?? row.actual ?? row.totalActual ?? row.total ?? 0,
			),
		};
	});
}

export function useOrderCosts(orderId: string, filters?: Omit<CostListFilters, "orderId">) {
	const normalizedFilters = {
		orderId: orderId.trim(),
		category: filters?.category,
		page: filters?.page,
		limit: filters?.limit,
	} satisfies CostListFilters;

	return useQuery({
		queryKey: COSTS_KEYS.orderList(normalizedFilters.orderId, filters),
		queryFn: async (): Promise<CostListResult> => {
			const queryString = buildQueryString(normalizedFilters);
			const url = queryString ? `/costs?${queryString}` : "/costs";
			const body = await apiClient.get<CostListApiEnvelope>(url);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudieron cargar los costos"));
			}

			return toCostListResult(body);
		},
		enabled: !!normalizedFilters.orderId,
		staleTime: CACHE_CONFIG.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useCostList(filters?: CostListFilters, options?: { enabled?: boolean }) {
	const normalizedFilters = {
		orderId: filters?.orderId?.trim() || undefined,
		category: filters?.category,
		page: filters?.page,
		limit: filters?.limit,
	} satisfies CostListFilters;

	return useQuery({
		queryKey: COSTS_KEYS.list(normalizedFilters),
		queryFn: async (): Promise<CostListResult> => {
			const queryString = buildQueryString(normalizedFilters);
			const url = queryString ? `/costs?${queryString}` : "/costs";
			const body = await apiClient.get<CostListApiEnvelope>(url);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudieron cargar los costos"));
			}

			return toCostListResult(body);
		},
		enabled: options?.enabled ?? true,
		staleTime: CACHE_CONFIG.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useCosts(filters?: CostListFilters) {
	const normalizedFilters = {
		orderId: filters?.orderId?.trim() || undefined,
		status: filters?.status,
		category: filters?.category,
		page: filters?.page,
		limit: filters?.limit,
	} satisfies CostListFilters;

	return useQuery({
		queryKey: COSTS_KEYS.legacyList(normalizedFilters),
		queryFn: async (): Promise<Cost[]> => {
			if (!normalizedFilters.orderId) {
				return [];
			}

			const queryString = buildQueryString(normalizedFilters);
			const url = `/costs/order/${encodeURIComponent(normalizedFilters.orderId)}${queryString ? `?${queryString}` : ""}`;
			const body = await apiClient.get<CostListApiEnvelope>(url);

			if (body?.success === false) {
				return [];
			}

			return body?.data ?? [];
		},
		enabled: !!normalizedFilters.orderId,
		staleTime: CACHE_CONFIG.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useOrderCostSummary(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: COSTS_KEYS.summary(normalizedOrderId),
		queryFn: async (): Promise<CostSummary> => {
			const body = await apiClient.get<CostSummaryApiEnvelope>(
				`/costs/order/${encodeURIComponent(normalizedOrderId)}/summary`,
			);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el resumen de costos"));
			}

			if (!body?.data) {
				throw new Error("No se pudo cargar el resumen de costos");
			}

			return body.data;
		},
		enabled: !!normalizedOrderId,
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useCostSummary(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: COSTS_KEYS.legacySummary(normalizedOrderId),
		queryFn: async (): Promise<CostLegacySummaryItem[]> => {
			const body = await apiClient.get<LegacySummaryEnvelope>(
				`/costs/order/${encodeURIComponent(normalizedOrderId)}`,
			);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el resumen de costos"));
			}

			return mapLegacySummaryItems(body?.data ?? []);
		},
		enabled: !!normalizedOrderId,
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useCost(id: string) {
	const normalizedId = id.trim();

	return useQuery({
		queryKey: COSTS_KEYS.detail(normalizedId),
		queryFn: async (): Promise<CostResponse> => {
			const body = await apiClient.get<CostDetailApiEnvelope>(
				`/costs/${encodeURIComponent(normalizedId)}`,
			);

			if (body?.success === false) {
				throw new Error(getApiErrorMessage(body, "Error al cargar costo"));
			}

			if (!body?.data) {
				throw new Error("Error al cargar costo");
			}

			return body.data;
		},
		enabled: !!normalizedId,
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useCreateCost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCostInput): Promise<CostResponse> => {
			const body = await apiClient.post<CostDetailApiEnvelope>("/costs", data);

			if (body && typeof body === "object" && "success" in body && body.success === false) {
				throw new Error(getApiErrorMessage(body, "Failed to create cost"));
			}

			return (body as CostDetailApiEnvelope)?.data ?? (body as unknown as CostResponse);
		},
		onSuccess: (createdCost) => {
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: ["orders", createdCost.orderId] });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(createdCost.orderId) });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(createdCost.orderId) });
		},
	});
}

export function useUpdateCost(costId: string) {
	const queryClient = useQueryClient();
	const normalizedCostId = costId.trim();

	return useMutation({
		mutationFn: async (data: UpdateCostInput): Promise<CostResponse> => {
			const body = await apiClient.patch<CostDetailApiEnvelope>(
				`/costs/${encodeURIComponent(normalizedCostId)}`,
				data,
			);

			if (body && typeof body === "object" && "success" in body && body.success === false) {
				throw new Error(getApiErrorMessage(body, "Failed to update cost"));
			}

			return (body as CostDetailApiEnvelope)?.data ?? (body as unknown as CostResponse);
		},
		onSuccess: (updatedCost) => {
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.detail(normalizedCostId) });
			queryClient.invalidateQueries({ queryKey: ["orders", updatedCost.orderId] });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(updatedCost.orderId) });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(updatedCost.orderId) });
		},
	});
}

export function useDeleteCost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (costId: string): Promise<CostResponse> => {
			const body = await apiClient.delete<CostDetailApiEnvelope>(
				`/costs/${encodeURIComponent(costId)}`,
			);

			if (body && typeof body === "object" && "success" in body && body.success === false) {
				throw new Error(getApiErrorMessage(body, "Failed to delete cost"));
			}

			return (body as CostDetailApiEnvelope)?.data ?? (body as unknown as CostResponse);
		},
		onSuccess: (deletedCost) => {
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.detail(deletedCost._id) });
			queryClient.invalidateQueries({ queryKey: ["orders", deletedCost.orderId] });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(deletedCost.orderId) });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(deletedCost.orderId) });
		},
	});
}
