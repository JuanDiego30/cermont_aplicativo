/**
 * HesApi - HES API client
 * Connects to /hes endpoints (NestJS)
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { CreateHESDto, HES, SignHESDto } from '../models/hes.model';

export type ListHesQuery = {
  estado?: string;
  tipoServicio?: string;
  ordenId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};

@Injectable({
  providedIn: 'root',
})
export class HesApi extends ApiBaseService {
  list(query?: ListHesQuery): Observable<HES[]> {
    return this.get<HES[]>('/hes', query);
  }

  getById(id: string): Observable<HES> {
    return this.get<HES>(`/hes/${id}`);
  }

  getByOrden(ordenId: string): Observable<HES> {
    return this.get<HES>(`/hes/orden/${ordenId}`);
  }

  create(dto: CreateHESDto): Observable<HES> {
    return this.post<HES>('/hes', dto);
  }

  signCliente(id: string, dto: SignHESDto): Observable<HES> {
    return this.post<HES>(`/hes/${id}/firmar-cliente`, dto);
  }

  signTecnico(id: string, dto: SignHESDto): Observable<HES> {
    return this.post<HES>(`/hes/${id}/firmar-tecnico`, dto);
  }

  complete(id: string): Observable<HES> {
    return this.put<HES>(`/hes/${id}/completar`);
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.download(`/hes/${id}/pdf`);
  }
}
