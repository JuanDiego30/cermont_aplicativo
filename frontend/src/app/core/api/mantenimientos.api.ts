/**
 * MantenimientosApi - Maintenance API client
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
  Mantenimiento,
  CreateMantenimientoDto,
  UpdateMantenimientoDto,
  EjecutarMantenimientoDto,
  ProgramarMantenimientoDto,
  QueryMantenimientosDto,
  PaginatedMantenimientos,
} from '../models/mantenimiento.model';

@Injectable({
  providedIn: 'root',
})
export class MantenimientosApi extends ApiBaseService {
  /**
   * List all maintenances with optional filters
   */
  list(params?: QueryMantenimientosDto): Observable<PaginatedMantenimientos> {
    return this.get<PaginatedMantenimientos>('/mantenimientos', params);
  }

  /**
   * Get maintenance by ID
   */
  getById(id: string): Observable<Mantenimiento> {
    return this.get<Mantenimiento>(`/mantenimientos/${id}`);
  }

  /**
   * Get upcoming maintenances (next N days)
   */
  getProximos(dias: number = 7): Observable<Mantenimiento[]> {
    return this.get<Mantenimiento[]>('/mantenimientos/proximos', { dias });
  }

  /**
   * Get overdue maintenances
   */
  getVencidos(): Observable<Mantenimiento[]> {
    return this.get<Mantenimiento[]>('/mantenimientos/vencidos');
  }

  /**
   * Create new maintenance
   */
  create(data: CreateMantenimientoDto): Observable<Mantenimiento> {
    return this.post<Mantenimiento>('/mantenimientos', data);
  }

  /**
   * Update existing maintenance
   */
  update(id: string, data: UpdateMantenimientoDto): Observable<Mantenimiento> {
    return this.patch<Mantenimiento>(`/mantenimientos/${id}`, data);
  }

  /**
   * Execute maintenance
   */
  ejecutar(id: string, data: EjecutarMantenimientoDto): Observable<Mantenimiento> {
    return this.post<Mantenimiento>(`/mantenimientos/${id}/ejecutar`, data);
  }

  /**
   * Reschedule maintenance
   */
  programar(id: string, data: ProgramarMantenimientoDto): Observable<Mantenimiento> {
    return this.post<Mantenimiento>(`/mantenimientos/${id}/programar`, data);
  }

  /**
   * Delete maintenance
   */
  delete(id: string): Observable<void> {
    return this.deleteRequest<void>(`/mantenimientos/${id}`);
  }
}
