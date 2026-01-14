import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-hero-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './hero-section.component.html',
    styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent implements OnInit {
    stats = [
        { value: '16+', label: 'Años de Experiencia' },
        { value: '200+', label: 'Proyectos Completados' },
        { value: '100%', label: 'Compromiso' },
        { value: '50+', label: 'Clientes Satisfechos' }
    ];

    animatedStats = signal<Array<{ value: string; label: string }>>([]);

    ngOnInit(): void {
        this.animateStats();
    }

    animateStats(): void {
        setTimeout(() => {
            this.animatedStats.set(this.stats);
        }, 300);
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
    }
}
