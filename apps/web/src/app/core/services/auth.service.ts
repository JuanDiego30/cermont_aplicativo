import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { AuthApi } from '../api/auth.api';
import { User } from '../models/user.model';
import { LoginDto, RegisterDto, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  // Estado de autenticación
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  // Signals para componentes
  public readonly currentUserSignal = signal<User | null>(null);
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  public readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  public readonly isSupervisor = computed(() => this.currentUserSignal()?.role === 'supervisor');
  public readonly isTecnico = computed(() => this.currentUserSignal()?.role === 'tecnico');

  constructor() {
    this.loadUserFromStorage();
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.api.login(dto).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.api.register(dto).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.clearAuthData(),
      error: () => this.clearAuthData(),
    });
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.refresh(refreshToken).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setToken(response.token);
    this.setRefreshToken(response.refreshToken);
    this.setUser(response.user);
    this.currentUserSignal.set(response.user);
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSignal.set(user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.clearAuthData();
      }
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private setUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Role checks
  hasRole(roles: string[]): boolean {
    const user = this.currentUserSignal();
    return user ? roles.includes(user.role) : false;
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return false;
  }
}
