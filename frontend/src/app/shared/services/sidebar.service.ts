import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  readonly isExpanded = signal(true);
  readonly isMobileOpen = signal(false);
  readonly isHovered = signal(false);

  readonly isExpanded$ = toObservable(this.isExpanded);
  readonly isMobileOpen$ = toObservable(this.isMobileOpen);
  readonly isHovered$ = toObservable(this.isHovered);

  setExpanded(val: boolean) {
    this.isExpanded.set(val);
  }

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }

  setMobileOpen(val: boolean) {
    this.isMobileOpen.set(val);
  }

  toggleMobileOpen() {
    this.isMobileOpen.update(v => !v);
  }

  setHovered(val: boolean) {
    this.isHovered.set(val);
  }
}
