import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card-title',
    standalone: true,
    imports: [CommonModule],
    template: `
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      <ng-content></ng-content>
    </h3>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardTitleComponent { }
