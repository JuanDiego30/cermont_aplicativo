import type {
	ApiEnvelope,
	Cost,
	CostCatalogItem,
	CostCatalogList,
	CostCategory,
	CostIntelligenceSummary,
	CostResponse as CostSnapshot,
	CostSummary,
	CreateCostCatalogItemInput,
	CreateCostInput,
	ListCostCatalogQuery,
	UpdateCostInput,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";

export interface CostListFilters {
	orderId?: string;
	status?: string;
	category?: CostCategory;
	page?: number;
	limit?: number;
}

export interface CostListQuery {
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

type CostDetailApiEnvelope = ApiEnvelope<CostSnapshot>;

type LegacySummaryEnvelope = ApiEnvelope<Array<Record<string, unknown>>>;
type CostCatalogApiEnvelope = ApiEnvelope<CostCatalogList>;
type CostCatalogItemApiEnvelope = ApiEnvelope<CostCatalogItem>;

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
	catalogRoot: ["costs", "catalog"] as const,
	catalog: (filters: Partial<ListCostCatalogQuery>) => ["costs", "catalog", filters] as const,
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

function buildCatalogQueryString(filters: Partial<ListCostCatalogQuery>): string {
	const params = new URLSearchParams();
	if (filters.category) {
		params.set("category", filters.category);
	}
	if (typeof filters.page === "number") {
		params.set("page", String(filters.page));
	}
	if (typeof filters.limit === "number") {
		params.set("limit", String(filters.limit));
	}
	if (filters.search?.trim()) {
		params.set("search", filters.search.trim());
	}
	return params.toString();
}

function toCostListResult(body?: CostListApiEnvelope): CostListQuery {
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

function mapLegacySummaryItems(rows?: Array<Record<string, unknown>>): CostLegacySummaryItem[] {
	return (rows ?? []).map((row) => {
		return {
			type: String(row.type ?? row.category ?? "other"),
			amount: Number(
				row.amount ?? row.actualAmount ?? row.actual ?? row.totalActual ?? row.total ?? 0,
			),
		};
	});
}

export function useCostCatalog(filters: Partial<ListCostCatalogQuery> = {}) {
	return useQuery({
		queryKey: COSTS_KEYS.catalog(filters),
		queryFn: async (): Promise<CostCatalogList> => {
			const queryString = buildCatalogQueryString(filters);
			const body = await apiClient.get<CostCatalogApiEnvelope>(
				`/costs/catalog${queryString ? `?${queryString}` : ""}`,
			);

			if (body?.success === false || !body?.data) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el catálogo de costos"));
			}
			return body.data;
		},
		staleTime: CACHE_CONFIG.STATIC,
	});
}

export function useCreateCostCatalogItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: CreateCostCatalogItemInput): Promise<CostCatalogItem> => {
			const body = await apiClient.post<CostCatalogItemApiEnvelope>("/costs/catalog", input);
			if (body?.success === false || !body?.data) {
				throw new Error(getApiErrorMessage(body, "No se pudo crear el ítem del catálogo"));
			}
			return body.data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: COSTS_KEYS.catalogRoot }),
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
		queryFn: async (): Promise<CostListQuery> => {
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
		queryFn: async (): Promise<CostListQuery> => {
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

export function useCostIntelligence(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: [...COSTS_KEYS.all, "intelligence", normalizedOrderId] as const,
		queryFn: async (): Promise<CostIntelligenceSummary> => {
			const body = await apiClient.get<ApiEnvelope<CostIntelligenceSummary>>(
				`/costs/${encodeURIComponent(normalizedOrderId)}/intelligence`,
			);

			if (body?.success === false || !body?.data) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar la inteligencia de costos"));
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
		queryFn: async (): Promise<CostSnapshot> => {
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
		mutationKey: OFFLINE_MUTATION_KEYS.costCreate,
		mutationFn: async (data: CreateCostInput): Promise<CostSnapshot> => {
			const body = await apiClient.post<CostDetailApiEnvelope>("/costs", data);

			if (body && typeof body === "object" && "success" in body && body.success === false) {
				throw new Error(getApiErrorMessage(body, "Failed to create cost"));
			}

			return (body as CostDetailApiEnvelope)?.data ?? (body as unknown as CostSnapshot);
		},
		networkMode: "offlineFirst",
		retry: 0,
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
		mutationKey: OFFLINE_MUTATION_KEYS.costUpdate,
		mutationFn: async (data: UpdateCostInput): Promise<CostSnapshot> => {
			const body = await apiClient.patch<CostDetailApiEnvelope>(
				`/costs/${encodeURIComponent(normalizedCostId)}`,
				data,
			);

			if (body && typeof body === "object" && "success" in body && body.success === false) {
				throw new Error(getApiErrorMessage(body, "Failed to update cost"));
			}

			return (body as CostDetailApiEnvelope)?.data ?? (body as unknown as CostSnapshot);
		},
		networkMode: "offlineFirst",
		retry: 0,
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
		mutationKey: OFFLINE_MUTATION_KEYS.costDelete,
		mutationFn: async (costId: string): Promise<CostSnapshot> => {
			const body = await apiClient.delete<CostDetailApiEnvelope>(
				`/costs/${encodeURIComponent(costId)}`,
			);

			if (body && typeof body === "object" && "success" in body && body.success === false) {
				throw new Error(getApiErrorMessage(body, "Failed to delete cost"));
			}

			return (body as CostDetailApiEnvelope)?.data ?? (body as unknown as CostSnapshot);
		},
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: (deletedCost) => {
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.detail(deletedCost._id) });
			queryClient.invalidateQueries({ queryKey: ["orders", deletedCost.orderId] });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(deletedCost.orderId) });
			queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(deletedCost.orderId) });
		},
	});
}
