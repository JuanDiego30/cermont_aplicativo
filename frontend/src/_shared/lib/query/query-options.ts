export const listQueryOptions = {
	staleTime: 30_000,
	gcTime: 5 * 60_000,
	refetchOnWindowFocus: false,
	retry: 1,
} as const;

export const detailQueryOptions = {
	staleTime: 2 * 60_000,
	gcTime: 10 * 60_000,
	refetchOnWindowFocus: false,
	retry: 1,
} as const;

export const operationalQueryOptions = {
	staleTime: 30_000,
	gcTime: 5 * 60_000,
	refetchOnWindowFocus: false,
	refetchOnReconnect: true,
	retry: 1,
} as const;
