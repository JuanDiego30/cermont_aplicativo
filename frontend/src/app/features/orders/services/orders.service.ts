import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdersApi } from '../../../core/api/orders.api';
import {
  AsignarTecnicoOrdenDto,
  ChangeEstadoOrdenDto,
  CreateOrdenDto,
  HistorialEstado,
  ListOrdenesQuery,
  Orden,
  OrdenesStats,
  PaginatedOrdenes,
  UpdateOrdenDto,
} from '../../../core/models/orden.model';

// Re-export types for components
export type { OrdenesStats, PaginatedOrdenes };

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly ordersApi = inject(OrdersApi);

  /**
   * Lista todas las órdenes con filtros opcionales
   */
  list(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
    return this.ordersApi.list(params);
  }

  /**
   * Obtiene una orden por ID
   */
  getById(id: string): Observable<Orden> {
    return this.ordersApi.getById(id);
  }

  /**
   * Crea una nueva orden
   */
  create(data: CreateOrdenDto): Observable<Orden> {
    return this.ordersApi.create(data);
  }

  /**
   * Actualiza una orden existente
   */
  update(id: string, data: UpdateOrdenDto): Observable<Orden> {
    return this.ordersApi.update(id, data);
  }

  /**
   * Elimina una orden
   */
  delete(id: string): Observable<void> {
    return this.ordersApi.delete(id);
  }

  /**
   * Cambia el estado de una orden
   */
  changeEstado(id: string, dto: ChangeEstadoOrdenDto): Observable<Orden> {
    return this.ordersApi.changeEstado(id, dto);
  }

  /**
   * Asigna un técnico a una orden
   */
  asignarTecnico(ordenId: string, dto: AsignarTecnicoOrdenDto): Observable<Orden> {
    return this.ordersApi.asignarTecnico(ordenId, dto);
  }

  /**
   * Obtiene el historial de cambios de estado de una orden
   */
  getHistorial(id: string): Observable<HistorialEstado[]> {
    return this.ordersApi.getHistorial(id);
  }

  /**
   * Obtiene estadísticas de órdenes
   */
  getStats(): Observable<OrdenesStats> {
    return this.ordersApi.getStats();
  }
}
