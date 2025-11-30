'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useDashboard() {
  const { isReady } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getMetrics(),
    enabled: isReady, // ✅ Token está listo antes de API call
    retry: 1,
    staleTime: 30000,
  });
}

export function useDashboardStats() {
  const { isReady } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    enabled: isReady,
    retry: 1,
  });
}

export function useRecentActivity() {
  const { isReady } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(),
    enabled: isReady,
    retry: 1,
  });
}

export function useMyStats() {
  const { isReady } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'my-stats'],
    queryFn: () => dashboardApi.getMyStats(),
    enabled: isReady,
    retry: 1,
  });
}

export function useAdvancedMetrics() {
  const { isReady } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', 'advanced-metrics'],
    queryFn: () => dashboardApi.getAdvancedMetrics(),
    enabled: isReady,
    retry: 1,
  });
}
