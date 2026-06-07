"use client";

import { resolveUserRole, type UserRole } from "@cermont/domain";
import { getValue, isPresent } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import { useAuthStore } from "@/store/auth.store";

/** Shape of the user object returned by auth API */
interface AuthUserContract {
	_id?: string;
	id?: string;
	email?: string | null;
	name?: string | null;
	role?: string;
}

/** Canonical user type shared between auth store and consumers */
export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

function toUser(input: AuthUserContract): AuthUser {
	const role = resolveUserRole(input.role);
	return {
		id: input.id ?? input._id ?? "",
		email: input.email ?? "",
		name: input.name ?? "",
		role,
	};
}

// ── Login mutation ────────────────────────────────────────────────────────────

interface LoginVariables {
	email: string;
	password: string;
}

interface LoginContract {
	success: boolean;
	data: {
		accessToken: string;
		expiresIn: number;
		user: AuthUserContract;
	};
}

// ── Refresh response ──────────────────────────────────────────────────────────

interface RefreshContract {
	success: boolean;
	data: {
		accessToken: string;
		expiresIn: number;
	};
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Read-only access to auth state (user, isAuthenticated, accessToken) */
function useAuthState() {
	const userStatus = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const accessTokenStatus = useAuthStore((state) => state.accessToken);

	return {
		user: isPresent(userStatus) ? userStatus.value : null,
		isAuthenticated,
		isLoading: false,
		accessToken: getValue(accessTokenStatus, null),
	};
}

/** Auth actions (login, logout, refresh) — all use TanStack Query useMutation */
export function useAuthActions() {
	const queryClient = useQueryClient();
	const { setAuth, clearAuth, setAccessToken } = useAuthStore();

	const loginMutation = useMutation({
		networkMode: "always",
		mutationFn: async ({ email, password }: LoginVariables) => {
			const response = await apiClient.post<LoginContract>("/auth/login", { email, password });

			if (response?.success && response.data) {
				return response.data;
			}

			const error = response as { error?: { message?: string } };
			throw new Error(error.error?.message || "Login failed");
		},
		onSuccess: (data) => {
			const user = toUser(data.user);
			setAuth(user, data.accessToken);
			void queryClient.invalidateQueries();
		},
	});

	/** Login with email + password — wraps useMutation for convenient call-site API */
	const login = (email: string, password: string) => loginMutation.mutateAsync({ email, password });

	const logoutMutation = useMutation({
		networkMode: "always",
		mutationFn: async () => {
			await apiClient.post("/auth/logout");
		},
		onSuccess: () => {
			clearAuth();
			void queryClient.invalidateQueries();
			queryClient.clear();
		},
		onError: () => {
			clearAuth();
			void queryClient.invalidateQueries();
			queryClient.clear();
		},
	});

	const refreshMutation = useMutation({
		networkMode: "always",
		mutationFn: async () => {
			const response = await apiClient.post<RefreshContract>("/auth/refresh");

			if (response?.success && response.data) {
				return response.data;
			}

			throw new Error("Token refresh failed");
		},
		onSuccess: (data) => {
			setAccessToken(data.accessToken);
			void queryClient.invalidateQueries();
		},
		onError: () => {
			clearAuth();
		},
	});

	const isLoading =
		loginMutation.isPending || logoutMutation.isPending || refreshMutation.isPending;

	return {
		login,
		logout: logoutMutation.mutateAsync,
		refresh: refreshMutation.mutateAsync,
		isLoading,
		/** Expose raw mutation objects for advanced use (e.g. loginMutation.error) */
		loginMutation,
		logoutMutation,
		refreshMutation,
	};
}

/** Convenience hook combining state + actions */
export function useAuth() {
	const state = useAuthState();
	const actions = useAuthActions();

	return {
		...state,
		...actions,
	};
}
