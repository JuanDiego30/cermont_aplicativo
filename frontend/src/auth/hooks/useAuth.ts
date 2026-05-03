"use client";

import { normalizeUserRole, type UserRole } from "@cermont/shared-types/rbac";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/_shared/lib/http/api-client";
import { useAuthStore } from "@/_shared/store/auth.store";

/** Shape of the user object returned by auth API */
export interface AuthUserRecord {
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

export function toUser(input: AuthUserRecord): AuthUser {
	const roleInput = input.role;
	const role = typeof roleInput === "string" ? normalizeUserRole(roleInput) : false;
	const inputId = input.id;
	const input_id = input._id;
	const email = input.email;
	const name = input.name;

	return {
		id: inputId || input_id || "",
		email: email || null,
		name: name || null,
		role: role || "client",
	};
}

// ── Login mutation ────────────────────────────────────────────────────────────

interface LoginVariables {
	email: string;
	password: string;
}

// ── Refresh response ──────────────────────────────────────────────────────────

interface RefreshResponse {
	success: true;
	data: {
		accessToken: string;
		expiresIn: number;
	};
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Read-only access to auth state (user, isAuthenticated, accessToken) */
export function useAuthState() {
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
			// Login goes through the Next.js Route Handler at /api/auth/login
			// which manually forwards Set-Cookie headers from the backend.
			// Using apiClient would route via /api/backend/auth/login (rewrite)
			// which silently drops Set-Cookie — breaking the refresh flow.
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
				credentials: "include",
			});

			interface LoginSuccess {
				success: true;
				data: {
					accessToken: string;
					expiresIn: number;
					user: AuthUserRecord;
				};
			}

			interface LoginFailure {
				success: false;
				error: {
					message: string;
				};
			}

			const response = (await res.json()) as LoginSuccess | LoginFailure;

			if (response.success) {
				return response.data;
			}

			const errorMessage = response.error.message || "Login failed";
			throw new Error(errorMessage);
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
