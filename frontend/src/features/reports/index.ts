/**
 * Reports Feature - Barrel Export
 * 
 * @file frontend/src/features/reports/index.ts
 */

// API Service
export {
  reportsService,
  generateActivityReport,
  generateActaEntrega,
  generateSESReport,
  generateCostsReport,
  generateDashboardReport,
  getPendingActas,
  type PendingActa,
  type PendingActasResponse,
} from './api/reports-service';

// Hooks
export {
  reportsKeys,
  useGenerateActivityReport,
  useGenerateActaEntrega,
  useGenerateSESReport,
  useGenerateCostsReport,
  useGenerateDashboardReport,
  usePendingActas,
  useOrderReports,
  useWorkPlanReports,
} from './hooks/useReports';

// Components
export {
  PDFDownloadButton,
  ActaEntregaButton,
  SESButton,
  CostsReportButton,
  ActivityReportButton,
  type PDFReportType,
} from './components/PDFDownloadButton';
