import type {
	ActivityType,
	ApiBody,
	CreateMaintenanceKit,
	MaintenanceKit,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

export interface MaintenanceKitListFilters {
	page?: number;
	limit?: number;
	search?: string;
	activityType?: ActivityType | string;
	isActive?: boolean;
}

export interface MaintenanceKitListResponse {
	success?: boolean;
	data?: MaintenanceKit[];
	pagination?: {
		total: number;
		page: number;
		totalPages: number;
		limit: number;
	};
	error?: string;
	message?: string;
}

export interface MaintenanceKitListResult {
	items: MaintenanceKit[];
	total: number;
	page: number;
	totalPages: number;
	limit: number;
}

export type MaintenanceKitMutationInput = CreateMaintenanceKit & {
	isActive?: boolean;
};

export const MAINTENANCE_KIT_KEYS = {
	all: ["maintenance", "kits"] as const,
	list: (filters?: MaintenanceKitListFilters) =>
		[...MAINTENANCE_KIT_KEYS.all, "list", filters] as const,
	templates: (type?: string) => [...MAINTENANCE_KIT_KEYS.all, "templates", type] as const,
	detail: (id: string) => [...MAINTENANCE_KIT_KEYS.all, "detail", id] as const,
} as const;

function buildKitQueryParams(filters?: MaintenanceKitListFilters): string {
	const queryParams = new URLSearchParams();
	const page = filters?.page ?? 1;
	const limit = filters?.limit ?? 50;

	queryParams.set("limit", String(limit));
	queryParams.set("offset", String(Math.max(page - 1, 0) * limit));

	if (filters?.search?.trim()) {
		queryParams.set("search", filters.search.trim());
	}

	if (filters?.activityType && filters.activityType !== "all") {
		queryParams.set("activityType", String(filters.activityType));
	}

	if (typeof filters?.isActive === "boolean") {
		queryParams.set("isActive", String(filters.isActive));
	}

	return queryParams.toString();
}

export function useMaintenanceKits(filters?: MaintenanceKitListFilters) {
	const normalizedFilters = {
		page: filters?.page ?? 1,
		limit: filters?.limit ?? 50,
		search: filters?.search?.trim() || undefined,
		activityType:
			filters?.activityType && filters.activityType !== "all" ? filters.activityType : undefined,
		isActive: typeof filters?.isActive === "boolean" ? filters.isActive : undefined,
	} satisfies MaintenanceKitListFilters;

	return useQuery({
		queryKey: MAINTENANCE_KIT_KEYS.list(normalizedFilters),
		queryFn: async (): Promise<MaintenanceKitListResult> => {
			const queryString = buildKitQueryParams(normalizedFilters);
			const url = queryString ? `/maintenance/kits?${queryString}` : "/maintenance/kits";
			const body = await apiClient.get<MaintenanceKitListResponse>(url);
			const pagination = body?.pagination;

			return {
				items: body?.data ?? [],
				total: pagination?.total ?? body?.data?.length ?? 0,
				page: pagination?.page ?? normalizedFilters.page ?? 1,
				totalPages:
					pagination?.totalPages ??
					Math.max(
						1,
						Math.ceil(
							(pagination?.total ?? body?.data?.length ?? 0) /
								(pagination?.limit ?? normalizedFilters.limit ?? 50),
						),
					),
				limit: pagination?.limit ?? normalizedFilters.limit ?? 50,
			};
		},
		staleTime: STALE_TIMES.LIST,
	});
}

/**
 * Hook to fetch all available kit templates (hardcoded + DB)
 */
export function useKitTemplates(type?: string) {
	return useQuery({
		queryKey: MAINTENANCE_KIT_KEYS.templates(type),
		queryFn: async () => {
			const url = type ? `/maintenance/templates?type=${type}` : "/maintenance/templates";
			const body = await apiClient.get<ApiBody<MaintenanceKit[]>>(url);
			if (!body?.success) {
				return [];
			}
			return body.data;
		},
		staleTime: STALE_TIMES.LIST,
	});
}

export function useMaintenanceKit(id: string) {
	return useQuery({
		queryKey: MAINTENANCE_KIT_KEYS.detail(id),
		queryFn: async () => {
			const body = await apiClient.get<ApiBody<MaintenanceKit>>(`/maintenance/kits/${id}`);
			if (!body?.success) {
				throw new Error("Error al cargar el kit");
			}
			return body.data;
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useCreateMaintenanceKit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: MaintenanceKitMutationInput) => {
			const body = await apiClient.post<ApiBody<MaintenanceKit>>("/maintenance/kits", data);
			if (!body?.success) {
				throw new Error("Error al crear el kit");
			}
			return body.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: MAINTENANCE_KIT_KEYS.all });
		},
	});
}

export function useUpdateMaintenanceKit(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: MaintenanceKitMutationInput) => {
			const body = await apiClient.patch<ApiBody<MaintenanceKit>>(`/maintenance/kits/${id}`, data);
			if (!body?.success) {
				throw new Error("Error al actualizar el kit");
			}
			return body.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: MAINTENANCE_KIT_KEYS.detail(id) });
			void queryClient.invalidateQueries({ queryKey: MAINTENANCE_KIT_KEYS.all });
		},
	});
}

export function useDeleteMaintenanceKit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const body = await apiClient.delete<ApiBody<{ message: string }>>(`/maintenance/kits/${id}`);
			if (!body?.success) {
				throw new Error("Error al desactivar el kit");
			}
			return body.data;
		},
		onSuccess: (_data, id) => {
			void queryClient.invalidateQueries({ queryKey: MAINTENANCE_KIT_KEYS.detail(id) });
			void queryClient.invalidateQueries({ queryKey: MAINTENANCE_KIT_KEYS.all });
		},
	});
}
