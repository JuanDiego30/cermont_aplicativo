// apps/frontend/src/store/auth.store.ts
// Zustand auth store per DOC-04 Section 10.2 (lines 618-668)
// ⚠️  SECURITY: accessToken kept in memory only, NEVER persisted to localStorage
// Refresh token is persisted (in httpOnly cookie by backend)

import type { UserRole } from "@cermont/shared-types/rbac";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
	id: string;
	name: string | null;
	email: string | null;
	role: UserRole;
}

interface AuthState {
	// NEVER persisted — memory only for XSS protection
	accessToken: string | null;

	// User data (safe to persist — no sensitive info)
	user: AuthUser | null;

	// Refresh token persisted by backend in httpOnly cookie (not here)
	isAuthenticated: boolean;

	// Actions
	setAuth: (user: AuthUser, accessToken: string | null) => void;
	clearAuth: () => void;
	setAccessToken: (token: string) => void;
	clearAccessToken: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,

			setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

			clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),

			setAccessToken: (token) => {
				set({ accessToken: token });
				/** @see DOC-04 sección Token Management en cliente */
			},

			clearAccessToken: () => set({ accessToken: null }),
		}),
		{
			name: "cermont-auth",
			// CRITICAL: Only persist user and auth state, NEVER accessToken
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				// accessToken is NOT included in persistence
			}),
		},
	),
);
