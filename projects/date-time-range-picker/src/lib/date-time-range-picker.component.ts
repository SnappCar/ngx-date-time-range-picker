import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as moment_ from 'moment';
import {Observable, of} from "rxjs";
import { take } from 'rxjs/operators';
import { DateTimeRange } from './models/date-time-range';
import { DTRPTranslationService } from './translation.service';
import { TimeSegment } from "./models/time-segment";
const moment = moment_;

@Component({
  selector: 'ngx-date-time-range-picker',
  templateUrl: 'date-time-range-picker.component.html',
  styleUrls: ['date-time-range-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DateTimeRangePickerComponent implements OnInit {
  @Input()
  selectedStart: Date;
  @Input()
  selectedEnd: Date;
  @Input()
  getMonthUnavailability: (date: Date) => Observable<DateTimeRange[]>;
  @Input()
  getUnavailableTimesForDate?: (date: Date) => Observable<TimeSegment[]>;

  @Output()
  dateTimeRangeSelected = new EventEmitter<DateTimeRange>();

  startMonthUnavailability: DateTimeRange[];
  endMonthUnavailability: DateTimeRange[];
  openStart = false;
  openEnd = false;

  private startOfBlockEveryting: Date;
  constructor(public translationService: DTRPTranslationService) {}

  ngOnInit() {
    if(!this.getUnavailableTimesForDate){
      this.getUnavailableTimesForDate = () => of([]);
    }

    this.getMonthUnavailability(this.selectedStart || moment().toDate())
      .pipe(take(1))
      .subscribe((unavailability: DateTimeRange[]) => {
        this.startMonthUnavailability = unavailability;
      });
    this.evaluateEndMonthUnavailability(this.selectedEnd || moment().toDate());
  }

  onDateTimeFromSelected(date: Date) {
    this.selectedStart = date;
    this.openStart = false;

    this.evaluateEndMonthUnavailability(
      moment(date)
        .add(1, 'minute')
        .toDate()
    );
    if (this.selectedEnd) {
      if (this.selectedStart < this.selectedEnd) {
        this.dateTimeRangeSelected.emit({ start: this.selectedStart, end: this.selectedEnd });
      } else {
        this.selectedEnd = null;
        this.openEnd = true;
      }
    } else {
      this.openEnd = true;
    }
  }

  onDateTimeUntilSelected(date: Date) {
    this.selectedEnd = date;
    this.openEnd = false;

    if (this.selectedStart) {
      if (this.selectedStart < this.selectedEnd) {
        this.dateTimeRangeSelected.emit({ start: this.selectedStart, end: this.selectedEnd });
      } else {
        this.selectedStart = null;
        this.openStart = true;
      }
    } else {
      this.openStart = true;
    }
  }

  onStartMonthChanged(date: Date) {
    this.getMonthUnavailability(date)
      .pipe(take(1))
      .subscribe((unavailability: DateTimeRange[]) => {
        this.startMonthUnavailability = unavailability;
      });
  }

  onEndMonthChanged(date: Date) {
    this.evaluateEndMonthUnavailability(date);
  }

  startOpened(): void {
    this.openStart = true;
    this.openEnd = false;
  }

  endOpened(): void {
    this.openStart = false;
    this.openEnd = true;
  }

  private evaluateEndMonthUnavailability(date: Date) {
    this.getMonthUnavailability(date)
      .pipe(take(1))
      .subscribe((unavailabilityToUse: DateTimeRange[]) => {
        const isDateAfterSelectedStart = moment(date).isAfter(moment(this.selectedStart), 'minute');
        let blockEverything = false;
        if (this.startOfBlockEveryting) {
          blockEverything = moment(date).isAfter(moment(this.startOfBlockEveryting), 'month');
        }

        if (isDateAfterSelectedStart) {
          if (blockEverything) {
            unavailabilityToUse = this.getFullMonthUnavailability(date);
          } else {
            const filteredUnavailabilities = [];
            for (const unavailability of unavailabilityToUse) {
              if (moment(unavailability.start).isAfter(moment(this.selectedStart, 'minute'))) {
                filteredUnavailabilities.push(
                  this.getUnavailabilityUntilTheEndOfTheMonth(unavailability.start)
                );
                this.startOfBlockEveryting = unavailability.start;
                break;
              } else {
                filteredUnavailabilities.push(unavailability);
              }
            }
            unavailabilityToUse = [...filteredUnavailabilities];
          }
        }
        this.endMonthUnavailability = [...unavailabilityToUse];
      });
  }

  private getUnavailabilityUntilTheEndOfTheMonth(start: Date): DateTimeRange {
    const end = moment(start)
      .endOf('month')
      .toDate();

    return { start, end };
  }

  private getFullMonthUnavailability(date: Date): DateTimeRange[] {
    const start = moment(date)
      .startOf('month')
      .toDate();
    const end = moment(date)
      .endOf('month')
      .toDate();

    return [{ start, end }];
  }
}
