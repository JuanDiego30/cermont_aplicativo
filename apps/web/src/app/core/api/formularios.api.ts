import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  FormTemplateResponseDto,
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
  ListTemplatesQueryDto,
  SubmitFormDto,
  ListSubmissionsQueryDto,
  FormSubmissionResponseDto
} from '../models/formulario.model';

/**
 * Formularios API Service
 * Handles all HTTP requests to the formularios endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class FormulariosApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/formularios`;

  // ========================================
  // TEMPLATES
  // ========================================

  /**
   * Listar todos los templates
   */
  listTemplates(params?: ListTemplatesQueryDto): Observable<FormTemplateResponseDto[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.contextType) httpParams = httpParams.set('contextType', params.contextType);
      if (params.publishedOnly !== undefined) httpParams = httpParams.set('publishedOnly', params.publishedOnly.toString());
      if (params.activeOnly !== undefined) httpParams = httpParams.set('activeOnly', params.activeOnly.toString());
    }

    return this.http.get<FormTemplateResponseDto[]>(`${this.apiUrl}/templates`, { params: httpParams });
  }

  /**
   * Obtener template por ID
   */
  getTemplateById(id: string): Observable<FormTemplateResponseDto> {
    return this.http.get<FormTemplateResponseDto>(`${this.apiUrl}/templates/${id}`);
  }

  /**
   * Crear nuevo template de formulario
   */
  createTemplate(data: CreateFormTemplateDto): Observable<FormTemplateResponseDto> {
    return this.http.post<FormTemplateResponseDto>(`${this.apiUrl}/templates`, data);
  }

  /**
   * Actualizar template
   */
  updateTemplate(id: string, data: UpdateFormTemplateDto): Observable<FormTemplateResponseDto> {
    return this.http.put<FormTemplateResponseDto>(`${this.apiUrl}/templates/${id}`, data);
  }

  /**
   * Publicar template
   */
  publishTemplate(id: string): Observable<FormTemplateResponseDto> {
    return this.http.post<FormTemplateResponseDto>(`${this.apiUrl}/templates/${id}/publish`, {});
  }

  /**
   * Archivar template
   */
  archiveTemplate(id: string): Observable<FormTemplateResponseDto> {
    return this.http.post<FormTemplateResponseDto>(`${this.apiUrl}/templates/${id}/archive`, {});
  }

  /**
   * Desactivar template (soft delete)
   */
  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
  }

  /**
   * Generar template desde PDF o Excel
   */
  parseAndCreateTemplate(file: File): Observable<FormTemplateResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FormTemplateResponseDto>(`${this.apiUrl}/templates/parse`, formData);
  }

  // ========================================
  // SUBMISSIONS (Formularios completados)
  // ========================================

  /**
   * Enviar formulario completado
   */
  submitForm(data: SubmitFormDto): Observable<FormSubmissionResponseDto> {
    return this.http.post<FormSubmissionResponseDto>(`${this.apiUrl}/submit`, data);
  }

  /**
   * Listar formularios completados
   */
  listSubmissions(params?: ListSubmissionsQueryDto): Observable<FormSubmissionResponseDto[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.templateId) httpParams = httpParams.set('templateId', params.templateId);
      if (params.contextType) httpParams = httpParams.set('contextType', params.contextType);
      if (params.contextId) httpParams = httpParams.set('contextId', params.contextId);
    }

    return this.http.get<FormSubmissionResponseDto[]>(`${this.apiUrl}/submissions`, { params: httpParams });
  }

  /**
   * Obtener formulario completado por ID
   */
  getSubmissionById(id: string): Observable<FormSubmissionResponseDto> {
    return this.http.get<FormSubmissionResponseDto>(`${this.apiUrl}/submissions/${id}`);
  }

  // ========================================
  // LEGACY ENDPOINTS (deprecar)
  // ========================================

  /**
   * [LEGACY] Listar formularios completados
   * @deprecated Usar listSubmissions en su lugar
   */
  findAllInstances(params?: {
    templateId?: string;
    ordenId?: string;
    estado?: string;
  }): Observable<any[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.templateId) httpParams = httpParams.set('templateId', params.templateId);
      if (params.ordenId) httpParams = httpParams.set('ordenId', params.ordenId);
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
    }

    return this.http.get<any[]>(`${this.apiUrl}/instances`, { params: httpParams });
  }

  /**
   * [LEGACY] Obtener formulario completado por ID
   * @deprecated Usar getSubmissionById en su lugar
   */
  findInstanceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/instances/${id}`);
  }
}

