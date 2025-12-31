import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card-description',
    standalone: true,
    imports: [CommonModule],
    template: `
    <p class="text-sm text-gray-600 dark:text-gray-300">
      <ng-content></ng-content>
    </p>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardDescriptionComponent { }
