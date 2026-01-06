import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportesApi } from '../../../core/api/reportes.api';
import { ReporteOrdenDetalle, ReporteOrdenes, ReporteQueryDto } from '../../../core/models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private readonly reportesApi = inject(ReportesApi);

  reporteOrdenes(query?: ReporteQueryDto): Observable<ReporteOrdenes> {
    return this.reportesApi.reporteOrdenes(query);
  }

  reporteOrden(id: string): Observable<ReporteOrdenDetalle> {
    return this.reportesApi.reporteOrden(id);
  }

  downloadReportePDF(id: string): Observable<Blob> {
    return this.reportesApi.downloadReportePDF(id);
  }
}
