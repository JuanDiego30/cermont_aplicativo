"use client";

import { isPublicPath } from "@cermont/shared-types/rbac";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { ApiError, apiClient } from "@/_shared/lib/http/api-client";
import { useAuthStore } from "@/_shared/store/auth.store";
import { type AuthUserRecord, toUser } from "../hooks/useAuth";

type AuthStoreState = ReturnType<typeof useAuthStore.getState>;

interface RefreshAuthResponse {
	success?: boolean;
	data?: { accessToken?: string };
}

async function refreshSessionToken(authStore: AuthStoreState): Promise<string | null> {
	try {
		const refreshResponse = await apiClient.post<RefreshAuthResponse>("/auth/refresh");
		if (refreshResponse?.success && refreshResponse.data?.accessToken) {
			authStore.setAccessToken(refreshResponse.data.accessToken);
			return refreshResponse.data.accessToken;
		}
	} catch {
		authStore.clearAuth();
		return null;
	}

	authStore.clearAuth();
	return null;
}

async function loadAuthenticatedUser(
	sessionToken: string,
	authStore: AuthStoreState,
): Promise<AuthStoreState["user"] | null> {
	try {
		const response = await apiClient.get<{ success: boolean; data: AuthUserRecord }>("/auth/me");
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

async function resolveAuthSession(
	isPublicAuthRoute: boolean,
): Promise<AuthStoreState["user"] | null> {
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

	return loadAuthenticatedUser(sessionToken, authStore);
}

export function AuthInitializer({ children }: { children: ReactNode }) {
	const pathname = usePathname() ?? "";
	const isPublicAuthRoute = isPublicPath(pathname) || pathname === "/unauthorized";

	useEffect(() => {
		if (!isPublicAuthRoute) {
			return;
		}

		const authStore = useAuthStore.getState();
		if (!authStore.accessToken) {
			authStore.clearAuth();
		}
	}, [isPublicAuthRoute]);

	useQuery({
		queryKey: ["auth", "session", isPublicAuthRoute ? "public" : "protected"],
		enabled: !isPublicAuthRoute,
		queryFn: () => resolveAuthSession(isPublicAuthRoute),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: Infinity,
	});

	return <>{children}</>;
}
