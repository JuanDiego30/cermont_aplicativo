/**
 * EvidenciasApi - Evidence/File upload API client
 * Handles file uploads (images, PDFs, videos) for orders
 * Updated to match backend endpoints
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  EvidenciaResponse,
  UploadEvidenciaDto,
  ListEvidenciasQueryDto,
  ListEvidenciasResponse,
  UploadEvidenciaResponse,
  TempDownloadUrlResponse,
  DeleteEvidenciaResponse,
  // Legacy types
  Evidence,
  CreateEvidenceDto
} from '../models/evidencia.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenciasApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/evidencias`;

  /**
   * List evidencias with filters and pagination
   */
  list(params?: ListEvidenciasQueryDto): Observable<ListEvidenciasResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.ordenId) httpParams = httpParams.set('ordenId', params.ordenId);
      if (params.ejecucionId) httpParams = httpParams.set('ejecucionId', params.ejecucionId);
      if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.includeDeleted !== undefined) httpParams = httpParams.set('includeDeleted', params.includeDeleted.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ListEvidenciasResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * List evidencias by orden (legacy endpoint for compatibility)
   */
  getByOrdenId(ordenId: string, page?: number, limit?: number): Observable<ListEvidenciasResponse> {
    let httpParams = new HttpParams();
    if (page) httpParams = httpParams.set('page', page.toString());
    if (limit) httpParams = httpParams.set('limit', limit.toString());

    return this.http.get<ListEvidenciasResponse>(`${this.apiUrl}/orden/${ordenId}`, { params: httpParams });
  }

  /**
   * Get evidencia by ID
   */
  getById(id: string): Observable<EvidenciaResponse> {
    return this.http.get<EvidenciaResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload new evidencia (photo, video, doc)
   * @param file File to upload (field name: 'archivo' or 'file')
   * @param dto Metadata for the evidencia
   */
  upload(file: File, dto: UploadEvidenciaDto): Observable<UploadEvidenciaResponse> {
    const formData = new FormData();
    formData.append('archivo', file); // Backend accepts 'archivo' or 'file'
    formData.append('ordenId', dto.ordenId);
    
    if (dto.ejecucionId) formData.append('ejecucionId', dto.ejecucionId);
    if (dto.tipo) formData.append('tipo', dto.tipo);
    if (dto.descripcion) formData.append('descripcion', dto.descripcion);
    if (dto.tags) formData.append('tags', dto.tags);

    return this.http.post<UploadEvidenciaResponse>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Download evidencia file
   */
  download(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate temporary download URL (1h validity)
   */
  getTempDownloadUrl(id: string): Observable<TempDownloadUrlResponse> {
    return this.http.get<TempDownloadUrlResponse>(`${this.apiUrl}/${id}/temp-url`);
  }

  /**
   * Download evidencia using temporary token (public endpoint)
   */
  downloadByToken(token: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${token}`, {
      responseType: 'blob'
    });
  }

  /**
   * Delete evidencia (soft delete by default)
   * @param id Evidencia ID
   * @param permanent If true, permanent delete
   */
  delete(id: string, permanent: boolean = false): Observable<DeleteEvidenciaResponse> {
    let httpParams = new HttpParams();
    if (permanent) httpParams = httpParams.set('permanent', 'true');

    return this.http.delete<DeleteEvidenciaResponse>(`${this.apiUrl}/${id}`, { params: httpParams });
  }

  // ========================================
  // LEGACY METHODS (for backward compatibility)
  // ========================================

  /**
   * [LEGACY] Upload evidence file
   * @deprecated Usar upload() en su lugar
   */
  uploadEvidence(
    ordenId: string,
    file: File,
    metadata: {
      tipo: 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';
      etapa?: 'ANTES' | 'DURANTE' | 'DESPUES';
      descripcion?: string;
      coordenadas?: { lat: number; lng: number };
    }
  ): Observable<UploadEvidenciaResponse> {
    const dto: UploadEvidenciaDto = {
      ordenId,
      tipo: metadata.tipo,
      descripcion: metadata.descripcion
    };

    return this.upload(file, dto);
  }

  /**
   * [LEGACY] Get evidence by ID
   * @deprecated Usar getById() en su lugar
   */
  getEvidenceById(id: string): Observable<Evidence> {
    return this.getById(id);
  }

  /**
   * [LEGACY] Download evidence file
   * @deprecated Usar download() en su lugar
   */
  downloadFile(id: string): Observable<Blob> {
    return this.download(id);
  }
}

