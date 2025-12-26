import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { DashboardService } from '../../../../features/dashboard/services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-header.component.html',
  styles: [`
    .safe-area-top {
      padding-top: env(safe-area-inset-top, 0);
    }
  `]
})
export class MobileHeaderComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private dashboardService = inject(DashboardService);
  private dashboardSub?: Subscription;

  userName = 'Administrador';
  userAvatar = '/assets/avatar-placeholder.svg';
  ordersToday = 0;

  // Use signal directly (readonly)
  readonly currentTheme = this.themeService.theme;

  ngOnInit() {
    // Fetch stats to get orders today
    this.dashboardSub = this.dashboardService.getStats().subscribe(data => {
      this.ordersToday = data.ordenesCompletadas + data.ordenesPendientes;
    });
  }

  ngOnDestroy() {
    this.dashboardSub?.unsubscribe();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }

  get currentMonth(): string {
    return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fff"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
