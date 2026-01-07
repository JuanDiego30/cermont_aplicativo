import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ChecklistResponseDto,
  CreateChecklistDto,
  ListChecklistsQueryDto,
  PaginatedChecklistsResponseDto,
  AssignChecklistToOrdenDto,
  AssignChecklistToEjecucionDto,
  UpdateChecklistItemDto
} from '../models/checklist.model';

/**
 * Checklists API Service
 * Handles all HTTP requests to the checklists endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class ChecklistsApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/checklists`;

  /**
   * Listar checklists con filtros y paginación
   */
  list(params?: ListChecklistsQueryDto): Observable<PaginatedChecklistsResponseDto> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
      if (params.categoria) httpParams = httpParams.set('categoria', params.categoria);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.activo !== undefined) httpParams = httpParams.set('activo', params.activo.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.ordenId) httpParams = httpParams.set('ordenId', params.ordenId);
      if (params.ejecucionId) httpParams = httpParams.set('ejecucionId', params.ejecucionId);
    }

    return this.http.get<PaginatedChecklistsResponseDto>(this.apiUrl, { params: httpParams });
  }

  /**
   * Listar solo plantillas de checklists
   */
  listTemplates(tipo?: string): Observable<ChecklistResponseDto[]> {
    let httpParams = new HttpParams();
    if (tipo) httpParams = httpParams.set('tipo', tipo);

    return this.http.get<ChecklistResponseDto[]>(`${this.apiUrl}/templates`, { params: httpParams });
  }

  /**
   * Obtener checklist por ID
   */
  getById(id: string): Observable<ChecklistResponseDto> {
    return this.http.get<ChecklistResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva plantilla de checklist
   * Requiere rol: admin o supervisor
   */
  create(data: CreateChecklistDto): Observable<ChecklistResponseDto> {
    return this.http.post<ChecklistResponseDto>(this.apiUrl, data);
  }

  /**
   * Asignar checklist a una orden
   * Requiere rol: admin, supervisor o tecnico
   */
  assignToOrden(dto: AssignChecklistToOrdenDto): Observable<ChecklistResponseDto> {
    return this.http.post<ChecklistResponseDto>(`${this.apiUrl}/assign/orden`, dto);
  }

  /**
   * Asignar checklist a una ejecución
   * Requiere rol: admin, supervisor o tecnico
   */
  assignToEjecucion(dto: AssignChecklistToEjecucionDto): Observable<ChecklistResponseDto> {
    return this.http.post<ChecklistResponseDto>(`${this.apiUrl}/assign/ejecucion`, dto);
  }

  /**
   * Obtener checklists asignados a una orden
   */
  getByOrden(ordenId: string): Observable<ChecklistResponseDto[]> {
    return this.http.get<ChecklistResponseDto[]>(`${this.apiUrl}/orden/${ordenId}`);
  }

  /**
   * Obtener checklists asignados a una ejecución
   */
  getByEjecucion(ejecucionId: string): Observable<ChecklistResponseDto[]> {
    return this.http.get<ChecklistResponseDto[]>(`${this.apiUrl}/ejecucion/${ejecucionId}`);
  }

  /**
   * Toggle item de checklist (marcar/desmarcar)
   * Requiere rol: admin, supervisor o tecnico
   */
  toggleItem(
    checklistId: string,
    itemId: string,
    body: { ordenId?: string; ejecucionId?: string }
  ): Observable<ChecklistResponseDto> {
    return this.http.patch<ChecklistResponseDto>(
      `${this.apiUrl}/${checklistId}/items/${itemId}/toggle`,
      body
    );
  }

  /**
   * Actualizar item de checklist (observaciones)
   * Requiere rol: admin, supervisor o tecnico
   */
  updateItem(
    checklistId: string,
    itemId: string,
    dto: UpdateChecklistItemDto
  ): Observable<ChecklistResponseDto> {
    return this.http.put<ChecklistResponseDto>(
      `${this.apiUrl}/${checklistId}/items/${itemId}`,
      dto
    );
  }

  /**
   * Completar checklist manualmente
   * Requiere rol: admin, supervisor o tecnico
   */
  complete(checklistId: string): Observable<ChecklistResponseDto> {
    return this.http.post<ChecklistResponseDto>(`${this.apiUrl}/${checklistId}/complete`, {});
  }

  /**
   * Archivar checklist
   * Requiere rol: admin o supervisor
   */
  archive(checklistId: string): Observable<ChecklistResponseDto> {
    return this.http.post<ChecklistResponseDto>(`${this.apiUrl}/${checklistId}/archive`, {});
  }
}

