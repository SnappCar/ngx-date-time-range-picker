import { Time } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import * as moment_ from 'moment';
import { Observable, of, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DateTimeRange } from '../models/date-time-range';
import { TimeSegment } from '../models/time-segment';
const moment = moment_;

@Component({
  selector: 'ngx-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DateTimeComponent implements OnInit, OnChanges {
  @Input()
  monthUnavailabilities: DateTimeRange[] = [];
  @Input()
  getUnavailableTimesForDate: (date: Date) => Observable<TimeSegment[]>;
  @Input()
  startFrom: Date;
  @Input()
  selectedDate: Date;
  @Input()
  isDisabled: boolean;
  @Input()
  labelsAsPlaceholders: boolean;
  @Input()
  placeholder: string;
  @Input()
  set isOpen(shouldBeOpen: boolean) {
    if (shouldBeOpen) {
      if (!this.isTimePickerShown) {
        this.showDatePicker();
      }
    } else {
      this.hideDatePicker();
      this.hideTimePicker();
    }
  }

  @Output()
  monthChanged = new EventEmitter<Date>();
  @Output()
  dateTimeSelected = new EventEmitter<Date>();
  @Output()
  opened = new EventEmitter<void>();
  @Output()
  dismissed = new EventEmitter<void>();

  activeMoment: moment_.Moment;

  isDatePickerShown: boolean;
  isTimePickerShown: boolean;

  dateSelected: boolean;
  timeSelected: boolean;

  // Time component needs:
  timeUnavailabilities: DateTimeRange[] = [];
  unavailableTimesForDay = new ReplaySubject<TimeSegment[]>();

  private timeSelectedByUser = false;

  constructor() {}

  ngOnInit() {
    if (!this.getUnavailableTimesForDate) {
      this.getUnavailableTimesForDate = () => of([]);
    }
    this.setupSelectDateTime();
    this.emitUnavailableTimes();
  }

  ngOnChanges() {
    this.evaluateSelectDateTime();
  }

  emitUnavailableTimes() {
    if (this.selectedDate) {
      this.getUnavailableTimesForDate(this.selectedDate)
        .pipe(
          tap((unavailableTimes) => {
            this.unavailableTimesForDay.next(unavailableTimes);
          })
        )
        .subscribe();
    }
  }

  onDayMonthSelected(selectedDate: Date): void {
    this.calcuateTimeUnavailabilities(selectedDate);
    this.activeMoment = moment(selectedDate);
    this.selectedDate = selectedDate;

    this.emitUnavailableTimes();

    this.dateSelected = true;
    this.hideDatePicker();

    if (this.timeSelected) {
      this.dateTimeSelected.emit(this.selectedDate);
    } else {
      this.showTimePicker();
    }
  }

  onTimeSelected(selectedTime: Time): void {
    this.timeSelectedByUser = true;
    this.activeMoment = this.activeMoment
      .clone()
      .hour(selectedTime.hours)
      .minute(selectedTime.minutes)
      .startOf('minute');
    this.selectedDate = this.activeMoment.toDate();
    this.dateTimeSelected.emit(this.selectedDate);

    this.hideTimePicker();
    this.timeSelected = true;
  }

  onMonthChanged(date: Date): void {
    this.activeMoment = moment(date);
    this.monthChanged.emit(date);
  }

  toggleDatePicker(): void {
    this.isDatePickerShown ? this.hideDatePicker() : this.showDatePicker();
    if (this.isDatePickerShown) {
      this.hideTimePicker();
    }
  }

  toggleTimePicker(): void {
    this.isTimePickerShown ? this.hideTimePicker() : this.showTimePicker();
    if (this.isTimePickerShown) {
      this.hideDatePicker();
    }
  }

  public hideTimePicker(): void {
    this.isTimePickerShown = false;
  }

  public hideDatePicker(): void {
    this.isDatePickerShown = false;
  }

  public dismissByClickOutside(): void {
    this.isOpen = false;
    this.dismissed.emit();
  }

  public getDatePlaceholder(): string {
    if (this.labelsAsPlaceholders) {
      return this.placeholder;
    }

    return '';
  }

  private setupSelectDateTime() {
    if (this.selectedDate) {
      this.timeSelectedByUser = true;
      this.activeMoment = moment(this.selectedDate);
      this.dateSelected = true;
      this.timeSelected = true;
    } else {
      this.activeMoment = null;
      this.dateSelected = false;
      this.timeSelected = false;
    }
  }

  private evaluateSelectDateTime() {
    if (this.selectedDate) {
      this.activeMoment = moment(this.selectedDate);
      this.dateSelected = true;
      this.timeSelected = this.timeSelectedByUser ? true : false;
    } else {
      this.timeSelectedByUser = false;
      this.activeMoment = null;
      this.dateSelected = false;
      this.timeSelected = false;
    }
  }

  private showTimePicker(): void {
    this.opened.emit();
    this.isTimePickerShown = true;
  }

  private showDatePicker(): void {
    this.opened.emit();
    this.isDatePickerShown = true;
  }

  private calcuateTimeUnavailabilities(date: Date): void {
    // Get only unavailabilities that affect the time for that day
    const newTimeUnavailabilities: DateTimeRange[] = [];
    const selectedDay = moment(date);
    const now = moment();

    for (const unavailability of this.monthUnavailabilities) {
      const unavailabilityStartMoment = moment(unavailability.start);
      const unavailabilityEndMoment = moment(unavailability.end);

      if (
        (unavailabilityStartMoment.isBefore(selectedDay, 'day') ||
          unavailabilityStartMoment.isSame(selectedDay, 'day')) &&
        (unavailabilityEndMoment.isAfter(selectedDay, 'day') ||
          unavailabilityEndMoment.isSame(selectedDay, 'day'))
      ) {
        // Unavailability overlaps with the selected day
        newTimeUnavailabilities.push(unavailability);
      }

      if (this.startFrom && selectedDay.isSame(unavailabilityStartMoment, 'day')) {
        // There is an unavailability that starts today and we are now selecting the end date-time
        // This means that if the startFrom is before the unavailabilityStart, all the times after the unavailabilityStart are unavailable
        // ----------startFrom] ********* [unavailabilityStartMoment--------------
        if (unavailabilityStartMoment.isAfter(this.startFrom)) {
          const newTimeUnavailabilityBlock = {
            start: unavailabilityStartMoment.toDate(),
            end: moment(unavailabilityStartMoment).endOf('day').toDate(),
          };
          newTimeUnavailabilities.push(newTimeUnavailabilityBlock);
        }
      }
    }

    if (selectedDay.isSame(now, 'day')) {
      // Since the selected day is today, block the time of today until now.
      const startMoment = moment().startOf('day');
      const endMoment = moment().add(1, 'minutes');
      const newTimeUnavailabilityBlock = {
        start: startMoment.toDate(),
        end: endMoment.toDate(),
      };
      newTimeUnavailabilities.push(newTimeUnavailabilityBlock);
    }
    if (selectedDay.isSame(this.startFrom, 'day')) {
      // Since the selected day is the same as the startFrom, block the time before the startFrom
      const startMoment = moment(this.startFrom).startOf('day');
      const endMoment = moment(this.startFrom).add(1, 'minutes');
      const newTimeUnavailabilityBlock = {
        start: startMoment.toDate(),
        end: endMoment.toDate(),
      };
      newTimeUnavailabilities.push(newTimeUnavailabilityBlock);
    }

    this.timeUnavailabilities = [...newTimeUnavailabilities];
  }
}
