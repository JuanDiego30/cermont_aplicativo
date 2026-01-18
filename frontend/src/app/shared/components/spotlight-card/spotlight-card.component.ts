import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-spotlight-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #card
      class="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/60 hover:shadow-lg dark:border-white/10 dark:bg-slate-950"
    >
      <!-- Spotlight Effect -->
      <div
        #spotlight
        class="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        [style.background]="spotlightGradient"
      ></div>

      <!-- Content -->
      <div class="relative z-10">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SpotlightCardComponent implements AfterViewInit {
  @ViewChild('card', { static: false }) card!: ElementRef<HTMLDivElement>;
  @ViewChild('spotlight', { static: false }) spotlight!: ElementRef<HTMLDivElement>;

  spotlightGradient = 'transparent';

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    // Run outside Angular to avoid NG0100 error
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.spotlightGradient = 'transparent';
      }, 0);
    });
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
        540px circle at ${x}px ${y}px,
        rgba(59, 130, 246, 0.18),
        transparent 45%
      )
    `;

    this.cdr.markForCheck();
  }
}
