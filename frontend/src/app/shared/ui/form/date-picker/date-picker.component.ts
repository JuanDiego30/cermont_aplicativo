import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { LabelComponent } from '../label/label.component';

export interface DateChangePayload {
  selectedDates: Date[];
  dateStr: string;
  instance: flatpickr.Instance;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``,
})
export class DatePickerComponent implements AfterViewInit, OnDestroy {
  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Output() dateChange = new EventEmitter<DateChangePayload>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance?: flatpickr.Instance;

  ngAfterViewInit(): void {
    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
      mode: this.mode,
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'Y-m-d',
      defaultDate: this.defaultDate,
      onChange: (selectedDates, dateStr, instance) => {
        this.dateChange.emit({ selectedDates, dateStr, instance });
      },
    });
  }

  ngOnDestroy(): void {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
