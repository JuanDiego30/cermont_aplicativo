/**
 * AuthApi - Authentication API Client (Refactored)
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Implements full auth flow: login, register, refresh, logout, me.
 * Manages access token, CSRF token, and session state.
 * 
 * @see apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';
import { UserRole } from '../models/user.model';

// ============================================
// Response DTOs (aligned with backend)
// ============================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  csrfToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  token: string;
  csrfToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  token: string;
  csrfToken: string;
}

export interface TwoFactorRequired {
  message: string;
  requires2FA: true;
  expiresIn: number;
}

export interface LogoutResponse {
  message: string;
  tokensRevoked: number;
}

// ============================================
// Request DTOs
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ============================================
// Storage Keys (centralized)
// ============================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'cermont_access_token',
  CSRF_TOKEN: 'cermont_csrf_token',
  USER: 'cermont_user',
} as const;

const CSRF_HEADER_NAME = 'x-csrf-token';

// ============================================
// AuthApi Service
// ============================================

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Session state (reactive)
  private readonly _currentUser$ = new BehaviorSubject<AuthUser | null>(this.loadUserFromStorage());
  readonly currentUser$ = this._currentUser$.asObservable();

  // ============================================
  // PUBLIC AUTH ENDPOINTS
  // ============================================

  /**
   * POST /auth/login
   * Authenticates user, stores tokens, returns user data.
   */
  login(credentials: LoginRequest): Observable<LoginResponse | TwoFactorRequired> {
    return this.http.post<LoginResponse | TwoFactorRequired>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if ('token' in response && response.token) {
          this.storeSession(response as LoginResponse);
        }
      })
    );
  }

  /**
   * POST /auth/register
   * Creates new user account, auto-login on success.
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.token) {
          this.storeSession(response);
        }
      })
    );
  }

  /**
   * POST /auth/refresh
   * Exchanges refresh token for new access token.
   * Sends CSRF header if using cookie-based refresh.
   */
  refresh(): Observable<RefreshResponse> {
    const csrfToken = this.getCsrfToken();
    const headers = csrfToken
      ? new HttpHeaders({ [CSRF_HEADER_NAME]: csrfToken })
      : new HttpHeaders();

    return this.http.post<RefreshResponse>(
      `${this.apiUrl}/refresh`,
      {},
      { headers, withCredentials: true }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setCsrfToken(response.csrfToken);
      })
    );
  }

  /**
   * POST /auth/logout
   * Invalidates session server-side, clears local storage.
   */
  logout(): Observable<LogoutResponse> {
    const csrfToken = this.getCsrfToken();
    const headers = csrfToken
      ? new HttpHeaders({ [CSRF_HEADER_NAME]: csrfToken })
      : new HttpHeaders();

    return this.http.post<LogoutResponse>(
      `${this.apiUrl}/logout`,
      {},
      { headers, withCredentials: true }
    ).pipe(
      tap(() => this.clearSession())
    );
  }

  /**
   * GET /auth/me
   * Fetches current authenticated user's data.
   */
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`);
  }

  // ============================================
  // SESSION / TOKEN MANAGEMENT
  // ============================================

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getCsrfToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
  }

  getCurrentUser(): AuthUser | null {
    return this._currentUser$.getValue();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Quick logout (local only, when server unavailable).
   */
  clearSessionLocal(): void {
    this.clearSession();
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private storeSession(response: LoginResponse | RegisterResponse): void {
    this.setToken(response.token);
    this.setCsrfToken(response.csrfToken);
    this.setUser(response.user);
  }

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  private setCsrfToken(csrfToken: string): void {
    localStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this._currentUser$.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this._currentUser$.next(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }
}
