"use client";

import { isAuthenticatedRole, type UserRole } from "@cermont/domain";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import { useAuthStore } from "@/store/auth.store";

/** Shape of the user object returned by auth API */
interface AuthUserResponse {
	_id?: string;
	id?: string;
	email?: string | null;
	name?: string | null;
	role?: string;
}

/** Canonical user type shared between auth store and consumers */
export interface AuthUser {
	id: string;
	email: string | null;
	name: string | null;
	role: UserRole;
}

function toUser(input: AuthUserResponse): AuthUser {
	const role = isAuthenticatedRole(input.role) ? input.role : "cliente";
	return {
		id: input.id ?? input._id ?? "",
		email: input.email ?? null,
		name: input.name ?? null,
		role,
	};
}

// ── Login mutation ────────────────────────────────────────────────────────────

interface LoginVariables {
	email: string;
	password: string;
}

interface LoginResponse {
	success: boolean;
	data: {
		accessToken: string;
		expiresIn: number;
		user: AuthUserResponse;
	};
}

// ── Refresh response ──────────────────────────────────────────────────────────

interface RefreshResponse {
	success: boolean;
	data: {
		accessToken: string;
		expiresIn: number;
	};
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Read-only access to auth state (user, isAuthenticated, accessToken) */
function useAuthState() {
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const accessToken = useAuthStore((state) => state.accessToken);

	return {
		user: user as AuthUser | null,
		isAuthenticated,
		isLoading: false,
		accessToken,
	};
}

/** Auth actions (login, logout, refresh) — all use TanStack Query useMutation */
export function useAuthActions() {
	const { setAuth, clearAuth, setAccessToken } = useAuthStore();

	const loginMutation = useMutation({
		mutationFn: async ({ email, password }: LoginVariables) => {
			const response = await apiClient.post<LoginResponse>("/auth/login", { email, password });

			if (response?.success && response.data) {
				return response.data;
			}

			const error = response as { error?: { message?: string } };
			throw new Error(error.error?.message || "Login failed");
		},
		onSuccess: (data) => {
			const user = toUser(data.user);
			setAuth(user, data.accessToken);
		},
	});

	/** Login with email + password — wraps useMutation for convenient call-site API */
	const login = (email: string, password: string) => loginMutation.mutateAsync({ email, password });

	const logoutMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post("/auth/logout");
		},
		onSuccess: () => {
			clearAuth();
		},
		onError: () => {
			clearAuth();
		},
	});

	const refreshMutation = useMutation({
		mutationFn: async () => {
			const response = await apiClient.post<RefreshResponse>("/auth/refresh");

			if (response?.success && response.data) {
				return response.data;
			}

			throw new Error("Token refresh failed");
		},
		onSuccess: (data) => {
			setAccessToken(data.accessToken);
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
