/**
 * @file period-selector.tsx
 * @description Selector de período para reportes
 * 
 * ✨ Client Component - Necesita interactividad
 */

'use client';

import { Download, FileSpreadsheet } from 'lucide-react';
import type { PeriodoTipo } from '../api/financiero.types';

interface PeriodSelectorProps {
  selectedPeriod: PeriodoTipo;
  onPeriodChange: (period: PeriodoTipo) => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
  onExportPDF,
  onExportExcel,
}: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value as PeriodoTipo)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
      >
        <option value="1m">Último mes</option>
        <option value="3m">Últimos 3 meses</option>
        <option value="6m">Últimos 6 meses</option>
        <option value="1y">Último año</option>
      </select>

      {onExportPDF && (
        <button
          onClick={onExportPDF}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      )}

      {onExportExcel && (
        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </button>
      )}
    </div>
  );
}
