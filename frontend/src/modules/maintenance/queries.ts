import type { ActivityType, CreateMaintenanceKit, MaintenanceKit } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

export interface MaintenanceKitListFilters {
	page?: number;
	limit?: number;
	search?: string;
	activityType?: ActivityType | string;
	isActive?: boolean;
}

export interface MaintenanceKitListContract {
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

export interface MaintenanceKitListEnvelope {
	items: MaintenanceKit[];
	total: number;
	page: number;
	totalPages: number;
	limit: number;
}

export type MaintenanceKitMutationInput = CreateMaintenanceKit & {
	isActive?: boolean;
	imageUrls?: string[];
};

const MAINTENANCE_KIT_KEYS = {
	all: ["maintenance", "kits"] as const,
	list: (filters?: MaintenanceKitListFilters) =>
		[...MAINTENANCE_KIT_KEYS.all, "list", filters] as const,
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
		queryFn: async (): Promise<MaintenanceKitListEnvelope> => {
			const queryString = buildKitQueryParams(normalizedFilters);
			const url = queryString ? `/maintenance/kits?${queryString}` : "/maintenance/kits";
			const body = await apiClient.get<MaintenanceKitListContract>(url);
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
