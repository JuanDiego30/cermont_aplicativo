// apps/frontend/src/store/auth.store.ts
// Zustand auth store per DOC-04 Section 10.2 (lines 618-668)
// ⚠️  SECURITY: accessToken kept in memory only, NEVER persisted to localStorage
// Refresh token is persisted (in httpOnly cookie by backend)

import type { UserRole } from "@cermont/domain";
import type { StatusObject } from "@cermont/shared-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

interface AuthState {
	// NEVER persisted — memory only for XSS protection
	// Using StatusObject pattern instead of null
	accessToken: StatusObject<string>;

	// User data (safe to persist — no sensitive info)
	// Using StatusObject pattern instead of null
	user: StatusObject<AuthUser>;

	// Refresh token persisted by backend in httpOnly cookie (not here)
	isAuthenticated: boolean;

	// Actions
	setAuth: (user: AuthUser, accessToken: string) => void;
	clearAuth: () => void;
	setAccessToken: (token: string) => void;
	clearAccessToken: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: { status: "absent" } as StatusObject<AuthUser>,
			accessToken: { status: "absent" } as StatusObject<string>,
			isAuthenticated: false,

			setAuth: (user, accessToken) =>
				set({
					user: { status: "present", value: user },
					accessToken: { status: "present", value: accessToken },
					isAuthenticated: true,
				}),

			clearAuth: () =>
				set({
					user: { status: "absent" },
					accessToken: { status: "absent" },
					isAuthenticated: false,
				}),

			setAccessToken: (token) => {
				set({ accessToken: { status: "present", value: token } });
				/** @see DOC-04 sección Token Management en cliente */
			},

			clearAccessToken: () => set({ accessToken: { status: "absent" } }),
		}),
		{
			name: "cermont-auth",
			// CRITICAL: Only persist user, NEVER accessToken or isAuthenticated
			// isAuthenticated is NOT persisted — derived by AuthInitializer on page load.
			// Without this, Zustand restore sets isAuthenticated=true before AuthInitializer
			// runs, causing a 401 storm as queries fire with no valid accessToken.
			partialize: (state) => ({
				user: state.user,
				// isAuthenticated: NOT persisted — prevents stale auth state on page reload
				// accessToken: NOT persisted — security / memory only
			}),
		},
	),
);
