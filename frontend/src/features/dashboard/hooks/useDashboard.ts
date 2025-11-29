'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getMetrics(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(),
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: ['dashboard', 'my-stats'],
    queryFn: () => dashboardApi.getMyStats(),
  });
}

export function useAdvancedMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'advanced-metrics'],
    queryFn: () => dashboardApi.getAdvancedMetrics(),
  });
}
