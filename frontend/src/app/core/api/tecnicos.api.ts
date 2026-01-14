/**
 * TecnicosApi - Technicians API client
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
  Tecnico,
  QueryTecnicosDto,
  PaginatedTecnicos,
  DisponibilidadLevel
} from '../models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class TecnicosApi extends ApiBaseService {
  /**
   * List all technicians with optional filters
   */
  list(params?: QueryTecnicosDto): Observable<PaginatedTecnicos> {
    return this.get<PaginatedTecnicos>('/tecnicos', params);
  }

  /**
   * Get technician by ID
   */
  getById(id: string): Observable<Tecnico> {
    return this.get<Tecnico>(`/tecnicos/${id}`);
  }

  /**
   * Get available technicians for assignment
   */
  getDisponibles(): Observable<{ data: Tecnico[]; total: number }> {
    return this.get<{ data: Tecnico[]; total: number }>('/tecnicos/disponibles');
  }

  /**
   * Change technician availability
   */
  changeDisponibilidad(id: string, disponibilidad: DisponibilidadLevel): Observable<Tecnico> {
    return this.patch<Tecnico>(`/tecnicos/${id}/disponibilidad`, { disponibilidad });
  }
}

