/**
 * ARCHIVO: dashboard-api.ts
 * FUNCION: Cliente API para datos del dashboard
 * IMPLEMENTACION: Usa apiClient compartido, métodos getMetrics, getOrdersStatus, getTechniciansStats
 * DEPENDENCIAS: @/lib/api-client
 * EXPORTS: dashboardApi, DashboardMetrics, OrderStatusData (interfaces)
 */
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
