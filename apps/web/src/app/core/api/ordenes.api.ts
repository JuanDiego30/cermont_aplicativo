import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

interface Orden {
  id?: string;
  numero: string;
  cliente: string;
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenesApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ordenes`;

  list(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Observable<PaginatedResponse<Orden>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }

    return this.http.get<PaginatedResponse<Orden>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Orden> {
    return this.http.get<Orden>(`${this.apiUrl}/${id}`);
  }

  create(orden: Orden): Observable<Orden> {
    return this.http.post<Orden>(this.apiUrl, orden);
  }

  update(id: string, orden: Orden): Observable<Orden> {
    return this.http.put<Orden>(`${this.apiUrl}/${id}`, orden);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
