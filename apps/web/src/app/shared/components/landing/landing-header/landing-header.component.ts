/**
 * Landing Header Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/LandingHeader.tsx
 * 
 * Header con navegación sticky, menú móvil y toggle de tema
 */

import { Component, OnInit, signal, inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../common/theme-toggle/theme-toggle-button.component';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [RouterModule, ThemeToggleButtonComponent],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.css'
})
export class LandingHeaderComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isScrolled.set(window.scrollY > 20);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 20);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.closeMobileMenu();
    }
  }
}

