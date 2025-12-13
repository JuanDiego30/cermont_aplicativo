/**
 * @file client.tsx
 * @description Componentes cliente para la página de reportes financieros
 * 
 * ✨ Client Component - Maneja interactividad
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { PeriodSelector } from '@/features/reportes-financieros';
import type { PeriodoTipo } from '@/features/reportes-financieros';
import { toast } from 'sonner';

interface ReportesFinancierosClientProps {
  initialPeriodo: PeriodoTipo;
}

export function ReportesFinancierosClient({ initialPeriodo }: ReportesFinancierosClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = useCallback((periodo: PeriodoTipo) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('periodo', periodo);
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleExportPDF = useCallback(() => {
    // TODO: Implementar exportación PDF
    toast.info('Generando PDF...', {
      description: 'Esta funcionalidad estará disponible próximamente',
    });
  }, []);

  const handleExportExcel = useCallback(() => {
    // TODO: Implementar exportación Excel
    toast.info('Generando Excel...', {
      description: 'Esta funcionalidad estará disponible próximamente',
    });
  }, []);

  return (
    <PeriodSelector
      selectedPeriod={initialPeriodo}
      onPeriodChange={handlePeriodChange}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
    />
  );
}
