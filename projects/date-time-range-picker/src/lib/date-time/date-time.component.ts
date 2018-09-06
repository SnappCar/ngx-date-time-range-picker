import { Time } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import * as moment_ from 'moment';
import { DateTimeRange } from '../models/date-time-range';
import {Observable, of, ReplaySubject, Subject} from "rxjs";
import {tap} from "rxjs/internal/operators";
import {TimeSegment} from "../models/time-segment";
const moment = moment_;

@Component({
  selector: 'ngx-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
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

  activeMoment: moment_.Moment;

  isDatePickerShown: boolean;
  isTimePickerShown: boolean;

  dateSelected: boolean;
  timeSelected: boolean;

  // Time component needs:
  timeUnavailabilities: DateTimeRange[] = [];
  unavailableTimesForDay = new ReplaySubject<TimeSegment[]>();

  constructor() {
  }

  ngOnInit() {
    if(!this.getUnavailableTimesForDate){
      this.getUnavailableTimesForDate = () => of([]);
    }
    this.setupSelectDateTime();
    this.emitUnavailableTimes();
  }

  ngOnChanges() {
    this.setupSelectDateTime();
  }

  emitUnavailableTimes(){
    if(this.selectedDate){
      this.getUnavailableTimesForDate(this.selectedDate)
        .pipe(tap(unavailableTimes => {
          this.unavailableTimesForDay.next(unavailableTimes);
        }))
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

  private setupSelectDateTime() {
    if (this.selectedDate) {
      this.activeMoment = moment(this.selectedDate);
      this.dateSelected = true;
      this.timeSelected = true;
    } else {
      this.activeMoment = null;
      this.dateSelected = false;
      this.timeSelected = false;
    }
  }

  private hideTimePicker(): void {
    this.isTimePickerShown = false;
  }

  private hideDatePicker(): void {
    this.isDatePickerShown = false;
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
      const startMoment = moment(unavailability.start);
      const endMoment = moment(unavailability.end);

      if (
        (startMoment.isBefore(selectedDay, 'day') || startMoment.isSame(selectedDay, 'day')) &&
        (endMoment.isAfter(selectedDay, 'day') || endMoment.isSame(selectedDay, 'day'))
      ) {
        newTimeUnavailabilities.push(unavailability);
      }
    }

    if (selectedDay.isSame(now, 'day')) {
      const startMoment = moment().startOf('day');
      const endMoment = moment().add(1, 'minutes');
      newTimeUnavailabilities.push({ start: startMoment.toDate(), end: endMoment.toDate() });
    }
    if (selectedDay.isSame(this.startFrom, 'day')) {
      const startMoment = moment(this.startFrom).startOf('day');
      const endMoment = moment(this.startFrom).add(1, 'minutes');
      newTimeUnavailabilities.push({ start: startMoment.toDate(), end: endMoment.toDate() });
    }

    this.timeUnavailabilities = [...newTimeUnavailabilities];
  }
}
