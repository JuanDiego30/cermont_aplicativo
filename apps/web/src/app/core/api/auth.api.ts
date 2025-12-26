/**
 * AuthApi - Authentication API client
 * Handles login, register, refresh token, and user profile
 */
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import { StorageService } from '../services/storage.service';
import { AuthResponse, LoginDto, RegisterDto, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApi extends ApiBaseService {
  private readonly storage = inject(StorageService);

  /**
   * Login with email and password
   */
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        const token = response.token || response.access_token;
        const refreshToken = response.refreshToken || response.refresh_token;
        
        if (token) {
          this.storage.setToken(token);
        }
        if (refreshToken) {
          this.storage.setItem('refreshToken', refreshToken);
        }
      })
    );
  }

  /**
   * Register new user
   */
  register(data: RegisterDto): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => {
        const token = response.token || response.access_token;
        const refreshToken = response.refreshToken || response.refresh_token;
        
        if (token) {
          this.storage.setToken(token);
        }
        if (refreshToken) {
          this.storage.setItem('refreshToken', refreshToken);
        }
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(response => {
        const token = response.token || response.access_token;
        const refreshToken = response.refreshToken || response.refresh_token;
        
        if (token) {
          this.storage.setToken(token);
        }
        if (refreshToken) {
          this.storage.setItem('refreshToken', refreshToken);
        }
      })
    );
  }

  /**
   * Get current user profile
   */
  getMe(): Observable<User> {
    return this.get<User>('/auth/me');
  }

  /**
   * Logout (optional: call backend to invalidate token)
   */
  logout(): Observable<void> {
    return this.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        this.storage.removeToken();
        this.storage.removeItem('refreshToken');
      })
    );
  }
}

