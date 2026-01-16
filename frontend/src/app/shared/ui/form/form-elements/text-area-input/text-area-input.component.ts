import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TextAreaComponent } from '../../input/text-area.component';

import { ComponentCardComponent } from '../../../../components/common/component-card/component-card.component';
import { LabelComponent } from '../../label/label.component';

@Component({
  selector: 'app-text-area-input',
  standalone: true,
  imports: [CommonModule, TextAreaComponent, LabelComponent, ComponentCardComponent],
  templateUrl: './text-area-input.component.html',
  styles: ``,
})
export class TextAreaInputComponent {
  message = '';
  messageTwo = '';
}
