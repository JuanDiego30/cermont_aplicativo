/**
 * EvidenciasApi - Evidence/File upload API client
 * Handles file uploads (images, PDFs, videos) for orders
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evidence } from '../models/evidencia.model';
import { ApiBaseService } from './api-base.service';

export interface UploadEvidenceResponse {
  id: string;
  url: string;
  thumbnail?: string;
  nombre: string;
  tipo: string;
  ordenId: string;
}

@Injectable({
  providedIn: 'root',
})
export class EvidenceApi extends ApiBaseService {
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

    return super.upload<UploadEvidenceResponse>('/evidence/upload', formData);
  }

  /**
   * Get evidence by ID
   */
  getById(id: string): Observable<Evidence> {
    return this.get<Evidence>(`/evidence/${id}`);
  }

  /**
   * Get all evidence for an order
   */
  getByOrdenId(ordenId: string): Observable<Evidence[]> {
    return this.get<Evidence[]>(`/evidence/order/${ordenId}`);
  }

  /**
   * Delete evidence
   */
  delete(id: string): Observable<void> {
    return this.deleteRequest<void>(`/evidence/${id}`);
  }

  /**
   * Download evidence file
   */
  downloadFile(id: string): Observable<Blob> {
    return super.download(`/evidence/${id}/download`);
  }
}
