import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";
import type { UserDetail } from "..";

export const USERS_KEYS = {
	all: ["users"] as const,
	list: (filters?: Record<string, unknown>) => [...USERS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...USERS_KEYS.all, "detail", id] as const,
} as const;

export function useUser(id: string) {
	return useQuery({
		queryKey: USERS_KEYS.detail(id),
		queryFn: async () => {
			const body = await apiClient.get<UserDetail>(`/users/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "Error al cargar usuario");
			}
			return body.data;
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}
