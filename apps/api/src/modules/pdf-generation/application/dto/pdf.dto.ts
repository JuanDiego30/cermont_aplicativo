/**
 * @module PDF Generation - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const GeneratePDFSchema = z.object({
  templateType: z.enum([
    'orden_trabajo',
    'reporte_ejecucion',
    'acta_entrega',
    'inspeccion_hes',
    'inspeccion_linea_vida',
    'checklist',
    'reporte_mensual',
  ]),
  entityId: z.string().uuid(),
  options: z.object({
    includeSignatures: z.boolean().default(true),
    includeEvidencias: z.boolean().default(false),
    format: z.enum(['A4', 'letter']).default('A4'),
    orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  }).optional(),
});

export type GeneratePDFDto = z.infer<typeof GeneratePDFSchema>;

export const GenerateReportePDFSchema = z.object({
  tipoReporte: z.enum(['ordenes', 'mantenimientos', 'inspecciones', 'costos']),
  fechaInicio: z.string(),
  fechaFin: z.string(),
  filtros: z.record(z.string(), z.unknown()).optional(),
});

export type GenerateReportePDFDto = z.infer<typeof GenerateReportePDFSchema>;

export interface PDFResult {
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  generatedAt: string;
}

// Service Interface
export const PDF_SERVICE = Symbol('PDF_SERVICE');

export interface IPDFService {
  generateFromTemplate(template: string, data: Record<string, unknown>): Promise<Buffer>;
  generateFromHtml(html: string): Promise<Buffer>;
}

// Repository Interface
export const PDF_REPOSITORY = Symbol('PDF_REPOSITORY');

export interface IPDFRepository {
  getOrdenData(ordenId: string): Promise<Record<string, unknown>>;
  getHESData(hesId: string): Promise<Record<string, unknown>>;
  getLineaVidaData(lineaVidaId: string): Promise<Record<string, unknown>>;
  getChecklistData(checklistId: string): Promise<Record<string, unknown>>;
  getReporteData(tipo: string, fechaInicio: string, fechaFin: string, filtros?: Record<string, unknown>): Promise<Record<string, unknown>>;
  savePDFRecord(filename: string, path: string, entityType: string, entityId: string, userId: string): Promise<any>;
}
