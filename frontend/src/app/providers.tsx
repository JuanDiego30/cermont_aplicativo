"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { AuthInitializer } from "@/modules/auth/components/AuthInitializer";
import { persistQueryToIndexedDB, restoreQueryFromIndexedDB } from "@/lib/pwa/query-persist";

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: STALE_TIMES.DETAIL,
						gcTime: 10 * 60 * 1000, // 10 min
						retry: 2,
						refetchOnWindowFocus: true,
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
			const cacheable = queries
				.filter((q) => q.queryKey[0] !== "__cached__")
				.map((q) => ({
					key: q.queryKey,
					data: q.state.data,
					dataUpdatedAt: q.state.dataUpdatedAt,
				}));
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
