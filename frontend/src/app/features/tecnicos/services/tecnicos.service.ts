import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TechniciansApi } from '../../../core/api/technicians.api';
import {
    DisponibilidadLevel,
    PaginatedTecnicos,
    QueryTecnicosDto,
    Tecnico
} from '../../../core/models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class TecnicosService {
  private readonly techniciansApi = inject(TechniciansApi);

  /**
   * Lista todos los técnicos con filtros opcionales
   */
  list(params?: QueryTecnicosDto): Observable<PaginatedTecnicos> {
    return this.techniciansApi.list(params);
  }

  /**
   * Obtiene un técnico por ID
   */
  getById(id: string): Observable<Tecnico> {
    return this.techniciansApi.getById(id);
  }

  /**
   * Obtiene técnicos disponibles para asignación
   */
  getDisponibles(): Observable<{ data: Tecnico[]; total: number }> {
    return this.techniciansApi.getDisponibles();
  }

  /**
   * Cambia la disponibilidad de un técnico
   */
  changeDisponibilidad(id: string, disponibilidad: DisponibilidadLevel): Observable<Tecnico> {
    return this.techniciansApi.changeDisponibilidad(id, disponibilidad);
  }
}

