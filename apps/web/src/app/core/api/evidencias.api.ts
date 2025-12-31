/**
 * EvidenciasApi - Evidence/File upload API client
 * Handles file uploads (images, PDFs, videos) for orders
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
  Evidence,
  CreateEvidenceDto
} from '../models/evidencia.model';

export interface UploadEvidenceResponse {
  id: string;
  url: string;
  thumbnail?: string;
  nombre: string;
  tipo: string;
  ordenId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvidenciasApi extends ApiBaseService {
  /**
   * Upload evidence file (image, PDF, video)
   * @param ordenId Order ID
   * @param file File to upload
   * @param metadata Additional metadata (tipo, etapa, descripcion, etc.)
   */
  uploadEvidence(
    ordenId: string,
    file: File,
    metadata: {
      tipo: 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';
      etapa: 'ANTES' | 'DURANTE' | 'DESPUES';
      descripcion?: string;
      coordenadas?: { lat: number; lng: number };
    }
  ): Observable<UploadEvidenceResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ordenId', ordenId);
    formData.append('tipo', metadata.tipo);
    formData.append('etapa', metadata.etapa);

    if (metadata.descripcion) {
      formData.append('descripcion', metadata.descripcion);
    }

    if (metadata.coordenadas) {
      formData.append('coordenadas', JSON.stringify(metadata.coordenadas));
    }

    return this.upload<UploadEvidenceResponse>('/evidencias/upload', formData);
  }

  /**
   * Get evidence by ID
   */
  getById(id: string): Observable<Evidence> {
    return this.get<Evidence>(`/evidencias/${id}`);
  }

  /**
   * Get all evidence for an order
   */
  getByOrdenId(ordenId: string): Observable<Evidence[]> {
    return this.get<Evidence[]>(`/evidencias/orden/${ordenId}`);
  }

  /**
   * Delete evidence
   */
  delete(id: string): Observable<void> {
    return this.deleteRequest<void>(`/evidencias/${id}`);
  }

  /**
   * Download evidence file
   */
  downloadEvidence(id: string): Observable<Blob> {
    return this.download(`/evidencias/${id}/download`);
  }
}

