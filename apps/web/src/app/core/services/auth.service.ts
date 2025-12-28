import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

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
    this.user$.subscribe(user => {
      this.currentUserSignal.set(user);
    });
  }

  /**
   * Registro de nuevo usuario
   */
  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerDto).pipe(
      tap(response => {
        if (response.user && response.accessToken) {
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginDto).pipe(
      tap(response => {
        // Si requiere 2FA, no guardar tokens todavía
        if (response.requires2FA) {
          return;
        }

        if (response.user && response.accessToken) {
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

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.saveTokens(response.accessToken, response.refreshToken);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
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
    return localStorage.getItem('cermont_access_token');
  }

  // Alias for backward compatibility
  getToken(): string | null {
    return this.getAccessToken();
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('cermont_refresh_token');
  }

  /**
   * Manejar éxito de autenticación
   */
  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean = false): void {
    this.userSubject.next(response.user);
    this.saveUserToStorage(response.user);
    this.saveTokens(response.accessToken, response.refreshToken);

    // Guardar flag de "recordarme"
    if (rememberMe) {
      localStorage.setItem('cermont_remember_me', 'true');
    }
  }

  /**
   * Guardar tokens
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('cermont_access_token', accessToken);
    localStorage.setItem('cermont_refresh_token', refreshToken);
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
    localStorage.removeItem('cermont_refresh_token');
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
  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'Error en la operación';
    return throwError(() => new Error(message));
  }
}
