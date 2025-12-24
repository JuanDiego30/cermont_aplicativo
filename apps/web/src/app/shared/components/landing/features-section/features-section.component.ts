/**
 * Features Section Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/FeaturesSection.tsx
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.css'
})
export class FeaturesSectionComponent {
  services: Service[] = [
    {
      icon: 'building',
      title: 'Construcción',
      description: 'Montajes de obras civiles con los más altos estándares de calidad y seguridad industrial.',
      color: 'blue',
    },
    {
      icon: 'zap',
      title: 'Electricidad',
      description: 'Instalaciones y mantenimiento de sistemas eléctricos industriales y comerciales.',
      color: 'yellow',
    },
    {
      icon: 'snowflake',
      title: 'Refrigeración',
      description: 'Sistemas de refrigeración industrial con tecnología de última generación.',
      color: 'cyan',
    },
    {
      icon: 'wrench',
      title: 'Montajes',
      description: 'Montajes industriales y telecomunicaciones con personal altamente calificado.',
      color: 'green',
    },
    {
      icon: 'package',
      title: 'Suministros',
      description: 'Suministro de materiales y equipos bajo los estándares de calidad exigidos.',
      color: 'purple',
    },
    {
      icon: 'users',
      title: 'Personal Técnico',
      description: 'Recurso humano altamente calificado y certificado para cada proyecto.',
      color: 'orange',
    },
  ];

  getColorClasses(color: string): { bg: string; icon: string; border: string } {
    const variants: Record<string, { bg: string; icon: string; border: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'hover:border-blue-300 dark:hover:border-blue-700',
      },
      yellow: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        icon: 'text-amber-600 dark:text-amber-400',
        border: 'hover:border-amber-300 dark:hover:border-amber-700',
      },
      cyan: {
        bg: 'bg-cyan-50 dark:bg-cyan-500/10',
        icon: 'text-cyan-600 dark:text-cyan-400',
        border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-500/10',
        icon: 'text-green-600 dark:text-green-400',
        border: 'hover:border-green-300 dark:hover:border-green-700',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'hover:border-purple-300 dark:hover:border-purple-700',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        icon: 'text-orange-600 dark:text-orange-400',
        border: 'hover:border-orange-300 dark:hover:border-orange-700',
      },
    };
    return variants[color] || variants['blue'];
  }

  getIconSvg(icon: string): string {
    const icons: Record<string, string> = {
      building: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      zap: 'M13 10V3L4 14h7v7l9-11h-7z',
      snowflake: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      wrench: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    };
    return icons[icon] || icons['building'];
  }
}

