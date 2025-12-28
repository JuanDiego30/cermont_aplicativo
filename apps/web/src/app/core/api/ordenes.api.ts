import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Orden,
  CreateOrdenDto,
  UpdateOrdenDto,
  ChangeEstadoOrdenDto,
  AsignarTecnicoOrdenDto,
  ListOrdenesQuery,
  PaginatedOrdenes,
  HistorialEstado,
  OrdenesStats
} from '../models/orden.model';

// Re-export types for service layer
export type { PaginatedOrdenes, OrdenesStats };

@Injectable({
  providedIn: 'root'
})
export class OrdenesApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ordenes`;

  /**
   * List orders with optional filters
   */
  list(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.prioridad) httpParams = httpParams.set('prioridad', params.prioridad);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.buscar) httpParams = httpParams.set('buscar', params.buscar);
      if (params.cliente) httpParams = httpParams.set('cliente', params.cliente);
      if (params.clienteId) httpParams = httpParams.set('clienteId', params.clienteId);
      if (params.tecnicoId) httpParams = httpParams.set('tecnicoId', params.tecnicoId);
      if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
      if (params.soloVencidas) httpParams = httpParams.set('soloVencidas', 'true');
      if (params.soloSinAsignar) httpParams = httpParams.set('soloSinAsignar', 'true');
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<PaginatedOrdenes>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get order by ID
   */
  getById(id: string): Observable<Orden> {
    return this.http.get<Orden>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new order
   */
  create(data: CreateOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(this.apiUrl, data);
  }

  /**
   * Update existing order
   */
  update(id: string, data: UpdateOrdenDto): Observable<Orden> {
    return this.http.put<Orden>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete order
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Change order status
   */
  changeEstado(id: string, dto: ChangeEstadoOrdenDto): Observable<Orden> {
    return this.http.patch<Orden>(`${this.apiUrl}/${id}/estado`, dto);
  }

  /**
   * Assign technician to order
   */
  asignarTecnico(ordenId: string, dto: AsignarTecnicoOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(`${this.apiUrl}/${ordenId}/asignar-tecnico`, dto);
  }

  /**
   * Get order status history
   */
  getHistorial(id: string): Observable<HistorialEstado[]> {
    return this.http.get<HistorialEstado[]>(`${this.apiUrl}/${id}/historial`);
  }

  /**
   * Get order statistics
   */
  getStats(): Observable<OrdenesStats> {
    return this.http.get<OrdenesStats>(`${this.apiUrl}/stats`);
  }
}
