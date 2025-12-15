/**
 * ARCHIVO: use-financial-data.ts
 * FUNCION: Custom hooks SWR para consumo de datos financieros
 * IMPLEMENTACION: Hooks useFinancialData, useFinancialSummary, useExportFinancialReport con cache SWR
 * DEPENDENCIAS: swr, useMutation, swrKeys, financieroApi
 * EXPORTS: useFinancialData, useFinancialSummary, useExportFinancialReport, useFinancialReport
 */
'use client';
import useSWR from 'swr';
import { useMutation } from '@/hooks/use-mutation';
import { swrKeys } from '@/lib/swr-config';
import { financieroApi } from '../api/financiero.api';
import type {
  FinancialFilters,
  FinancialResponse,
  FinancialSummary,
  ExportConfig,
  PeriodoTipo,
} from '../api/financiero.types';

/**
 * Hook para obtener datos financieros
 */
export function useFinancialData(filters: FinancialFilters) {
  return useSWR(
    swrKeys.financial.report(filters),
    () => financieroApi.getData(filters),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener resumen financiero (KPIs)
 */
export function useFinancialSummary(periodo: PeriodoTipo) {
  return useSWR(
    swrKeys.financial.summary({ periodo }),
    () => financieroApi.getSummary(periodo),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para exportar reporte financiero
 */
export function useExportFinancialReport() {
  return useMutation({
    mutationFn: async ({
      filters,
      config,
    }: {
      filters: FinancialFilters;
      config: ExportConfig;
    }) => {
      const blob = await financieroApi.export(filters, config);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-financiero.${config.formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return blob;
    },
  });
}

/**
 * Hook combinado para datos financieros con KPIs
 */
export function useFinancialReport(filters: FinancialFilters) {
  const { data: reportData, error: reportError, isLoading: reportLoading } = useFinancialData(filters);
  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useFinancialSummary(filters.periodo);

  return {
    data: reportData?.data,
    summary: summaryData || reportData?.summary,
    isLoading: reportLoading || summaryLoading,
    error: reportError || summaryError,
  };
}
