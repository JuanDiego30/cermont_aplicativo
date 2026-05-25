"use client";

import { isAuthenticatedRole, type UserRole } from "@cermont/domain";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ApiError, apiClient } from "@/lib/http/api-client";
import { useAuthStore } from "@/store/auth.store";

interface User {
	id: string;
	email: string | null;
	name: string | null;
	role: UserRole;
}

type AuthUserResponse = {
	_id?: string;
	id?: string;
	email?: string | null;
	name?: string | null;
	role?: string;
};

function toUser(input: AuthUserResponse): User {
	const role = isAuthenticatedRole(input.role) ? input.role : "cliente";
	return {
		id: input.id ?? input._id ?? "",
		email: input.email ?? null,
		name: input.name ?? null,
		role,
	};
}

const PUBLIC_AUTH_PATHS = [
	"/",
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/unauthorized",
];

function isPublicAuthPath(pathname: string): boolean {
	return PUBLIC_AUTH_PATHS.some((path) =>
		path === "/" ? pathname === "/" : pathname.startsWith(path),
	);
}

type AuthStoreSnapshot = ReturnType<typeof useAuthStore.getState>;

async function refreshSessionToken(authStore: AuthStoreSnapshot): Promise<string | null> {
	try {
		const refreshResponse = await apiClient.post<{
			success: boolean;
			data: { accessToken: string };
		}>("/auth/refresh");

		if (refreshResponse?.success && refreshResponse.data?.accessToken) {
			authStore.setAccessToken(refreshResponse.data.accessToken);
			return refreshResponse.data.accessToken;
		}
	} catch {
		authStore.clearAuth();
		return null;
	}

	return null;
}

async function loadAuthenticatedUser(
	authStore: AuthStoreSnapshot,
	sessionToken: string,
): Promise<User | null> {
	try {
		const response = await apiClient.get<{ success: boolean; data: AuthUserResponse }>("/auth/me");
		if (response?.success && response.data) {
			const parsedUser = toUser(response.data);
			authStore.setAuth(parsedUser, sessionToken);
			return parsedUser;
		}
	} catch (error) {
		if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
			authStore.clearAuth();
			return null;
		}
		authStore.clearAuth();
		return null;
	}

	authStore.clearAuth();
	return null;
}

async function initializeAuthSession(isPublicAuthRoute: boolean): Promise<User | null> {
	const authStore = useAuthStore.getState();
	let sessionToken = authStore.accessToken;

	if (isPublicAuthRoute) {
		if (!sessionToken) {
			authStore.clearAuth();
		}
		return authStore.user;
	}

	if (!sessionToken) {
		sessionToken = await refreshSessionToken(authStore);
	}

	if (!sessionToken) {
		authStore.clearAuth();
		return null;
	}

	return loadAuthenticatedUser(authStore, sessionToken);
}

export function AuthInitializer({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isPublicAuthRoute = isPublicAuthPath(pathname);

	const { isLoading: _isLoading } = useQuery({
		queryKey: ["auth", "session", isPublicAuthRoute ? "public" : "protected"],
		queryFn: () => initializeAuthSession(isPublicAuthRoute),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: Infinity,
	});

	return <>{children}</>;
}
