/**
 * Dashboard API Service
 */

import apiClient from '@/core/api/client';

export interface DashboardMetrics {
  totalOrders: number;
  ordersByState: Record<string, number>;
  recentOrders: unknown[];
}

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    return apiClient.get<DashboardMetrics>('/dashboard/metrics');
  },

  getStats: async (): Promise<unknown> => {
    return apiClient.get('/dashboard/stats');
  },

  getRecentActivity: async (): Promise<unknown> => {
    return apiClient.get('/dashboard/recent-activity');
  },

  getMyStats: async (): Promise<unknown> => {
    return apiClient.get('/dashboard/my-stats');
  },

  getAdvancedMetrics: async (): Promise<unknown> => {
    return apiClient.get('/dashboard/metrics/advanced');
  },
};
