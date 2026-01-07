/**
 * OrdenesApi - Orders API Client (Refactored)
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Eliminates manual HttpParams building in favor of base service's buildParams.
 * 
 * @see apps/api/src/modules/ordenes/infrastructure/controllers/ordenes.controller.ts
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
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
export class OrdenesApi extends ApiBaseService {
  private readonly basePath = '/ordenes';

  /**
   * GET /ordenes - List orders with optional filters
   */
  list(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
    return this.get<PaginatedOrdenes>(this.basePath, params as Record<string, any>);
  }

  /**
   * GET /ordenes/:id - Get order by ID
   */
  getById(id: string): Observable<Orden> {
    return this.get<Orden>(`${this.basePath}/${id}`);
  }

  /**
   * POST /ordenes - Create new order
   */
  create(data: CreateOrdenDto): Observable<Orden> {
    return this.post<Orden>(this.basePath, data);
  }

  /**
   * PATCH /ordenes/:id - Update existing order
   */
  update(id: string, data: UpdateOrdenDto): Observable<Orden> {
    return this.patch<Orden>(`${this.basePath}/${id}`, data);
  }

  /**
   * DELETE /ordenes/:id - Delete order
   */
  remove(id: string): Observable<void> {
    return this.deleteRequest<void>(`${this.basePath}/${id}`);
  }

  /**
   * POST /ordenes/:id/cambiar-estado - Change order status
   */
  changeEstado(id: string, dto: ChangeEstadoOrdenDto): Observable<Orden> {
    return this.post<Orden>(`${this.basePath}/${id}/cambiar-estado`, dto);
  }

  /**
   * POST /ordenes/:id/asignar-tecnico - Assign technician to order
   */
  asignarTecnico(ordenId: string, dto: AsignarTecnicoOrdenDto): Observable<Orden> {
    return this.post<Orden>(`${this.basePath}/${ordenId}/asignar-tecnico`, dto);
  }

  /**
   * GET /ordenes/:id/historial - Get order status history
   */
  getHistorial(id: string): Observable<HistorialEstado[]> {
    return this.get<HistorialEstado[]>(`${this.basePath}/${id}/historial`);
  }

  /**
   * GET /ordenes/stats - Get order statistics
   * Note: Placed after dynamic routes in backend controller
   */
  getStats(): Observable<OrdenesStats> {
    return this.get<OrdenesStats>(`${this.basePath}/stats`);
  }
}
