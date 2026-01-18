import { Component } from '@angular/core';

@Component({
  selector: 'app-three-column-image-grid',
  standalone: true,
  imports: [],
  template: `
    <div class="grid grid-cols-3 gap-4">
      <img class="rounded-lg" src="assets/images/grid-image/image-01.jpg" alt="Image 1" />
      <img class="rounded-lg" src="assets/images/grid-image/image-02.jpg" alt="Image 2" />
      <img class="rounded-lg" src="assets/images/grid-image/image-03.jpg" alt="Image 3" />
    </div>
  `,
})
export class ThreeColumnImageGridComponent {}
