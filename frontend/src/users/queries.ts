import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";
import type { CreateUserInput, UpdateUserInput, User, UserDetail, UserList } from "./types";

export type { CreateUserInput, UpdateUserInput, User, UserDetail, UserList };

// ── Query Keys ────────────────────────────────────────────────
export const USERS_KEYS = {
	all: ["users"] as const,
	list: (filters?: Record<string, unknown>) => [...USERS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...USERS_KEYS.all, "detail", id] as const,
} as const;

// ── Plain Functions ──────────────────────────────────────────
export async function getUsers(filters?: Record<string, unknown>): Promise<User[]> {
	const queryParams = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				queryParams.set(key, String(value));
			}
		});
	}
	const queryString = queryParams.toString();
	const url = queryString ? `/users?${queryString}` : "/users";
	const body = await apiClient.get<UserList>(url);
	return body?.data ?? [];
}

export async function getUserById(id: string): Promise<User | undefined> {
	const body = await apiClient.get<UserDetail>(`/users/${id}`);
	if (!body?.success) {
		throw new Error(body?.message || body?.error || "Error al cargar usuario");
	}
	return body.data;
}

// ── Queries ───────────────────────────────────────────────────
export function useUsers(filters?: Record<string, unknown>) {
	return useQuery({
		queryKey: USERS_KEYS.list(filters),
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
			const url = queryString ? `/users?${queryString}` : "/users";
			const body = await apiClient.get<UserList>(url);
			return body?.data ?? [];
		},
		staleTime: 30_000,
	});
}

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

// ── Mutations ─────────────────────────────────────────────────
export function useCreateUser() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateUserInput) => apiClient.post<User>("/users", data),
		onSuccess: () => void qc.invalidateQueries({ queryKey: USERS_KEYS.all }),
	});
}

export function useUpdateUser(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateUserInput) => apiClient.put<User>(`/users/${id}`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: USERS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: USERS_KEYS.all });
		},
	});
}

export function useDeleteUser() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
		onSuccess: () => void qc.invalidateQueries({ queryKey: USERS_KEYS.all }),
	});
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: { currentPassword: string; newPassword: string }) =>
			apiClient.patch<{ success: true; data: { message: string } }>("/auth/change-password", data),
	});
}

export function useUpdateUserPassword() {
	return useChangePassword();
}
