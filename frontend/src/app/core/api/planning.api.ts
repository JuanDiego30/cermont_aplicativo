/**
 * PlaneacionApi - Planning API client
 * Connects to /api/planning endpoints
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePlaneacionDto,
  Planeacion,
  PlaneacionResponse,
  RechazarPlaneacionDto,
} from '../models/planning.model';
import { ApiBaseService } from './api-base.service';

@Injectable({
  providedIn: 'root',
})
export class PlaneacionApi extends ApiBaseService {
  /**
   * Get planning by order ID
   */
  getByOrden(ordenId: string): Observable<Planeacion> {
    return this.get<Planeacion>(`/planning/${ordenId}`);
  }

  /**
   * Create or update planning for an order
   */
  createOrUpdate(ordenId: string, data: CreatePlaneacionDto): Observable<PlaneacionResponse> {
    return this.post<PlaneacionResponse>(`/planning/${ordenId}`, data);
  }

  /**
   * Approve planning
   */
  aprobar(id: string, userId?: string): Observable<PlaneacionResponse> {
    return this.put<PlaneacionResponse>(`/planning/${id}/approve`, {
      userId,
    });
  }

  /**
   * Reject planning with reason
   */
  rechazar(id: string, dto: RechazarPlaneacionDto): Observable<PlaneacionResponse> {
    return this.put<PlaneacionResponse>(`/planning/${id}/reject`, dto);
  }
}
