/**
 * Landing Page Component - Refactored with TailAdmin Design
 * @see Modern landing with dynamic navbar, spotlight effects, and 3D cards
 * 
 * Landing page principal de CERMONT S.A.S con secciones Hero, Services, About, Testimonials y CTA
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingNavbarComponent } from '../../shared/components/landing-navbar/landing-navbar.component';
import { HeroSectionComponent } from '../../features/landing/components/hero-section/hero-section.component';
import { ServicesSectionComponent } from '../../features/landing/components/services-section/services-section.component';
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
    LandingNavbarComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
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

