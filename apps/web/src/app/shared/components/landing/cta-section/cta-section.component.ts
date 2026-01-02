/**
 * CTA Section Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/CTASection.tsx
 */

import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.css'
})
export class CTASectionComponent {
}

