import apiClient from './client';

export const dashboardApi = {
  async getMetrics(): Promise<any> {
    const { data } = await apiClient.get('/dashboard/metrics');
    return data?.data ?? data;
  },

  async getStats(): Promise<any> {
    const { data } = await apiClient.get('/dashboard/stats');
    return data?.data ?? data;
  },

  async getRecentActivity(): Promise<any> {
    const { data } = await apiClient.get('/dashboard/recent-activity');
    return data?.data ?? data;
  },

  async getMyStats(): Promise<any> {
    const { data } = await apiClient.get('/dashboard/my-stats');
    return data?.data ?? data;
  },
};
