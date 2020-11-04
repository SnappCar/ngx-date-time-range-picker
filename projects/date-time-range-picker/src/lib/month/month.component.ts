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
import { DateTimeRange } from '../models/date-time-range';
import { DayState } from '../models/day-state';
import { DTRPTranslationService } from '../translation.service';

const moment = moment_;

@Component({
  selector: 'ngx-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MonthComponent implements OnInit, OnChanges {
  @Input()
  unavailability: DateTimeRange[];
  @Input()
  selectedDate: Date;
  @Input()
  hoverFrom: Date;
  @Output()
  dateSelected = new EventEmitter<Date>();
  @Output()
  monthChanged = new EventEmitter<Date>();
  @Output()
  dismissed = new EventEmitter();

  days: Day[];

  private freeDays: number[];
  private partialDays: number[];
  private fullDays: number[];

  private activeMoment: moment_.Moment;

  // Computed values:
  get monthName(): string {
    return this.activeMoment.format('MMMM');
  }
  get year(): number {
    return this.activeMoment.year();
  }

  constructor(public translationService: DTRPTranslationService) {}

  ngOnChanges() {
    this.assessAvailabilityPerDay();
    this.setupMonth();
  }

  ngOnInit() {
    this.activeMoment = moment(this.selectedDate || undefined);
    if (this.hoverFrom) {
      if (!this.selectedDate) {
        this.activeMoment = moment(this.hoverFrom);
        this.monthChanged.emit(this.hoverFrom);
      }
    }
    this.assessAvailabilityPerDay();
    this.setupMonth();
  }

  goToPreviousMonth(): void {
    this.activeMoment.subtract(1, 'months');
    this.monthChanged.emit(this.activeMoment.toDate());
  }

  goToNextMonth(): void {
    this.activeMoment.add(1, 'months');
    this.monthChanged.emit(this.activeMoment.toDate());
  }

  private setupMonth() {
    this.days = [];
    this.fillMonthDays(this.activeMoment);
    this.fillDaysBefore(this.activeMoment);
    this.fillDaysAfter(this.activeMoment);
  }

  dayHovered(hoveredDay: number): void {
    if (this.hoverFrom) {
      const startDate = moment(this.hoverFrom);
      const dateHovered = this.activeMoment.clone().date(hoveredDay);
      if (startDate < dateHovered) {
        let dayToHoverFrom = 1;

        if (startDate.isSame(dateHovered, 'month')) {
          dayToHoverFrom = startDate.date();
        }

        this.days = this.days.map((day: Day) => {
          if (dayToHoverFrom <= day.value && day.value <= hoveredDay) {
            day.hovered = true;
          } else {
            day.hovered = false;
          }

          return day;
        });
      }
    }
  }

  daySelected(day: number): void {
    this.dateSelected.emit(this.activeMoment.date(day).toDate());
  }

  close(): void {
    this.dismissed.emit();
  }

  private fillMonthDays(date: moment_.Moment): void {
    const daysInMonth = date.daysInMonth();

    for (let i = 0; i < daysInMonth; i++) {
      let dayStatus = DayState.Free;
      if (this.fullDays.includes(i + 1)) {
        dayStatus = DayState.Full;
      } else if (this.partialDays.includes(i + 1)) {
        dayStatus = DayState.Partial;
      }
      const newDay: Day = { value: i + 1, status: dayStatus, hovered: false };

      this.days.push(newDay);
    }

    if (this.selectedDate) {
      this.markSelectedDate();
    }
  }

  private markSelectedDate() {
    if (this.activeMoment.isSame(moment(this.selectedDate), 'month')) {
      this.days = this.days.map((day) => {
        if (day.value === this.selectedDate.getDate()) {
          day.status = DayState.Selected;
        }
        return day;
      });
    }
  }

  private assessAvailabilityPerDay(): void {
    this.freeDays = [];
    this.partialDays = [];
    this.fullDays = [];

    this.makeAllDaysOfTheMonthFree();

    if (this.isCurrentDateInFutureMonth()) {
      this.makeAllDaysOfTheMonthFull();
    } else {
      this.calculateDayAvailabilities();
      this.makeDaysInThePastUnavailable();
      this.makeDaysBeforePreselectionUnavailable();

      this.synchronizeLists();
    }
  }

  private synchronizeLists() {
    this.partialDays = Array.from(new Set(this.partialDays));
    this.fullDays = Array.from(new Set(this.fullDays));
    this.freeDays = Array.from(new Set(this.freeDays));

    this.partialDays = this.partialDays.filter((value: number) => {
      return !this.fullDays.includes(value);
    });
    this.freeDays = this.freeDays.filter((value: number) => {
      return !(this.partialDays.includes(value) || this.fullDays.includes(value));
    });
  }

  private calculateDayAvailabilities() {
    let previousEndDate: moment_.Moment;
    for (const block of this.unavailability) {
      if (moment(block.start).isAfter(this.activeMoment, 'month')) {
        // The block is for a future month month
        break;
      }
      const startFreeDayNumber = previousEndDate ? previousEndDate.date() : 1;
      const endFreeDayNumber = moment(block.start).date();
      const startFullDayNumber = moment(block.start).date();
      const endFullDayNumber = moment(block.end).date();

      this.addFreeDays(startFreeDayNumber, endFreeDayNumber);
      if (
        block.start.getHours() === 0 &&
        block.start.getMinutes() <= 30 &&
        block.end.getHours() === 23 &&
        block.end.getMinutes() >= 30
      ) {
        // The block block also the start and end date
        this.fullDays.push(startFullDayNumber);
        this.fullDays.push(endFullDayNumber);
      } else {
        // The start and end date are partially blocked
        this.partialDays.push(startFullDayNumber);
        this.partialDays.push(endFullDayNumber);
      }
      if (moment(block.start).isBefore(moment(block.end), 'month')) {
        // The block ends in a future month
        this.markRestOfTheDaysAsFull(startFullDayNumber);
        break;
      } else if (startFullDayNumber < endFullDayNumber) {
        // The days completely inside the block are full
        this.addFullDays(startFullDayNumber + 1, endFullDayNumber);
      }
      previousEndDate = moment(block.end);

      if (this.hoverFrom && block.start > this.hoverFrom) {
        this.markRestOfTheDaysAsFull(startFullDayNumber);
        break;
      }
    }
  }

  private markRestOfTheDaysAsFull(start: number) {
    const endOfMonthDay = moment(this.activeMoment).endOf('month').date();
    this.addFullDays(start + 1, endOfMonthDay + 1);
  }

  private addFullDays(start: number, end: number) {
    for (let i = start; i < end; i++) {
      this.fullDays.push(i);
    }
  }

  private addFreeDays(start: number, end: number) {
    for (let i = start; i < end; i++) {
      this.freeDays.push(i);
    }
  }

  private makeDaysBeforePreselectionUnavailable() {
    if (this.hoverFrom) {
      if (this.isPreselectionInFutureMonth()) {
        this.makeAllDaysOfTheMonthFull();
      } else if (this.isPreselectionInSameMonth()) {
        const preselectionDay = moment(this.hoverFrom).date();
        this.addFullDays(1, preselectionDay);
        this.partialDays.push(preselectionDay);
      }
    }
  }

  private makeDaysInThePastUnavailable() {
    if (this.isCurrentDateInSameMonth()) {
      const currentDay = moment().date();
      this.addFullDays(1, currentDay);
      this.partialDays.push(currentDay);
    }
  }

  private isCurrentDateInFutureMonth() {
    return moment().isAfter(this.activeMoment, 'month');
  }

  private isCurrentDateInSameMonth() {
    return moment().isSame(this.activeMoment, 'month');
  }

  private isPreselectionInSameMonth() {
    return moment(this.hoverFrom).isSame(this.activeMoment, 'month');
  }

  private isPreselectionInFutureMonth() {
    return moment(this.hoverFrom).isAfter(this.activeMoment, 'month');
  }

  private makeAllDaysOfTheMonthFree() {
    const start = 1;
    const end = this.activeMoment.daysInMonth();
    this.addFreeDays(start, end + 1);
  }

  private makeAllDaysOfTheMonthFull() {
    const start = 1;
    const end = this.activeMoment.daysInMonth();
    this.addFullDays(start, end + 1);
  }

  private fillDaysBefore(date: moment_.Moment): void {
    const tempDate = date.clone().date(1);
    const dayInWeek = tempDate.isoWeekday();
    const daysInPreviousMonth = dayInWeek - 1;

    const dummyDaysBefore: Day[] = [];
    for (let i = 0; i < daysInPreviousMonth; i++) {
      const newDay: Day = {
        value: 0,
        status: DayState.Dummy,
        hovered: false,
        dummyBefore: true,
      };

      dummyDaysBefore.push(newDay);
    }

    this.days = [...dummyDaysBefore, ...this.days];
  }

  private fillDaysAfter(date: moment_.Moment): void {
    const lastDayOfTheMonth = date.daysInMonth();
    const tempDate = date.clone().date(lastDayOfTheMonth);
    const dayInWeek = tempDate.isoWeekday();
    const daysInNextMonth = 7 - dayInWeek;

    const dummyDaysAfter: Day[] = [];
    for (let i = 0; i < daysInNextMonth; i++) {
      const newDay: Day = {
        value: 0,
        status: DayState.Dummy,
        hovered: false,
        dummyAfter: true,
      };

      dummyDaysAfter.push(newDay);
    }

    this.days = [...this.days, ...dummyDaysAfter];
  }
}

export interface Day {
  value: number;
  status: DayState;
  hovered: boolean;
  dummyBefore?: boolean;
  dummyAfter?: boolean;
}
