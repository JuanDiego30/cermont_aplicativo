/**
 * Componente PDFDownloadButton
 * 
 * Botón reutilizable para descarga de PDFs con estado de loading
 * 
 * @file frontend/src/features/reports/components/PDFDownloadButton.tsx
 */

'use client';

import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { cn } from '@/shared/utils/cn';

// ==========================================
// Types
// ==========================================

export type PDFReportType = 'activity' | 'acta-entrega' | 'ses' | 'costs' | 'dashboard';

interface PDFDownloadButtonProps {
  /** Tipo de reporte a generar */
  reportType: PDFReportType;
  /** Función para ejecutar la descarga */
  onDownload: () => void;
  /** Indica si la descarga está en progreso */
  isLoading?: boolean;
  /** Deshabilitar el botón */
  disabled?: boolean;
  /** Variante del botón */
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
  /** Texto personalizado del botón */
  label?: string;
}

// ==========================================
// Config
// ==========================================

const REPORT_CONFIG: Record<PDFReportType, { label: string; icon: string }> = {
  'activity': { label: 'Informe de Actividad', icon: '📋' },
  'acta-entrega': { label: 'Acta de Entrega', icon: '📝' },
  'ses': { label: 'Formato SES', icon: '🛡️' },
  'costs': { label: 'Reporte de Costos', icon: '💰' },
  'dashboard': { label: 'Reporte Dashboard', icon: '📊' },
};

// ==========================================
// Icons
// ==========================================

const DownloadIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const LoadingSpinner = () => (
  <svg 
    className="animate-spin" 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const PDFIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
    <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
  </svg>
);

// ==========================================
// Component
// ==========================================

export function PDFDownloadButton({
  reportType,
  onDownload,
  isLoading = false,
  disabled = false,
  variant = 'outline',
  size = 'md',
  className,
  label,
}: PDFDownloadButtonProps) {
  const config = REPORT_CONFIG[reportType];
  const buttonLabel = label || config.label;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onDownload}
      disabled={disabled || isLoading}
      loading={isLoading}
      className={cn(
        'gap-2',
        className
      )}
      startIcon={isLoading ? <LoadingSpinner /> : <PDFIcon />}
      endIcon={!isLoading ? <DownloadIcon /> : undefined}
    >
      {isLoading ? 'Generando...' : buttonLabel}
    </Button>
  );
}

// ==========================================
// Quick Action Buttons
// ==========================================

interface QuickPDFButtonProps {
  orderId?: string;
  workPlanId?: string;
  onDownload: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ActaEntregaButton({ onDownload, isLoading, disabled, className }: Omit<QuickPDFButtonProps, 'orderId' | 'workPlanId'>) {
  return (
    <PDFDownloadButton
      reportType="acta-entrega"
      onDownload={onDownload}
      isLoading={isLoading}
      disabled={disabled}
      variant="primary"
      className={className}
    />
  );
}

export function SESButton({ onDownload, isLoading, disabled, className }: Omit<QuickPDFButtonProps, 'orderId' | 'workPlanId'>) {
  return (
    <PDFDownloadButton
      reportType="ses"
      onDownload={onDownload}
      isLoading={isLoading}
      disabled={disabled}
      variant="secondary"
      className={className}
    />
  );
}

export function CostsReportButton({ onDownload, isLoading, disabled, className }: Omit<QuickPDFButtonProps, 'orderId' | 'workPlanId'>) {
  return (
    <PDFDownloadButton
      reportType="costs"
      onDownload={onDownload}
      isLoading={isLoading}
      disabled={disabled}
      variant="outline"
      className={className}
    />
  );
}

export function ActivityReportButton({ onDownload, isLoading, disabled, className }: Omit<QuickPDFButtonProps, 'orderId' | 'workPlanId'>) {
  return (
    <PDFDownloadButton
      reportType="activity"
      onDownload={onDownload}
      isLoading={isLoading}
      disabled={disabled}
      variant="outline"
      className={className}
    />
  );
}

export default PDFDownloadButton;
