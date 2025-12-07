import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0,
        },
    },
});

// Query key factory for consistent keys
export const queryKeys = {
    // Auth
    auth: {
        all: ['auth'] as const,
        me: () => [...queryKeys.auth.all, 'me'] as const,
    },
    // Orders
    orders: {
        all: ['orders'] as const,
        list: (filters?: object) => [...queryKeys.orders.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    },
    // Users
    users: {
        all: ['users'] as const,
        list: (filters?: object) => [...queryKeys.users.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    },
    // Work Plans
    workPlans: {
        all: ['workPlans'] as const,
        list: (filters?: object) => [...queryKeys.workPlans.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.workPlans.all, 'detail', id] as const,
    },
    // Dashboard
    dashboard: {
        all: ['dashboard'] as const,
        stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    },
};
