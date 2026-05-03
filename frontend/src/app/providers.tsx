"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { ApiError } from "@/_shared/lib/http/api-client";
import { AuthInitializer } from "@/auth/components/AuthInitializer";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always create a new query client
		return new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: STALE_TIMES.DETAIL,
				},
			},
		});
	} else {
		// Browser: make singleton so we don't re-make it
		if (!browserQueryClient) {
			browserQueryClient = new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: STALE_TIMES.DETAIL,
						gcTime: 10 * 60 * 1000,
						retry: (failureCount, error) => {
							if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
								return false;
							}
							return failureCount < 2;
						},
						refetchOnWindowFocus: true,
						refetchOnReconnect: true,
					},
					mutations: {
						retry: 0,
					},
				},
			});
		}
		return browserQueryClient;
	}
}

export function Providers({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	// Suppress Chrome extension false-positive "message channel closed" errors in dev
	useEffect(() => {
		if (process.env.NODE_ENV === "production") {
			return;
		}
		const handler = (event: PromiseRejectionEvent) => {
			if (
				event.reason?.message?.includes(
					"A listener indicated an asynchronous response by returning true",
				)
			) {
				event.preventDefault();
			}
		};
		window.addEventListener("unhandledrejection", handler);
		return () => window.removeEventListener("unhandledrejection", handler);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			{typeof window !== "undefined" ? <AuthInitializer>{children}</AuthInitializer> : children}
			{process.env.NODE_ENV !== "production" && (
				<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
			)}
		</QueryClientProvider>
	);
}
