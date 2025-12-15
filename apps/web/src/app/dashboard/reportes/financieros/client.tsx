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

  const handleExportPDF = useCallback(async () => {
    try {
      toast.info('Generando PDF...', {
        description: 'Por favor espera un momento',
      });
      
      // Trigger browser print dialog for PDF generation
      window.print();
      
      toast.success('PDF listo', {
        description: 'Usa el diálogo de impresión para guardar el PDF',
      });
    } catch (error) {
      toast.error('Error al generar PDF', {
        description: 'Por favor intenta nuevamente',
      });
    }
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      toast.info('Generando Excel...', {
        description: 'Por favor espera un momento',
      });
      
      const periodo = searchParams.get('periodo') || '6m';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Fetch data and create CSV
      const response = await fetch(`${API_URL}/reportes/financieros?periodo=${periodo}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      const data = result.data || [];
      
      // Create CSV content
      const headers = ['Período', 'Ingresos', 'Egresos', 'Utilidad', 'Margen (%)'];
      const rows = data.map((item: any) => [
        item.periodo,
        item.ingresos,
        item.egresos,
        item.utilidad,
        item.margen,
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.join(',')),
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-financiero-${periodo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel exportado', {
        description: 'Archivo CSV descargado correctamente',
      });
    } catch (error) {
      toast.error('Error al exportar Excel', {
        description: 'Por favor intenta nuevamente',
      });
    }
  }, [searchParams]);

  return (
    <PeriodSelector
      selectedPeriod={initialPeriodo}
      onPeriodChange={handlePeriodChange}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
    />
  );
}
