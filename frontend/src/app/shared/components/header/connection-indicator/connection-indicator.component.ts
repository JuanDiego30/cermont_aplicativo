/**
 * Connection Indicator Component - Migrado de Next.js
 * @see apps/web-old/src/components/ui/HeaderConnectionIndicator.tsx
 * 
 * Indicador de estado de conexión con sincronización offline
 */

import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface SyncProgress {
  current: number;
  total: number;
}

@Component({
  selector: 'app-connection-indicator',
  standalone: true,
  imports: [],
  templateUrl: './connection-indicator.component.html',
  styleUrl: './connection-indicator.component.css'
})
export class ConnectionIndicatorComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  isOpen = signal(false);
  isOnline = signal(navigator.onLine);
  isSyncing = signal(false);
  pendingItems = signal(0);
  syncError = signal<string | null>(null);
  lastSync = signal<Date | null>(null);
  progress = signal<SyncProgress | null>(null);

  private onlineHandler?: () => void;
  private offlineHandler?: () => void;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.onlineHandler = () => {
      this.isOnline.set(true);
      this.syncError.set(null);
    };

    this.offlineHandler = () => {
      this.isOnline.set(false);
    };

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);

    // Simular estado inicial (en producción vendría de un servicio)
    this.checkSyncStatus();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
    }
    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler);
    }
  }

  private checkSyncStatus(): void {
    // En producción, esto vendría de un servicio de sincronización
    // Por ahora, simulación
    const pending = localStorage.getItem('pendingSyncItems');
    if (pending) {
      try {
        const items = JSON.parse(pending);
        this.pendingItems.set(items.length || 0);
      } catch {
        this.pendingItems.set(0);
      }
    }
  }

  togglePopover(): void {
    this.isOpen.update(v => !v);
  }

  closePopover(): void {
    this.isOpen.set(false);
  }

  manualSync(): void {
    if (!this.isOnline() || this.isSyncing()) return;

    this.isSyncing.set(true);
    this.syncError.set(null);

    // Simular sincronización
    setTimeout(() => {
      this.isSyncing.set(false);
      this.pendingItems.set(0);
      this.lastSync.set(new Date());
      localStorage.removeItem('pendingSyncItems');
    }, 2000);
  }

  getStatusColor(): string {
    if (this.syncError()) return 'text-red-500';
    if (!this.isOnline()) return 'text-amber-500';
    if (this.isSyncing()) return 'text-blue-500';
    return 'text-emerald-500';
  }

  getStatusBg(): string {
    if (this.syncError()) return 'bg-red-500';
    if (!this.isOnline()) return 'bg-amber-500';
    if (this.isSyncing()) return 'bg-blue-500';
    return 'bg-emerald-500';
  }

  getStatusText(): string {
    if (this.syncError()) return 'Error de conexión';
    if (!this.isOnline()) return 'Sin conexión';
    if (this.isSyncing()) return 'Sincronizando...';
    return 'Conectado';
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    
    return date.toLocaleDateString('es-CO');
  }
}

