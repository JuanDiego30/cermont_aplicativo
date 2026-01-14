import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TecnicosApi } from '../../../core/api/tecnicos.api';
import {
  Tecnico,
  QueryTecnicosDto,
  PaginatedTecnicos,
  DisponibilidadLevel
} from '../../../core/models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class TecnicosService {
  private readonly tecnicosApi = inject(TecnicosApi);

  /**
   * Lista todos los técnicos con filtros opcionales
   */
  list(params?: QueryTecnicosDto): Observable<PaginatedTecnicos> {
    return this.tecnicosApi.list(params);
  }

  /**
   * Obtiene un técnico por ID
   */
  getById(id: string): Observable<Tecnico> {
    return this.tecnicosApi.getById(id);
  }

  /**
   * Obtiene técnicos disponibles para asignación
   */
  getDisponibles(): Observable<{ data: Tecnico[]; total: number }> {
    return this.tecnicosApi.getDisponibles();
  }

  /**
   * Cambia la disponibilidad de un técnico
   */
  changeDisponibilidad(id: string, disponibilidad: DisponibilidadLevel): Observable<Tecnico> {
    return this.tecnicosApi.changeDisponibilidad(id, disponibilidad);
  }
}

