import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CostoResponse,
  RegistrarCostoDto,
  CostoQueryDto,
  CostoAnalysis
} from '../models/costo.model';

/**
 * Costos API Service
 * Handles all HTTP requests to the costos endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class CostosApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/costos`;

  /**
   * Listar costos con filtros opcionales
   * Requiere rol: admin o supervisor
   */
  list(params?: CostoQueryDto): Observable<CostoResponse[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.ordenId) httpParams = httpParams.set('ordenId', params.ordenId);
      if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
      if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    }

    return this.http.get<CostoResponse[]>(this.apiUrl, { params: httpParams });
  }

  /**
   * Obtener análisis de costos por orden
   * Requiere rol: admin o supervisor
   */
  getAnalisis(ordenId: string): Observable<CostoAnalysis> {
    return this.http.get<CostoAnalysis>(`${this.apiUrl}/analisis/${ordenId}`);
  }

  /**
   * Registrar un nuevo costo
   * Requiere rol: admin, supervisor o tecnico
   */
  create(data: RegistrarCostoDto): Observable<CostoResponse> {
    return this.http.post<CostoResponse>(this.apiUrl, data);
  }
}

