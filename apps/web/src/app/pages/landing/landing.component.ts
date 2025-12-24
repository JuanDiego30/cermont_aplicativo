/**
 * Landing Page Component - Migrado de Next.js
 * @see apps/web-old/src/app/page.tsx
 * 
 * Landing page principal de CERMONT S.A.S con secciones Hero, Features, About, Testimonials y CTA
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingHeaderComponent } from '../../shared/components/landing/landing-header/landing-header.component';
import { HeroSectionComponent } from '../../shared/components/landing/hero-section/hero-section.component';
import { FeaturesSectionComponent } from '../../shared/components/landing/features-section/features-section.component';
import { AboutSectionComponent } from '../../shared/components/landing/about-section/about-section.component';
import { TestimonialSectionComponent } from '../../shared/components/landing/testimonial-section/testimonial-section.component';
import { CTASectionComponent } from '../../shared/components/landing/cta-section/cta-section.component';
import { LandingFooterComponent } from '../../shared/components/landing/landing-footer/landing-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LandingHeaderComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    AboutSectionComponent,
    TestimonialSectionComponent,
    CTASectionComponent,
    LandingFooterComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
}

