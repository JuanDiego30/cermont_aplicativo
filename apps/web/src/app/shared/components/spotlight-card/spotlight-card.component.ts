import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-spotlight-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      #card
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-cermont-primary-500 dark:hover:border-cermont-primary-500 group"
    >
      <!-- Spotlight Effect -->
      <div 
        #spotlight
        class="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        [style.background]="spotlightGradient"
      ></div>

      <!-- Content -->
      <div class="relative z-10">
        <ng-content></ng-content>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class SpotlightCardComponent implements AfterViewInit {
    @ViewChild('card', { static: false }) card!: ElementRef<HTMLDivElement>;
    @ViewChild('spotlight', { static: false }) spotlight!: ElementRef<HTMLDivElement>;

    spotlightGradient = '';

    ngAfterViewInit(): void {
        this.updateSpotlight({ clientX: 0, clientY: 0 } as MouseEvent);
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.updateSpotlight(event);
    }

    private updateSpotlight(event: MouseEvent): void {
        if (!this.card || !this.spotlight) return;

        const rect = this.card.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.spotlightGradient = `
      radial-gradient(
        600px circle at ${x}px ${y}px,
        rgba(0, 191, 255, 0.15),
        transparent 40%
      )
    `;
    }
}
