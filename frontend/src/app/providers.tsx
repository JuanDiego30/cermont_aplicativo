"use client";

import { onlineManager, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { MotionConfig } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { OfflineBanner } from "@/components/offline/OfflineBanner";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { detailQueryOptions } from "@/lib/constants/query-options";
import { isOfflineLikeError } from "@/lib/http/api-client";
import { useConnectivity } from "@/lib/offline/connectivity";
import { registerOfflineMutationDefaults } from "@/lib/offline/mutation-defaults";
import { OfflineWarmupBootstrap } from "@/lib/offline/OfflineWarmupBootstrap";
import { migrateLegacyOfflineStores, openOfflineDb } from "@/lib/offline/offline-db";
import { SyncManagerProvider } from "@/lib/offline/SyncManagerProvider";
import { dexieQueryPersister } from "@/lib/pwa/query-persist";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { AuthInitializer } from "@/modules/auth/components/AuthInitializer";
import { useAuthStore } from "@/store/auth.store";
import { useOfflineStore } from "@/store/offline.store";

const PUBLIC_AUTH_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/unauthorized"];

function isPublicAuthPath(pathname: string): boolean {
	return PUBLIC_AUTH_PATHS.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
}

function OfflineStorageBootstrap() {
	const userId = useAuthStore((state) =>
		state.user.status === "present" ? state.user.value.id : ""
	);

	useEffect(() => {
		if (!userId) {
			return;
		}

		void migrateLegacyOfflineStores(userId);
	}, [userId]);

	return null;
}

function shouldRetryQuery(failureCount: number, error: Error): boolean {
	if (isOfflineLikeError(error)) {
		return false;
	}

	return failureCount < 1;
}

function hasReadyAuthenticatedSession(): boolean {
	const authState = useAuthStore.getState();
	return authState.isAuthenticated && authState.accessToken.status === "present";
}

function resumePersistedWork(queryClient: QueryClient): void {
	void queryClient.resumePausedMutations().then(() => {
		if (useOfflineStore.getState().isOnline && hasReadyAuthenticatedSession()) {
			return queryClient.invalidateQueries({ refetchType: "active" });
		}
	});
}

function ConnectivityBootstrap({ queryClient }: { queryClient: QueryClient }) {
	const { isOnline } = useConnectivity();

	useEffect(() => {
		onlineManager.setOnline(isOnline);
		if (isOnline) {
			resumePersistedWork(queryClient);
		}
	}, [isOnline, queryClient]);

	return null;
}

function OfflineDbInitializer() {
	const pathname = usePathname();
	const isPublicRoute = isPublicAuthPath(pathname);
	const isAuthenticated = hasReadyAuthenticatedSession();

	// Only initialize on protected routes with authenticated session
	useEffect(() => {
		if (isPublicRoute || !isAuthenticated) {
			return;
		}

		void openOfflineDb().then((result) => {
			if (result.status === "recovery_required") {
				useOfflineStore.getState().setSyncState({
					syncError:
						"El almacenamiento local requiere revisión. No se eliminaron borradores ni cambios pendientes.",
				});
			}
		});
	}, [isPublicRoute, isAuthenticated]);

	return null;
}

function OfflineSyncBootstrap({ queryClient }: { queryClient: QueryClient }) {
	const pathname = usePathname();
	const isPublicRoute = isPublicAuthPath(pathname);
	const isAuthenticated = hasReadyAuthenticatedSession();

	// Only initialize offline sync on protected routes with authenticated session
	if (isPublicRoute || !isAuthenticated) {
		return null;
	}

	return (
		<>
			<OfflineDbInitializer />
			<SyncManagerProvider>
				<OfflineStorageBootstrap />
				<OfflineWarmupBootstrap queryClient={queryClient} />
				<OfflineBanner />
			</SyncManagerProvider>
		</>
	);
}

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => {
		const client = new QueryClient({
			defaultOptions: {
				queries: {
					...detailQueryOptions,
					staleTime: STALE_TIMES.DETAIL,
					networkMode: "offlineFirst",
					refetchOnReconnect: true,
					retry: shouldRetryQuery,
				},
				mutations: {
					networkMode: "offlineFirst",
					retry: 0,
				},
			},
		});
		registerOfflineMutationDefaults(client);
		return client;
	});

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister: dexieQueryPersister,
				maxAge: 1000 * 60 * 60 * 24,
				buster: process.env.NEXT_PUBLIC_BUILD_ID ?? "offline-v1",
				dehydrateOptions: {
					shouldDehydrateQuery: (query) => {
						const key = query.queryKey;
						// Never persist auth session queries — they must always re-validate
						if (Array.isArray(key) && key[0] === "auth") {
							return false;
						}
						return query.state.status === "success";
					},
				},
			}}
			onSuccess={() => resumePersistedWork(queryClient)}
		>
			<ThemeProvider>
				<MotionConfig reducedMotion="user">
					<ConnectivityBootstrap queryClient={queryClient} />
					<OfflineSyncBootstrap queryClient={queryClient} />
					<AuthInitializer>{children}</AuthInitializer>
				</MotionConfig>
			</ThemeProvider>
			{process.env.NODE_ENV !== "production" && (
				<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
			)}
		</PersistQueryClientProvider>
	);
}