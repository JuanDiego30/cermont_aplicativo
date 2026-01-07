/**
 * ChecklistsApi - Checklists API Client
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Manages checklist templates, assignments, and item tracking.
 * 
 * @see apps/api/src/modules/checklists/infrastructure/controllers/checklists.controller.ts
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

// ============================================
// DTOs aligned with backend
// ============================================

export interface ChecklistItem {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: string;
    completado: boolean;
    observaciones?: string;
    completadoPorId?: string;
    completadoEn?: string;
}

export interface Checklist {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: string;
    categoria?: string;
    activo: boolean;
    items: ChecklistItem[];
    ordenId?: string;
    ejecucionId?: string;
    completado: boolean;
    completadoPorId?: string;
    completadoEn?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateChecklistDto {
    nombre: string;
    descripcion?: string;
    tipo: string;
    categoria?: string;
    items: Omit<ChecklistItem, 'id' | 'completado' | 'completadoPorId' | 'completadoEn'>[];
}

export interface ListChecklistsQuery {
    tipo?: string;
    categoria?: string;
    activo?: boolean;
    ordenId?: string;
    ejecucionId?: string;
    page?: number;
    limit?: number;
}

export interface AssignChecklistToOrdenDto {
    checklistTemplateId: string;
    ordenId: string;
}

export interface AssignChecklistToEjecucionDto {
    checklistTemplateId: string;
    ejecucionId: string;
}

export interface UpdateChecklistItemDto {
    observaciones?: string;
}

export interface PaginatedChecklists {
    items: Checklist[];
    total: number;
    page: number;
    limit: number;
}

// ============================================
// ChecklistsApi Service
// ============================================

@Injectable({
    providedIn: 'root'
})
export class ChecklistsApi extends ApiBaseService {
    private readonly basePath = '/checklists';

    /**
     * GET /checklists - List checklists with filters
     */
    list(query?: ListChecklistsQuery): Observable<PaginatedChecklists> {
        return this.get<PaginatedChecklists>(this.basePath, query as Record<string, unknown>);
    }

    /**
     * GET /checklists/templates - List only checklist templates
     */
    getTemplates(tipo?: string): Observable<Checklist[]> {
        const params = tipo ? { tipo } : undefined;
        return this.get<Checklist[]>(`${this.basePath}/templates`, params as Record<string, unknown>);
    }

    /**
     * GET /checklists/:id - Get checklist by ID
     */
    getById(id: string): Observable<Checklist> {
        return this.get<Checklist>(`${this.basePath}/${id}`);
    }

    /**
     * POST /checklists - Create checklist template
     */
    create(dto: CreateChecklistDto): Observable<Checklist> {
        return this.post<Checklist>(this.basePath, dto);
    }

    /**
     * POST /checklists/assign/orden - Assign checklist to order
     */
    assignToOrden(dto: AssignChecklistToOrdenDto): Observable<Checklist> {
        return this.post<Checklist>(`${this.basePath}/assign/orden`, dto);
    }

    /**
     * POST /checklists/assign/ejecucion - Assign checklist to execution
     */
    assignToEjecucion(dto: AssignChecklistToEjecucionDto): Observable<Checklist> {
        return this.post<Checklist>(`${this.basePath}/assign/ejecucion`, dto);
    }

    /**
     * GET /checklists/orden/:ordenId - Get checklists for an order
     */
    getByOrden(ordenId: string): Observable<Checklist[]> {
        return this.get<Checklist[]>(`${this.basePath}/orden/${ordenId}`);
    }

    /**
     * GET /checklists/ejecucion/:ejecucionId - Get checklists for an execution
     */
    getByEjecucion(ejecucionId: string): Observable<Checklist[]> {
        return this.get<Checklist[]>(`${this.basePath}/ejecucion/${ejecucionId}`);
    }

    /**
     * PATCH /checklists/:checklistId/items/:itemId/toggle - Toggle item completion
     */
    toggleItem(
        checklistId: string,
        itemId: string,
        context: { ordenId?: string; ejecucionId?: string }
    ): Observable<Checklist> {
        return this.patch<Checklist>(
            `${this.basePath}/${checklistId}/items/${itemId}/toggle`,
            context
        );
    }

    /**
     * PUT /checklists/:checklistId/items/:itemId - Update item observations
     */
    updateItem(
        checklistId: string,
        itemId: string,
        dto: UpdateChecklistItemDto
    ): Observable<Checklist> {
        return this.put<Checklist>(
            `${this.basePath}/${checklistId}/items/${itemId}`,
            dto
        );
    }

    /**
     * POST /checklists/:checklistId/complete - Complete checklist
     */
    complete(checklistId: string): Observable<Checklist> {
        return this.post<Checklist>(`${this.basePath}/${checklistId}/complete`, {});
    }

    /**
     * POST /checklists/:checklistId/archive - Archive checklist
     */
    archive(checklistId: string): Observable<Checklist> {
        return this.post<Checklist>(`${this.basePath}/${checklistId}/archive`, {});
    }
}
