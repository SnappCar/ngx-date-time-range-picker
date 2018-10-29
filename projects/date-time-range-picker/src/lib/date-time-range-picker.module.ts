import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from './click-outside.directive';
import { DateTimeRangePickerComponent } from './date-time-range-picker.component';
import { DateTimeComponent } from './date-time/date-time.component';
import { DayComponent } from './day/day.component';
import { MonthComponent } from './month/month.component';
import { TimeComponent } from './time/time.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    DateTimeRangePickerComponent,
    DayComponent,
    MonthComponent,
    TimeComponent,
    DateTimeComponent,
    ClickOutsideDirective
  ],
  exports: [
    DateTimeRangePickerComponent,
    DayComponent,
    MonthComponent,
    TimeComponent,
    DateTimeComponent
  ]
})
export class DateTimeRangePickerModule {}
