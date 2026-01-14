/**
 * ReportesApi - Reports API client
 * Connects to /api/reportes endpoints
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
    ReporteQueryDto,
    ReporteOrdenes,
    ReporteOrdenDetalle,
} from '../models/reporte.model';

@Injectable({
    providedIn: 'root',
})
export class ReportesApi extends ApiBaseService {
    /**
     * Generate orders report with filters
     */
    reporteOrdenes(query?: ReporteQueryDto): Observable<ReporteOrdenes> {
        return this.get<ReporteOrdenes>('/reportes/ordenes', query);
    }

    /**
     * Get detailed report for a specific order
     */
    reporteOrden(id: string): Observable<ReporteOrdenDetalle> {
        return this.get<ReporteOrdenDetalle>(`/reportes/orden/${id}`);
    }

    /**
     * Download report as PDF
     */
    downloadReportePDF(id: string): Observable<Blob> {
        return this.download(`/reportes/orden/${id}/pdf`);
    }
}
