import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../../components/common/component-card/component-card.component';
import {
  DatePickerComponent,
  type DateChangePayload,
} from '../../date-picker/date-picker.component';
import { InputFieldComponent } from '../../input/input-field.component';
import { LabelComponent } from '../../label/label.component';
import { SelectComponent } from '../../select/select.component';
import { TimePickerComponent } from '../../time-picker/time-picker.component';

@Component({
  selector: 'app-default-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    SelectComponent,
    DatePickerComponent,
    TimePickerComponent,
  ],
  templateUrl: './default-inputs.component.html',
  styles: ``,
})
export class DefaultInputsComponent {
  showPassword = false;
  options = [
    { value: 'marketing', label: 'Marketing' },
    { value: 'template', label: 'Template' },
    { value: 'development', label: 'Development' },
  ];
  selectedOption = '';
  dateValue: DateChangePayload | null = null;
  timeValue = '';
  cardNumber = '';

  handleSelectChange(value: string): void {
    this.selectedOption = value;
  }

  handleDateChange(event: DateChangePayload): void {
    this.dateValue = event;
  }

  handleTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.timeValue = target?.value ?? '';
  }

  onTimeSelected(time: string): void {}
}
