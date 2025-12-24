/**
 * Testimonial Section Component - Migrado de Next.js
 * @see apps/web-old/src/components/landing/TestimonialSection.tsx
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonial-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-section.component.html',
  styleUrl: './testimonial-section.component.css'
})
export class TestimonialSectionComponent {
}

