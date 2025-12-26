import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
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

  // ============================================
  // USER CRUD
  // ============================================

  /**
   * Get paginated list of users with optional filters
   */
  getUsers(query?: ListUsersQuery): Observable<PaginatedUsers> {
    let params = new HttpParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, String(value));
        }
      });
    }

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
   * Activate user
   */
  activateUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/${id}/activate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deactivate user
   */
  deactivateUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/${id}/deactivate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset user password
   */
  resetUserPassword(id: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/users/${id}/reset-password`, {
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Revoke all user tokens
   */
  revokeUserTokens(id: string, reason: string): Observable<RevokeTokensResult> {
    return this.http.post<RevokeTokensResult>(`${this.API_URL}/users/${id}/revoke-tokens`, {
      reason
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/stats`).pipe(
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('AdminService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
