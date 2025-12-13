import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiException } from '../lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface DashboardMetrics {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    techniciansActive: number;
}

export interface OrderStatusData {
    status: string;
    count: number;
}

export const useDashboardMetrics = () => {
    // ✅ Verificar que el usuario esté autenticado
    const { isAuthenticated, token } = useAuthStore();

    return useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: async (): Promise<DashboardMetrics> => {
            try {
                return await apiClient.get<DashboardMetrics>('/dashboard/metricas');
            } catch (error) {
                if (error instanceof ApiException && error.statusCode === 401) {
                    throw new Error('Sesión expirada');
                }
                throw error;
            }
        },
        // ✅ No hacer query si no está autenticado
        enabled: isAuthenticated && !!token,
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchInterval: 30 * 1000, // Refrescar cada 30 segundos
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

export const useOrdersStatus = () => {
    const { isAuthenticated, token } = useAuthStore();

    return useQuery({
        queryKey: ['dashboard-orders-status'],
        queryFn: async () => {
            return await apiClient.get<OrderStatusData[]>('/dashboard/ordenes-estado');
        },
        enabled: isAuthenticated && !!token,
        staleTime: 5 * 60 * 1000,
        retry: 3,
    });
};

export const useTechniciansStats = () => {
    const { isAuthenticated, token } = useAuthStore();

    return useQuery({
        queryKey: ['dashboard-technicians'],
        queryFn: async () => {
            return await apiClient.get('/dashboard/tecnicos');
        },
        enabled: isAuthenticated && !!token,
        staleTime: 5 * 60 * 1000,
        retry: 3,
    });
};
