import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangeRoleDto,
  ChangePasswordDto,
  ToggleActiveDto,
  UserQueryDto,
  UserResponseDto,
  PaginatedUsersResponseDto,
  ActionResponseDto,
  UserStatsResponseDto
} from '../models/admin.model';

/**
 * Admin API Service
 * Handles all HTTP requests to the admin endpoints
 * Requires admin role for all operations
 */
@Injectable({
  providedIn: 'root'
})
export class AdminApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // ========================================
  // USUARIOS - CRUD
  // ========================================

  /**
   * Crear nuevo usuario
   * Requiere rol: admin
   */
  createUser(data: AdminCreateUserDto): Observable<ActionResponseDto<UserResponseDto>> {
    return this.http.post<ActionResponseDto<UserResponseDto>>(`${this.apiUrl}/users`, data);
  }

  /**
   * Listar todos los usuarios con filtros y paginación
   * Requiere rol: admin
   */
  listUsers(params?: UserQueryDto): Observable<PaginatedUsersResponseDto> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.role) httpParams = httpParams.set('role', params.role);
      if (params.active !== undefined) httpParams = httpParams.set('active', params.active.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<PaginatedUsersResponseDto>(`${this.apiUrl}/users`, { params: httpParams });
  }

  /**
   * Obtener usuario por ID
   * Requiere rol: admin
   */
  getUserById(id: string): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Actualizar información de usuario
   * Requiere rol: admin
   */
  updateUser(id: string, data: AdminUpdateUserDto): Observable<ActionResponseDto<UserResponseDto>> {
    return this.http.patch<ActionResponseDto<UserResponseDto>>(`${this.apiUrl}/users/${id}`, data);
  }

  // ========================================
  // USUARIOS - ROL
  // ========================================

  /**
   * Cambiar rol de usuario
   * Requiere rol: admin
   */
  changeUserRole(id: string, dto: ChangeRoleDto): Observable<ActionResponseDto<UserResponseDto>> {
    return this.http.patch<ActionResponseDto<UserResponseDto>>(`${this.apiUrl}/users/${id}/role`, dto);
  }

  // ========================================
  // USUARIOS - ACTIVACIÓN
  // ========================================

  /**
   * Activar/Desactivar usuario
   * Requiere rol: admin
   */
  toggleUserActive(id: string, dto: ToggleActiveDto): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/users/${id}/toggle-active`, dto);
  }

  // ========================================
  // USUARIOS - PASSWORD
  // ========================================

  /**
   * Cambiar contraseña de usuario (admin)
   * Requiere rol: admin
   */
  resetPassword(id: string, dto: ChangePasswordDto): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/users/${id}/password`, dto);
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Obtener estadísticas de usuarios
   * Requiere rol: admin
   */
  getUserStats(): Observable<UserStatsResponseDto> {
    return this.http.get<UserStatsResponseDto>(`${this.apiUrl}/stats/users`);
  }

  // ========================================
  // PERMISOS
  // ========================================

  /**
   * Obtener permisos de un rol
   * Requiere rol: admin o supervisor
   */
  getPermissions(role: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permissions/${role}`);
  }
}
