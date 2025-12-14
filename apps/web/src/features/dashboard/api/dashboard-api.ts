import { apiClient } from '@/lib/api-client';

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

export const dashboardApi = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        return apiClient.get<DashboardMetrics>('/dashboard/metricas');
    },

    getOrdersStatus: async (): Promise<OrderStatusData[]> => {
        return apiClient.get<OrderStatusData[]>('/dashboard/ordenes-estado');
    },

    getTechniciansStats: async (): Promise<any> => {
        return apiClient.get('/dashboard/tecnicos');
    },
};
