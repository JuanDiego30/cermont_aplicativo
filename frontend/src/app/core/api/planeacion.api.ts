/**
 * PlaneacionApi - Planning API client
 * Connects to /api/planeacion endpoints
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
    Planeacion,
    CreatePlaneacionDto,
    RechazarPlaneacionDto,
    PlaneacionResponse,
} from '../models/planeacion.model';

@Injectable({
    providedIn: 'root',
})
export class PlaneacionApi extends ApiBaseService {
    /**
     * Get planning by order ID
     */
    getByOrden(ordenId: string): Observable<Planeacion> {
        return this.get<Planeacion>(`/planeacion/${ordenId}`);
    }

    /**
     * Create or update planning for an order
     */
    createOrUpdate(
        ordenId: string,
        data: CreatePlaneacionDto
    ): Observable<PlaneacionResponse> {
        return this.post<PlaneacionResponse>(`/planeacion/${ordenId}`, data);
    }

    /**
     * Approve planning
     */
    aprobar(id: string, userId?: string): Observable<PlaneacionResponse> {
        return this.put<PlaneacionResponse>(`/planeacion/${id}/aprobar`, {
            userId,
        });
    }

    /**
     * Reject planning with reason
     */
    rechazar(
        id: string,
        dto: RechazarPlaneacionDto
    ): Observable<PlaneacionResponse> {
        return this.put<PlaneacionResponse>(`/planeacion/${id}/rechazar`, dto);
    }
}
