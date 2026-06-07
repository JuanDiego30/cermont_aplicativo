"use client";

import { resolveUserRole, type UserRole } from "@cermont/domain";
import { isPresent, type StatusObject } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ApiError, apiClient } from "@/lib/http/api-client";
import { useAuthStore } from "@/store/auth.store";

interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

type AuthUserContract = {
	_id?: string;
	id?: string;
	email?: string | null;
	name?: string | null;
	role?: string;
};

function toUser(input: AuthUserContract): User {
	const role = resolveUserRole(input.role);
	return {
		id: input.id ?? input._id ?? "",
		email: input.email ?? "",
		name: input.name ?? "",
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
		const token = await apiClient.refresh();
		return token;
	} catch {
		authStore.clearAuth();
		return null;
	}
}

async function loadAuthenticatedUser(
	authStore: AuthStoreSnapshot,
	sessionToken: string,
): Promise<User | null> {
	try {
		const response = await apiClient.get<{ success: boolean; data: AuthUserContract }>("/auth/me");
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
	const accessTokenStatus: StatusObject<string> = authStore.accessToken;

	if (isPublicAuthRoute) {
		if (!isPresent(accessTokenStatus)) {
			authStore.clearAuth();
		}
		const userStatus = authStore.user;
		return isPresent(userStatus) ? userStatus.value : null;
	}

	let sessionToken = isPresent(accessTokenStatus) ? accessTokenStatus.value : null;

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
		networkMode: "always",
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 0,
		gcTime: 0,
	});

	if (!isPublicAuthRoute && _isLoading) {
		return (
			<div
				className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--surface-page)]"
				aria-live="polite"
			>
				<div
					className="size-10 animate-spin rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--color-brand-blue)]"
					aria-hidden="true"
				/>
				<p className="text-sm font-medium text-[var(--text-secondary)]">Inicializando sesión…</p>
			</div>
		);
	}

	return <>{children}</>;
}
