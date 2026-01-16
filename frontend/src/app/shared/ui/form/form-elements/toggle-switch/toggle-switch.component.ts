import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../../components/common/component-card/component-card.component';
import { SwitchComponent } from '../../input/switch.component';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule, SwitchComponent, ComponentCardComponent],
  templateUrl: './toggle-switch.component.html',
  styles: ``,
})
export class ToggleSwitchComponent {
  handleSwitchChange(checked: boolean) {
    void checked;
  }
}
