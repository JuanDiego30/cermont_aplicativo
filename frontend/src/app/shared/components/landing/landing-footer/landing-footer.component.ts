/**
 * Landing Footer Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/LandingFooter.tsx
 */

import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

interface FooterLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.css'
})
export class LandingFooterComponent {
  currentYear = new Date().getFullYear();

  footerLinks = {
    servicios: [
      { label: 'Construcción', href: '#servicios' },
      { label: 'Electricidad', href: '#servicios' },
      { label: 'Refrigeración', href: '#servicios' },
      { label: 'Montajes', href: '#servicios' },
      { label: 'Suministros', href: '#servicios' },
    ],
    empresa: [
      { label: 'Sobre Nosotros', href: '#nosotros' },
      { label: 'Misión y Visión', href: '#nosotros' },
      { label: 'Valores', href: '#nosotros' },
      { label: 'Certificaciones', href: '#nosotros' },
    ],
    recursos: [
      { label: 'Sistema de Gestión', href: '/signin' },
      { label: 'SG-SST', href: '#' },
      { label: 'PESV', href: '#' },
      { label: 'Políticas', href: '#' },
    ],
  };

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

