import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  PaginatedUsersResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/admin/users`;

  /**
   * Obtiene todos los usuarios con paginación y filtros
   */
  getUsers(params?: UserQueryParams): Observable<PaginatedUsersResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedUsersResponse>(this.API_URL, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un usuario por su ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.API_URL, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: string, user: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cambia el rol de un usuario
   */
  changeUserRole(id: string, role: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/role`, { role }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Activa un usuario
   */
  activateUser(id: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/activate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Desactiva un usuario
   */
  deactivateUser(id: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/deactivate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Resetea la contraseña de un usuario
   */
  resetUserPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/reset-password`, { password: newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Revoca todos los tokens activos de un usuario
   */
  revokeUserTokens(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/revoke-tokens`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  getUserStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/stats/overview`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene actividad reciente de usuarios
   */
  getUserActivity(): Observable<any> {
    return this.http.get(`${this.API_URL}/stats/activity`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene logs de auditoría
   */
  getAuditLogs(params?: { page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.API_URL}/audit-logs`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error en AdminService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

