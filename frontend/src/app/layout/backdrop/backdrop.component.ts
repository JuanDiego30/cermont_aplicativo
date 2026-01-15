import { Component, inject } from '@angular/core';
import { SidebarService } from '../../shared/services/sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-backdrop',
    imports: [CommonModule],
    template: '<div class="backdrop"></div>',
    styles: ['.backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 998; }']
})
export class BackdropComponent {
  private readonly sidebarService = inject(SidebarService);
  readonly isMobileOpen$;

  constructor() {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeSidebar() {
    this.sidebarService.setMobileOpen(false);
  }
}
