import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-landing-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './landing-navbar.component.html',
    styleUrls: ['./landing-navbar.component.css']
})
export class LandingNavbarComponent {
    protected readonly themeService = inject(ThemeService);

    isScrolled = signal(false);
    isMobileMenuOpen = signal(false);

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.isScrolled.set(window.scrollY > 20);
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(value => !value);
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        this.closeMobileMenu();
    }
}
