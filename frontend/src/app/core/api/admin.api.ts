import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'user';
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
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
export class AdminApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  listUsers(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Observable<PaginatedResponse<Usuario>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.rol) {
      params = params.set('rol', filters.rol);
    }

    return this.http.get<PaginatedResponse<Usuario>>(`${this.apiUrl}/users`, { params });
  }

  updateUserRole(usuarioId: string, nuevoRol: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/users/${usuarioId}/role`, {
      rol: nuevoRol
    });
  }

  updateUserStatus(usuarioId: string, nuevoEstado: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/users/${usuarioId}/status`, {
      estado: nuevoEstado
    });
  }

  deleteUser(usuarioId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${usuarioId}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
