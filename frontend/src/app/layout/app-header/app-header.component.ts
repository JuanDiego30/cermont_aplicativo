/**
 * App Header Component - Mejorado con funcionalidades de Next.js
 * @see apps/web-old/src/layout/AppHeader.tsx
 */

import { Component, ElementRef, ViewChild, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { SidebarService } from '../../shared/services/sidebar.service';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../shared/components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../shared/components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../shared/components/header/user-dropdown/user-dropdown.component';
import { ConnectionIndicatorComponent } from '../../shared/components/header/connection-indicator/connection-indicator.component';

@Component({
    selector: 'app-header',
    imports: [
        RouterModule,
        ThemeToggleButtonComponent,
        NotificationDropdownComponent,
        UserDropdownComponent,
        ConnectionIndicatorComponent
    ],
    templateUrl: './app-header.component.html'
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sidebarService = inject(SidebarService);

  isApplicationMenuOpen = signal(false);
  showSearch = signal(false);
  readonly isMobileOpen$ = this.sidebarService.isMobileOpen$;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  handleToggle(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth >= 1280) {
        this.sidebarService.toggleExpanded();
      } else {
        this.sidebarService.toggleMobileOpen();
      }
    }
  }

  toggleApplicationMenu(): void {
    this.isApplicationMenuOpen.update(v => !v);
  }

  toggleSearch(): void {
    this.showSearch.update(v => !v);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };
}
