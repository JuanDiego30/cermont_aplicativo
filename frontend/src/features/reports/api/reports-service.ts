/**
 * Servicio API para Reportes y Generación de PDFs
 * 
 * Endpoints:
 * - GET /api/reports/activity/:orderId - Informe de actividad
 * - POST /api/reports/acta-entrega/:orderId - Acta de entrega
 * - POST /api/reports/ses/:orderId - Formato SES
 * - GET /api/reports/costs/:workPlanId - Reporte de costos
 * - GET /api/reports/dashboard - Reporte del dashboard
 * - GET /api/reports/pending-actas - Actas pendientes
 * 
 * @file frontend/src/features/reports/api/reports-service.ts
 */

import apiClient from '@/core/api/client';
import { env } from '@/core/config';

// ==========================================
// Types
// ==========================================

export interface PendingActa {
  orderId: string;
  orderNumber: string;
  clientName: string;
  completedAt: string;
  hoursPending: number;
}

export interface PendingActasResponse {
  data: PendingActa[];
  meta: {
    total: number;
    criticalCount: number; // > 24 horas
  };
}

// ==========================================
// Helper para descarga de blobs
// ==========================================

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Helper para obtener el token de acceso
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const sessionModule = await import('@/features/auth/utils/session');
  const token = sessionModule.getAccessToken();
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/pdf',
  };
}

/**
 * Ejecuta una petición para obtener un blob (PDF)
 */
async function fetchBlob(url: string, method: 'GET' | 'POST' = 'GET'): Promise<{ blob: Blob; filename: string }> {
  const headers = await getAuthHeaders();
  const fullUrl = `${env.API_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    method,
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Error al generar PDF: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'documento.pdf'
    : 'documento.pdf';
  
  return { blob, filename };
}

// ==========================================
// API Functions
// ==========================================

/**
 * Genera y descarga el informe de actividad de una orden
 */
export const generateActivityReport = async (orderId: string): Promise<void> => {
  const { blob, filename } = await fetchBlob(`/reports/activity/${orderId}`, 'GET');
  downloadBlob(blob, filename || `actividad-${orderId}.pdf`);
};

/**
 * Genera y descarga el acta de entrega de una orden
 */
export const generateActaEntrega = async (orderId: string): Promise<void> => {
  const { blob, filename } = await fetchBlob(`/reports/acta-entrega/${orderId}`, 'POST');
  downloadBlob(blob, filename || `acta-entrega-${orderId}.pdf`);
};

/**
 * Genera y descarga el formato SES de una orden
 */
export const generateSESReport = async (orderId: string): Promise<void> => {
  const { blob, filename } = await fetchBlob(`/reports/ses/${orderId}`, 'POST');
  downloadBlob(blob, filename || `ses-${orderId}.pdf`);
};

/**
 * Genera y descarga el reporte de costos de un plan de trabajo
 */
export const generateCostsReport = async (workPlanId: string): Promise<void> => {
  const { blob, filename } = await fetchBlob(`/reports/costs/${workPlanId}`, 'GET');
  downloadBlob(blob, filename || `costos-${workPlanId}.pdf`);
};

/**
 * Genera y descarga el reporte del dashboard
 */
export const generateDashboardReport = async (): Promise<void> => {
  const { blob, filename } = await fetchBlob('/reports/dashboard', 'GET');
  downloadBlob(blob, filename || `dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Obtiene el listado de actas de entrega pendientes
 */
export const getPendingActas = async (): Promise<PendingActasResponse> => {
  return apiClient.get<PendingActasResponse>('/reports/pending-actas');
};

// ==========================================
// Exports
// ==========================================

export const reportsService = {
  generateActivityReport,
  generateActaEntrega,
  generateSESReport,
  generateCostsReport,
  generateDashboardReport,
  getPendingActas,
};

export default reportsService;
