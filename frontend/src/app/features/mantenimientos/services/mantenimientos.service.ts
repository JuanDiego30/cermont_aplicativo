import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MantenimientosApi } from '../../../core/api/mantenimientos.api';
import {
  Mantenimiento,
  CreateMantenimientoDto,
  UpdateMantenimientoDto,
  EjecutarMantenimientoDto,
  ProgramarMantenimientoDto,
  QueryMantenimientosDto,
  PaginatedMantenimientos
} from '../../../core/models/mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {
  private readonly mantenimientosApi = inject(MantenimientosApi);

  /**
   * Lista todos los mantenimientos con filtros opcionales
   */
  list(params?: QueryMantenimientosDto): Observable<PaginatedMantenimientos> {
    return this.mantenimientosApi.list(params);
  }

  /**
   * Obtiene un mantenimiento por ID
   */
  getById(id: string): Observable<Mantenimiento> {
    return this.mantenimientosApi.getById(id);
  }

  /**
   * Obtiene mantenimientos próximos (próximos N días)
   */
  getProximos(dias: number = 7): Observable<Mantenimiento[]> {
    return this.mantenimientosApi.getProximos(dias);
  }

  /**
   * Obtiene mantenimientos vencidos
   */
  getVencidos(): Observable<Mantenimiento[]> {
    return this.mantenimientosApi.getVencidos();
  }

  /**
   * Crea un nuevo mantenimiento
   */
  create(data: CreateMantenimientoDto): Observable<Mantenimiento> {
    return this.mantenimientosApi.create(data);
  }

  /**
   * Actualiza un mantenimiento existente
   */
  update(id: string, data: UpdateMantenimientoDto): Observable<Mantenimiento> {
    return this.mantenimientosApi.update(id, data);
  }

  /**
   * Ejecuta un mantenimiento
   */
  ejecutar(id: string, data: EjecutarMantenimientoDto): Observable<Mantenimiento> {
    return this.mantenimientosApi.ejecutar(id, data);
  }

  /**
   * Reprograma un mantenimiento
   */
  programar(id: string, data: ProgramarMantenimientoDto): Observable<Mantenimiento> {
    return this.mantenimientosApi.programar(id, data);
  }

  /**
   * Elimina un mantenimiento
   */
  delete(id: string): Observable<void> {
    return this.mantenimientosApi.delete(id);
  }
}

