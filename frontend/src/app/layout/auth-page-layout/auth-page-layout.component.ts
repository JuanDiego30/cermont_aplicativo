import { Component } from '@angular/core';
import { GridShapeComponent } from '../../shared/components/common/grid-shape/grid-shape.component';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-auth-page-layout',
  imports: [GridShapeComponent, RouterModule, ThemeToggleComponent],
  templateUrl: './auth-page-layout.component.html',
  styles: ``,
})
export class AuthPageLayoutComponent {}
