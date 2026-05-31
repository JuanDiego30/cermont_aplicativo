"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { detailQueryOptions } from "@/lib/constants/query-options";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { persistQueryToIndexedDB, restoreQueryFromIndexedDB } from "@/lib/pwa/query-persist";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { AuthInitializer } from "@/modules/auth/components/AuthInitializer";

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						...detailQueryOptions,
						staleTime: STALE_TIMES.DETAIL,
						refetchOnReconnect: true,
					},
					mutations: {
						retry: 0,
					},
				},
			}),
	);

	// Restore query cache from IndexedDB on mount (for offline)
	useEffect(() => {
		restoreQueryFromIndexedDB().then((state) => {
			if (state) {
				queryClient.setQueryData(["__cached__"], state);
			}
		});
	}, [queryClient]);

	// Persist query cache to IndexedDB when queries change
	useEffect(() => {
		const cache = queryClient.getQueryCache();
		const unsubscribe = cache.subscribe(() => {
			const queries = queryClient.getQueryCache().getAll();
			const cacheable = queries.reduce<
				{ key: readonly unknown[]; data: unknown; dataUpdatedAt: number }[]
			>((acc, q) => {
				if (q.queryKey[0] !== "__cached__") {
					acc.push({
						key: q.queryKey,
						data: q.state.data,
						dataUpdatedAt: q.state.dataUpdatedAt,
					});
				}
				return acc;
			}, []);
			persistQueryToIndexedDB(cacheable);
		});
		return unsubscribe;
	}, [queryClient]);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<MotionConfig reducedMotion="user">
					<AuthInitializer>{children}</AuthInitializer>
				</MotionConfig>
			</ThemeProvider>
			{process.env.NODE_ENV !== "production" && (
				<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
			)}
		</QueryClientProvider>
	);
}
