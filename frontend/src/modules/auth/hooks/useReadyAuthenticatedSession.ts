"use client";

import { useAuthStore } from "@/store/auth.store";

export function useReadyAuthenticatedSession(): boolean {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const hasAccessToken = useAuthStore((state) => state.accessToken.status === "present");
	return isAuthenticated && hasAccessToken;
}
