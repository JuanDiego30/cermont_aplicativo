/**
 * PdfApiService - PDF generation API client
 * Migrated to extend ApiBaseService (consolidation)
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';

export interface GeneratePdfDto {
  html: string;
  filename?: string;
  options?: {
    format?: 'A4' | 'Letter';
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
}

export interface GenerateReporteOrdenDto {
  ordenId: string;
  incluirEvidencias?: boolean;
  incluirCostos?: boolean;
}

export interface GenerateReporteMantenimientoDto {
  mantenimientoId: string;
  incluirEvidencias?: boolean;
}

export interface GenerateCertificadoDto {
  tipo: 'inspeccion' | 'mantenimiento' | 'instalacion';
  elementoId: string;
  fechaInspeccion?: string;
  inspectorId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PdfApiService extends ApiBaseService {
  /**
   * Genera un PDF desde HTML personalizado
   */
  generatePdf(dto: GeneratePdfDto): Observable<Blob> {
    return this.download('/pdf/generate', dto);
  }

  /**
   * Genera reporte PDF de una orden
   */
  generateReporteOrden(dto: GenerateReporteOrdenDto): Observable<Blob> {
    return this.download('/pdf/order-report', dto);
  }

  /**
   * Genera reporte PDF de un mantenimiento
   */
  generateReporteMantenimiento(dto: GenerateReporteMantenimientoDto): Observable<Blob> {
    return this.download('/pdf/maintenance-report', dto);
  }

  /**
   * Genera certificado de inspección
   */
  generateCertificado(dto: GenerateCertificadoDto): Observable<Blob> {
    return this.download('/pdf/inspection-certificate', dto);
  }

  /**
   * Obtiene un PDF desde cache (si existe)
   */
  getCachedPdf(cacheKey: string): Observable<Blob> {
    return this.download(`/pdf/cached/${cacheKey}`);
  }

  /**
   * Descarga un blob como archivo
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
