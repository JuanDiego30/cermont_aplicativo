import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from '../utils/http-params.util';
import { createHttpErrorHandler } from '../utils/http-error.util';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ListUsersQuery,
  PaginatedUsers,
  UserStats,
  RolePermissions,
  RevokeTokensResult
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/admin`;
  private readonly handleError = createHttpErrorHandler('AdminService');

  // ============================================
  // USER CRUD
  // ============================================

  /**
   * Get paginated list of users with optional filters
   */
  getUsers(query?: ListUsersQuery): Observable<PaginatedUsers> {
    const params = buildHttpParams(query as unknown as Record<string, unknown> | undefined);

    return this.http.get<PaginatedUsers>(`${this.API_URL}/users`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new user
   */
  createUser(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update user
   */
  updateUser(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id}`, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update user role
   */
  updateUserRole(id: string, dto: UpdateUserRoleDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id}/role`, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Toggle user active status (activate/deactivate)
   * Backend uses: PATCH /admin/users/:id/toggle-active
   */
  toggleUserActive(id: string, active: boolean, reason?: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.API_URL}/users/${id}/toggle-active`, {
      active,
      reason
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @deprecated Use toggleUserActive instead
   */
  activateUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.toggleUserActive(id, true);
  }

  /**
   * @deprecated Use toggleUserActive instead
   */
  deactivateUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.toggleUserActive(id, false);
  }

  /**
   * Reset user password (admin action)
   * Backend uses: PATCH /admin/users/:id/password
   */
  resetUserPassword(id: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.API_URL}/users/${id}/password`, {
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // NOTE: revokeUserTokens endpoint does not exist in backend
  // If needed, implement it in AdminController first
  // /**
  //  * Revoke all user tokens
  //  */
  // revokeUserTokens(id: string, reason: string): Observable<RevokeTokensResult> {
  //   return this.http.post<RevokeTokensResult>(`${this.API_URL}/users/${id}/revoke-tokens`, {
  //     reason
  //   }).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get user statistics
   * Backend uses: GET /admin/stats/users
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/stats/users`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // ROLES & PERMISSIONS
  // ============================================

  /**
   * Get all roles with their permissions
   */
  getAllRolesPermissions(): Observable<RolePermissions[]> {
    return this.http.get<RolePermissions[]>(`${this.API_URL}/roles`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

}
