import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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
  providedIn: 'root'
})
export class PdfApiService {
  private readonly api = inject(ApiService);

  /**
   * Genera un PDF desde HTML personalizado
   */
  generatePdf(dto: GeneratePdfDto): Observable<Blob> {
    return this.api.downloadPdf('/pdf/generate', dto);
  }

  /**
   * Genera reporte PDF de una orden
   */
  generateReporteOrden(dto: GenerateReporteOrdenDto): Observable<Blob> {
    return this.api.downloadPdf('/pdf/reporte-orden', dto);
  }

  /**
   * Genera reporte PDF de un mantenimiento
   */
  generateReporteMantenimiento(dto: GenerateReporteMantenimientoDto): Observable<Blob> {
    return this.api.downloadPdf('/pdf/reporte-mantenimiento', dto);
  }

  /**
   * Genera certificado de inspección
   */
  generateCertificado(dto: GenerateCertificadoDto): Observable<Blob> {
    return this.api.downloadPdf('/pdf/certificado-inspeccion', dto);
  }

  /**
   * Obtiene un PDF desde cache (si existe)
   */
  getCachedPdf(cacheKey: string): Observable<Blob> {
    return this.api.downloadPdf(`/pdf/cached/${cacheKey}`);
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

