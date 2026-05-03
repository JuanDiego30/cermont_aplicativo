import type {
	ApiBody,
	Cost,
	CostCategory,
	CostResponse,
	CostSummary,
	CreateCostInput,
	CreateTariffInput,
	Tariff,
	UpdateCostControl,
	UpdateCostInput,
	UpdateTariffInput,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG, STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

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

export interface CostOrderSummaryItem {
	type: string;
	amount: number;
	estimated?: number;
	actual?: number;
	tax?: number;
	variance?: number;
}

interface LegacySummaryRow {
	type?: string;
	category?: string;
	amount?: number;
	actualAmount?: number;
	actual?: number;
	totalActual?: number;
	total?: number;
}

export interface UpdateCostVariables extends UpdateCostInput {
	costId: string;
}

interface CostListApiBody extends ApiBody<Cost[]> {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
}

type CostSummaryApiBody = ApiBody<CostSummary>;

type CostDetailApiBody = ApiBody<CostResponse>;

type LegacySummaryEnvelope = ApiBody<LegacySummaryRow[]>;

interface ApiErrorMessageBody {
	message?: string;
	error?: string | null;
}

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

export const COSTS_KEYS = {
	all: ["costs"] as const,
	list: (filters?: CostListFilters) => [...COSTS_KEYS.all, "list", filters] as const,
	orderList: (orderId: string, filters?: Omit<CostListFilters, "orderId">) =>
		[...COSTS_KEYS.all, "order-list", orderId, filters] as const,
	detail: (id: string) => [...COSTS_KEYS.all, "detail", id] as const,
	summary: (orderId: string) => [...COSTS_KEYS.all, "summary", orderId] as const,
	dashboard: () => [...COSTS_KEYS.all, "dashboard"] as const,
	tariffs: () => [...COSTS_KEYS.all, "tariffs"] as const,
	orderPathList: (filters?: CostListFilters) =>
		[...COSTS_KEYS.all, "order-path-list", filters] as const,
	orderPathSummary: (orderId: string) =>
		[...COSTS_KEYS.all, "order-path-summary", orderId] as const,
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

function toCostListResult(body?: CostListApiBody | null): CostListResult {
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

function mapOrderSummaryItems(rows?: LegacySummaryRow[] | null): CostOrderSummaryItem[] {
	return (rows ?? []).map((row) => {
		return {
			type: String(row.type ?? row.category ?? "other"),
			amount: Number(
				row.amount ?? row.actualAmount ?? row.actual ?? row.totalActual ?? row.total ?? 0,
			),
		};
	});
}

function getRequiredCostDetail(body: CostDetailApiBody, fallback: string): CostResponse {
	if (!body.success) {
		throw new Error(getApiErrorMessage(body, fallback));
	}

	if (!body.data) {
		throw new Error(fallback);
	}

	return body.data;
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
			const body = await apiClient.get<CostListApiBody>(url);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudieron cargar los costos"));
			}

			return toCostListResult(body);
		},
		enabled: !!normalizedFilters.orderId,
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
		queryKey: COSTS_KEYS.orderPathList(normalizedFilters),
		queryFn: async (): Promise<Cost[]> => {
			if (!normalizedFilters.orderId) {
				return [];
			}

			const queryString = buildQueryString(normalizedFilters);
			const url = `/costs/order/${encodeURIComponent(normalizedFilters.orderId)}${queryString ? `?${queryString}` : ""}`;
			const body = await apiClient.get<CostListApiBody>(url);

			if (!body.success) {
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
			const body = await apiClient.get<CostSummaryApiBody>(
				`/costs/order/${encodeURIComponent(normalizedOrderId)}/summary`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el resumen de costos"));
			}

			if (!body.data) {
				throw new Error("No se pudo cargar el resumen de costos");
			}

			return body.data;
		},
		enabled: !!normalizedOrderId,
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

/**
 * Hook to fetch global cost metrics and comparison cross-orders
 */
export function useCostDashboard() {
	return useQuery({
		queryKey: COSTS_KEYS.dashboard(),
		queryFn: async (): Promise<CostSummary> => {
			const body = await apiClient.get<ApiBody<CostSummary>>("/costs/dashboard");
			if (!body?.success) {
				throw new Error(getApiErrorMessage(body, "Error al cargar el dashboard de costos"));
			}
			return body.data;
		},
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function useTariffs() {
	return useQuery({
		queryKey: COSTS_KEYS.tariffs(),
		queryFn: async (): Promise<Tariff[]> => {
			const body = await apiClient.get<ApiBody<Tariff[]>>("/costs/tariffs");
			if (!body?.success) {
				throw new Error(getApiErrorMessage(body, "No se pudieron cargar las tarifas"));
			}
			return body.data ?? [];
		},
		staleTime: STALE_TIMES.LIST,
	});
}

export function useCreateTariff() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTariffInput): Promise<Tariff> => {
			const body = await apiClient.post<ApiBody<Tariff>>("/costs/tariffs", data);
			if (!body.success || !body.data) {
				throw new Error(getApiErrorMessage(body, "No se pudo crear la tarifa"));
			}
			return body.data;
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.tariffs() }),
	});
}

export function useUpdateTariff() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { id: string; data: UpdateTariffInput }): Promise<Tariff> => {
			const body = await apiClient.patch<ApiBody<Tariff>>(
				`/costs/tariffs/${encodeURIComponent(params.id)}`,
				params.data,
			);
			if (!body.success || !body.data) {
				throw new Error(getApiErrorMessage(body, "No se pudo actualizar la tarifa"));
			}
			return body.data;
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.tariffs() }),
	});
}

export function useCalculateLaborCost(orderId: string) {
	const queryClient = useQueryClient();
	const normalizedOrderId = orderId.trim();

	return useMutation({
		mutationFn: async (): Promise<CostResponse> => {
			const body = await apiClient.post<ApiBody<CostResponse>>(
				`/costs/calculate-labor/${encodeURIComponent(normalizedOrderId)}`,
				{},
			);
			if (!body.success || !body.data) {
				throw new Error(getApiErrorMessage(body, "No se pudo calcular la mano de obra"));
			}
			return body.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(normalizedOrderId) });
			void queryClient.invalidateQueries({ queryKey: ["orders", normalizedOrderId] });
		},
	});
}

export function useCostSummary(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: COSTS_KEYS.orderPathSummary(normalizedOrderId),
		queryFn: async (): Promise<CostOrderSummaryItem[]> => {
			const body = await apiClient.get<LegacySummaryEnvelope>(
				`/costs/order/${encodeURIComponent(normalizedOrderId)}`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "No se pudo cargar el resumen de costos"));
			}

			return mapOrderSummaryItems(body?.data ?? []);
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
			const body = await apiClient.get<CostDetailApiBody>(
				`/costs/${encodeURIComponent(normalizedId)}`,
			);

			if (!body.success) {
				throw new Error(getApiErrorMessage(body, "Error al cargar costo"));
			}

			if (!body.data) {
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
			const body = await apiClient.post<CostDetailApiBody>("/costs", data);
			return getRequiredCostDetail(body, "Failed to create cost");
		},
		onSuccess: (createdCost) => {
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: ["orders", createdCost.orderId] });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(createdCost.orderId) });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(createdCost.orderId) });
		},
	});
}

export function useUpdateCost(costId: string) {
	const queryClient = useQueryClient();
	const normalizedCostId = costId.trim();

	return useMutation({
		mutationFn: async (data: UpdateCostInput): Promise<CostResponse> => {
			const body = await apiClient.patch<CostDetailApiBody>(
				`/costs/${encodeURIComponent(normalizedCostId)}`,
				data,
			);
			return getRequiredCostDetail(body, "Failed to update cost");
		},
		onSuccess: (updatedCost) => {
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.detail(normalizedCostId) });
			void queryClient.invalidateQueries({ queryKey: ["orders", updatedCost.orderId] });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(updatedCost.orderId) });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(updatedCost.orderId) });
		},
	});
}

export function useDeleteCost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (costId: string): Promise<CostResponse> => {
			const body = await apiClient.delete<CostDetailApiBody>(
				`/costs/${encodeURIComponent(costId)}`,
			);
			return getRequiredCostDetail(body, "Failed to delete cost");
		},
		onSuccess: (deletedCost) => {
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.detail(deletedCost._id) });
			void queryClient.invalidateQueries({ queryKey: ["orders", deletedCost.orderId] });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.orderList(deletedCost.orderId) });
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(deletedCost.orderId) });
		},
	});
}

interface CostControlData {
	_id?: string;
	orderId: string;
	currency: string;
	budgetEstimated: number;
	budgetApproved: number;
	actualItems: Array<{
		category: string;
		description: string;
		unit?: string;
		quantity: number;
		unitPrice: number;
		total: number;
		isBudgeted: boolean;
		notes?: string;
	}>;
	actualTotal: number;
	variance: number;
	variancePct: number;
	closed: boolean;
	closedAt?: string;
	notes?: string;
}

export function useCostControl(orderId: string) {
	return useQuery({
		queryKey: [...COSTS_KEYS.all, "control", orderId] as const,
		queryFn: async (): Promise<CostControlData> => {
			const body = await apiClient.get<ApiBody<CostControlData>>(
				`/costs/order/${encodeURIComponent(orderId.trim())}/control`,
			);
			if (!body.success || !body.data) {
				throw new Error("No se pudo cargar el control presupuestal");
			}
			return body.data;
		},
		enabled: !!orderId.trim(),
		staleTime: CACHE_CONFIG.REALTIME,
		retry: false,
	});
}

export function useUpdateCostControl(orderId: string) {
	const queryClient = useQueryClient();
	const normalizedOrderId = orderId.trim();

	return useMutation({
		mutationFn: async (data: UpdateCostControl): Promise<CostControlData> => {
			const body = await apiClient.patch<ApiBody<CostControlData>>(
				`/costs/order/${encodeURIComponent(normalizedOrderId)}/control`,
				data,
			);
			if (!body.success || !body.data) {
				throw new Error("No se pudo actualizar el control presupuestal");
			}
			return body.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [...COSTS_KEYS.all, "control", normalizedOrderId],
			});
			void queryClient.invalidateQueries({ queryKey: COSTS_KEYS.summary(normalizedOrderId) });
		},
	});
}
