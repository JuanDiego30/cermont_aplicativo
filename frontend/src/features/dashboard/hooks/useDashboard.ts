'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { useAuth } from '@/features/auth/context/AuthContext';

/**
 * Hook para verificar si el usuario está autenticado
 * Usa el contexto de Auth para evitar condiciones de carrera
 */
function useIsReady(): boolean {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Solo permitir consultas cuando el auth esté inicializado y autenticado
  return !isLoading && isAuthenticated;
}

export function useDashboard() {
  const isReady = useIsReady();
  
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getMetrics(),
    enabled: isReady,
    retry: 1,
    staleTime: 30000,
  });
}

export function useDashboardStats() {
  const isReady = useIsReady();
  
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    enabled: isReady,
    retry: 1,
  });
}

export function useRecentActivity() {
  const isReady = useIsReady();
  
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(),
    enabled: isReady,
    retry: 1,
  });
}

export function useMyStats() {
  const isReady = useIsReady();
  
  return useQuery({
    queryKey: ['dashboard', 'my-stats'],
    queryFn: () => dashboardApi.getMyStats(),
    enabled: isReady,
    retry: 1,
  });
}

export function useAdvancedMetrics() {
  const isReady = useIsReady();
  
  return useQuery({
    queryKey: ['dashboard', 'advanced-metrics'],
    queryFn: () => dashboardApi.getAdvancedMetrics(),
    enabled: isReady,
    retry: 1,
  });
}
