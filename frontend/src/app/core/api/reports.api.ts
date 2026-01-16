/**
 * ReportesApi - Reports API client
 * Connects to /api/reports endpoints
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReporteOrdenDetalle, ReporteOrdenes, ReporteQueryDto } from '../models/reporte.model';
import { ApiBaseService } from './api-base.service';

@Injectable({
  providedIn: 'root',
})
export class ReportesApi extends ApiBaseService {
  /**
   * Generate orders report with filters
   */
  reporteOrdenes(query?: ReporteQueryDto): Observable<ReporteOrdenes> {
    return this.get<ReporteOrdenes>('/reports/orders', query);
  }

  /**
   * Get detailed report for a specific order
   */
  reporteOrden(id: string): Observable<ReporteOrdenDetalle> {
    return this.get<ReporteOrdenDetalle>(`/reports/order/${id}`);
  }

  /**
   * Download report as PDF
   */
  downloadReportePDF(id: string): Observable<Blob> {
    return this.download(`/reports/order/${id}/pdf`);
  }
}
