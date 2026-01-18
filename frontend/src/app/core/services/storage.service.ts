import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }

  getToken(): string | null {
    // Fuente principal
    const primary = this.getItem('cermont_access_token');
    if (primary) return primary;

    // Retrocompatibilidad
    return this.getItem('auth_token') || this.getItem('authToken') || this.getItem('access_token');
  }

  setToken(token: string): void {
    this.setItem('cermont_access_token', token);
  }

  removeToken(): void {
    this.removeItem('cermont_access_token');
    this.removeItem('auth_token');
    this.removeItem('authToken');
    this.removeItem('access_token');
  }

  getRefreshToken(): string | null {
    return this.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    this.setItem('refreshToken', token);
  }

  removeRefreshToken(): void {
    this.removeItem('refreshToken');
  }
}
