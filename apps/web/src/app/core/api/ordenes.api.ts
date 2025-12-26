/**
 * OrdenesApi - Orders API client
 * Handles all order-related operations
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
  HistorialEstado
} from '../models/orden.model';

export interface PaginatedOrdenes {
  data: Orden[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdenesStats {
  total: number;
  planeacion: number;
  ejecucion: number;
  completadas: number;
  canceladas: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenesApi extends ApiBaseService {
  /**
   * List all orders with optional filters
   */
  list(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
    return this.get<PaginatedOrdenes>('/ordenes', params);
  }

  /**
   * Get order by ID
   */
  getById(id: string): Observable<Orden> {
    return this.get<Orden>(`/ordenes/${id}`);
  }

  /**
   * Create new order
   */
  create(data: CreateOrdenDto): Observable<Orden> {
    return this.post<Orden>('/ordenes', data);
  }

  /**
   * Update existing order
   */
  update(id: string, data: UpdateOrdenDto): Observable<Orden> {
    return this.patch<Orden>(`/ordenes/${id}`, data);
  }

  /**
   * Delete order
   */
  delete(id: string): Observable<void> {
    return this.deleteRequest<void>(`/ordenes/${id}`);
  }

  /**
   * Change order status
   */
  changeEstado(id: string, dto: ChangeEstadoOrdenDto): Observable<Orden> {
    return this.post<Orden>(`/ordenes/${id}/cambiar-estado`, dto);
  }

  /**
   * Assign technician to order
   */
  asignarTecnico(ordenId: string, dto: AsignarTecnicoOrdenDto): Observable<Orden> {
    return this.post<Orden>(`/ordenes/${ordenId}/asignar-tecnico`, dto);
  }

  /**
   * Get order status history
   */
  getHistorial(id: string): Observable<HistorialEstado[]> {
    return this.get<HistorialEstado[]>(`/ordenes/${id}/historial`);
  }

  /**
   * Get order statistics
   */
  getStats(): Observable<OrdenesStats> {
    return this.get<OrdenesStats>('/ordenes/stats');
  }
}

