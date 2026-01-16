/**
 * TecnicosApi - Technicians API client
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DisponibilidadLevel,
  PaginatedTecnicos,
  QueryTecnicosDto,
  Tecnico,
} from '../models/tecnico.model';
import { ApiBaseService } from './api-base.service';

@Injectable({
  providedIn: 'root',
})
export class TecnicosApi extends ApiBaseService {
  /**
   * List all technicians with optional filters
   */
  list(params?: QueryTecnicosDto): Observable<PaginatedTecnicos> {
    return this.get<PaginatedTecnicos>('/technicians', params);
  }

  /**
   * Get technician by ID
   */
  getById(id: string): Observable<Tecnico> {
    return this.get<Tecnico>(`/technicians/${id}`);
  }

  /**
   * Get available technicians for assignment
   */
  getDisponibles(): Observable<{ data: Tecnico[]; total: number }> {
    return this.get<{ data: Tecnico[]; total: number }>('/technicians/available');
  }

  /**
   * Change technician availability
   */
  changeDisponibilidad(id: string, disponibilidad: DisponibilidadLevel): Observable<Tecnico> {
    return this.patch<Tecnico>(`/technicians/${id}/availability`, { availability: disponibilidad });
  }
}
