/**
 * CTA Section Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/CTASection.tsx
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.css'
})
export class CTASectionComponent {
}

