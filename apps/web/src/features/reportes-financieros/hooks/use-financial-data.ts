/**
 * @file use-financial-data.ts
 * @description TanStack Query hooks para datos financieros
 */

import { useQuery } from '@tanstack/react-query';
import { financieroApi } from '../api/financiero.api';
import type { FinancialFilters, FinancialResponse } from '../api/financiero.types';

// Query keys factory
export const financialKeys = {
  all: ['financial'] as const,
  data: () => [...financialKeys.all, 'data'] as const,
  dataByFilters: (filters: FinancialFilters) => [...financialKeys.data(), filters] as const,
  summary: () => [...financialKeys.all, 'summary'] as const,
  summaryByPeriod: (periodo: string) => [...financialKeys.summary(), periodo] as const,
};

/**
 * Hook para obtener datos financieros
 */
export function useFinancialData(
  filters: FinancialFilters,
  options?: {
    initialData?: FinancialResponse;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: financialKeys.dataByFilters(filters),
    queryFn: () => financieroApi.getData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para obtener resumen financiero
 */
export function useFinancialSummary(periodo: string) {
  return useQuery({
    queryKey: financialKeys.summaryByPeriod(periodo),
    queryFn: () => financieroApi.getSummary(periodo),
    staleTime: 5 * 60 * 1000,
  });
}
