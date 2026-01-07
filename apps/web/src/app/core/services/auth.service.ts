import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'supervisor' | 'tecnico' | 'cliente';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  csrfToken?: string;
  requires2FA?: boolean;
  message?: string;
  expiresIn?: number;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: 'admin' | 'supervisor' | 'tecnico' | 'cliente';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly csrfHeaderName = 'x-csrf-token';
  private readonly csrfStorageKey = 'cermont_csrf_token';

  // Estado de autenticación
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  // Signals para componentes
  currentUserSignal = signal<User | null>(this.getUserFromStorage());
  isAuthenticatedSignal = computed(() => !!this.currentUserSignal());
  userRoleSignal = computed(() => this.currentUserSignal()?.role || null);

  // Aliases for backward compatibility
  public readonly isAuthenticated = this.isAuthenticatedSignal;
  public readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  public readonly isSupervisor = computed(() => this.currentUserSignal()?.role === 'supervisor');
  public readonly isTecnico = computed(() => this.currentUserSignal()?.role === 'tecnico');
  public readonly isCliente = computed(() => this.currentUserSignal()?.role === 'cliente');

  constructor() {
    // Sincronizar BehaviorSubject con Signal
    this.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.currentUserSignal.set(user);
      });
  }

  /**
   * Registro de nuevo usuario
   */
  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerDto, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user && response.token) {
          this.handleAuthSuccess(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login con soporte para 2FA y "Recordarme"
   */
  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginDto, { withCredentials: true }).pipe(
      tap(response => {
        // Si requiere 2FA, no guardar tokens todavía
        if (response.requires2FA) {
          return;
        }

        if (response.user && response.token) {
          this.handleAuthSuccess(response, loginDto.rememberMe);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verificar código 2FA durante login
   */
  verify2FALogin(email: string, password: string, code: string, rememberMe: boolean = false): Observable<AuthResponse> {
    return this.login({ email, password, twoFactorCode: code, rememberMe });
  }

  /**
   * Recuperar contraseña
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Resetear contraseña con token
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Habilitar 2FA (obtener QR)
   */
  enable2FA(): Observable<{ secret: string; qrCode: string }> {
    return this.http.post<{ secret: string; qrCode: string }>(`${this.apiUrl}/2fa/enable`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verificar y confirmar 2FA
   */
  verify2FA(code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/2fa/verify`, { token: code }).pipe(
      tap(() => {
        // Actualizar usuario con 2FA habilitado
        const user = this.currentUserSignal();
        if (user) {
          user.twoFactorEnabled = true;
          this.userSubject.next(user);
          this.saveUserToStorage(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Deshabilitar 2FA
   */
  disable2FA(password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/2fa/disable`, { password }).pipe(
      tap(() => {
        const user = this.currentUserSignal();
        if (user) {
          user.twoFactorEnabled = false;
          this.userSubject.next(user);
          this.saveUserToStorage(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  private buildCsrfRequestOptions(): { withCredentials: true; headers?: Record<string, string> } {
    const csrfToken = this.getCsrfToken();
    return csrfToken
      ? { withCredentials: true, headers: { [this.csrfHeaderName]: csrfToken } }
      : { withCredentials: true };
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<{ token: string; csrfToken?: string }> {
    // Backend soporta refreshToken vía cookie (preferred). Requiere withCredentials.
    const options = this.buildCsrfRequestOptions();

    return this.http.post<{ token: string; csrfToken?: string }>(`${this.apiUrl}/refresh`, {}, options).pipe(
      tap(response => {
        if (response?.token) {
          this.saveToken(response.token);
        }
        if (response?.csrfToken) {
          this.saveCsrfToken(response.csrfToken);
        }
      }),
      catchError(error => {
        this.clearLocalAuth();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    const options = this.buildCsrfRequestOptions();

    this.http.post(`${this.apiUrl}/logout`, {}, options).subscribe({
      complete: () => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Verificar si tiene rol específico
   */
  hasRole(roles: string | string[]): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  }

  /**
   * Obtener access token
   */
  getAccessToken(): string | null {
    // Fuente principal
    const primary = localStorage.getItem('cermont_access_token');
    if (primary) return primary;

    // Retrocompatibilidad (llaves legadas encontradas en el repo)
    return (
      localStorage.getItem('auth_token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('access_token')
    );
  }

  // Alias for backward compatibility
  getToken(): string | null {
    return this.getAccessToken();
  }

  /**
   * Manejar éxito de autenticación
   */
  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean = false): void {
    this.userSubject.next(response.user);
    this.saveUserToStorage(response.user);
    this.saveToken(response.token);

    if (response.csrfToken) {
      this.saveCsrfToken(response.csrfToken);
    }

    // Guardar flag de "recordarme"
    if (rememberMe) {
      localStorage.setItem('cermont_remember_me', 'true');
    }
  }

  getCsrfToken(): string | null {
    return localStorage.getItem(this.csrfStorageKey);
  }

  private saveCsrfToken(token: string): void {
    localStorage.setItem(this.csrfStorageKey, token);
  }

  /**
   * Guardar token
   */
  private saveToken(token: string): void {
    localStorage.setItem('cermont_access_token', token);
  }

  /**
   * Guardar usuario en storage
   */
  private saveUserToStorage(user: User): void {
    localStorage.setItem('cermont_user', JSON.stringify(user));
  }

  /**
   * Obtener usuario del storage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('cermont_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Limpiar datos de autenticación (privado)
   */
  private clearAuthData(): void {
    localStorage.removeItem('cermont_access_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('cermont_user');
    localStorage.removeItem('cermont_remember_me');
    this.userSubject.next(null);
  }

  /**
   * Limpiar autenticación local (público - para interceptor)
   * No llama al API de logout, solo limpia estado local
   */
  clearLocalAuth(): void {
    this.clearAuthData();
  }

  /**
   * Manejo de errores
   */
  private handleError(error: unknown): Observable<never> {
    const message = (error as { error?: { message?: string } })?.error?.message;
    return throwError(() => new Error(message || 'Error en la operación'));
  }
}
