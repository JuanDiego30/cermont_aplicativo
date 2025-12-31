import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <ng-content></ng-content>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardComponent { }
