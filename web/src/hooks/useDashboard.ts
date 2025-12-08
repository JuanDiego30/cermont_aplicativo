import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

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
    return useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: async () => {
            return await apiClient.get<DashboardMetrics>('/dashboard/metricas');
        },
    });
};

export const useOrdersStatus = () => {
    return useQuery({
        queryKey: ['dashboard-orders-status'],
        queryFn: async () => {
            return await apiClient.get<OrderStatusData[]>('/dashboard/ordenes-estado');
        },
    });
};

export const useTechniciansStats = () => {
    return useQuery({
        queryKey: ['dashboard-technicians'],
        queryFn: async () => {
            return await apiClient.get('/dashboard/tecnicos');
        }
    })
}
