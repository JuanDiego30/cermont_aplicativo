/**
 * Hero Section Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/HeroSection.tsx
 */

import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent {
  features = [
    'Gestión de Ordenes de Trabajo',
    'Control de Planes de Trabajo',
    'Registro de Evidencias',
    'Reportes en Tiempo Real',
  ];
}

