/**
 * AdminApi - Admin Management API Client (Refactored)
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Manages user CRUD, role changes, and admin statistics.
 * 
 * @see apps/api/src/modules/admin/infrastructure/controllers/admin.controller.ts
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { UserRole } from '../models/user.model';

// ============================================
// DTOs aligned with backend
// ============================================

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  active?: boolean;
}

export interface PaginatedUsers {
  data: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

// ============================================
// AdminApi Service
// ============================================

@Injectable({
  providedIn: 'root'
})
export class AdminApi extends ApiBaseService {
  private readonly basePath = '/admin';

  // ============================================
  // USER CRUD
  // ============================================

  /**
   * GET /admin/users - List users with filters and pagination
   */
  listUsers(query?: UserListQuery): Observable<PaginatedUsers> {
    return this.get<PaginatedUsers>(`${this.basePath}/users`, query as Record<string, any>);
  }

  /**
   * GET /admin/users/:id - Get user by ID
   */
  getUser(id: string): Observable<AdminUser> {
    return this.get<AdminUser>(`${this.basePath}/users/${id}`);
  }

  /**
   * POST /admin/users - Create new user
   */
  createUser(data: CreateUserDto): Observable<ActionResult<AdminUser>> {
    return this.post<ActionResult<AdminUser>>(`${this.basePath}/users`, data);
  }

  /**
   * PATCH /admin/users/:id - Update user
   */
  updateUser(id: string, data: UpdateUserDto): Observable<ActionResult<AdminUser>> {
    return this.patch<ActionResult<AdminUser>>(`${this.basePath}/users/${id}`, data);
  }

  /**
   * DELETE /admin/users/:id - Delete user (soft delete)
   */
  removeUser(id: string): Observable<ActionResult> {
    return this.deleteRequest<ActionResult>(`${this.basePath}/users/${id}`);
  }

  // ============================================
  // ROLE & STATUS
  // ============================================

  /**
   * PATCH /admin/users/:id/role - Change user role
   */
  changeRole(userId: string, role: UserRole): Observable<ActionResult<AdminUser>> {
    return this.patch<ActionResult<AdminUser>>(`${this.basePath}/users/${userId}/role`, { role });
  }

  /**
   * PATCH /admin/users/:id/toggle-active - Activate/deactivate user
   */
  toggleActive(userId: string, active: boolean, reason?: string): Observable<ActionResult> {
    return this.patch<ActionResult>(`${this.basePath}/users/${userId}/toggle-active`, { active, reason });
  }

  /**
   * PATCH /admin/users/:id/status - Update user status (backward compat)
   */
  updateStatus(userId: string, active: boolean): Observable<ActionResult> {
    return this.patch<ActionResult>(`${this.basePath}/users/${userId}/status`, { active });
  }

  /**
   * PATCH /admin/users/:id/password - Reset user password
   */
  resetPassword(userId: string, newPassword: string): Observable<ActionResult> {
    return this.patch<ActionResult>(`${this.basePath}/users/${userId}/password`, { newPassword });
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * GET /admin/stats/users - Get user statistics
   */
  getStats(): Observable<UserStats> {
    return this.get<UserStats>(`${this.basePath}/stats/users`);
  }
}
