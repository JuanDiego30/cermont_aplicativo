'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useDashboard() {
  const { isReady, isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getMetrics(),
    enabled: !isLoading && isReady && isAuthenticated,
    retry: 1,
    staleTime: 30000,
  });
}

export function useDashboardStats() {
  const { isReady, isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    enabled: !isLoading && isReady && isAuthenticated,
    retry: 1,
  });
}

export function useRecentActivity() {
  const { isReady, isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(),
    enabled: !isLoading && isReady && isAuthenticated,
    retry: 1,
  });
}

export function useMyStats() {
  const { isReady, isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'my-stats'],
    queryFn: () => dashboardApi.getMyStats(),
    enabled: !isLoading && isReady && isAuthenticated,
    retry: 1,
  });
}

export function useAdvancedMetrics() {
  const { isReady, isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'advanced-metrics'],
    queryFn: () => dashboardApi.getAdvancedMetrics(),
    enabled: !isLoading && isReady && isAuthenticated,
    retry: 1,
  });
}
