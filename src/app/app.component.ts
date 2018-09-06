import { Component, OnInit } from '@angular/core';
import { DateTimeRange } from 'projects/date-time-range-picker/src/public_api';
import { Observable, of } from 'rxjs';
import * as moment from "moment";
import { TimeSegment } from "projects/date-time-range-picker/src/public_api";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Date time range picker';
  defaultStartDate = new Date(2019, 0, 1, 10, 30);
  defaultEndDate = new Date(2019, 0, 1, 18, 0);

  startDate: Date;
  endDate: Date;
  private unavailability: DateTimeRange[][] = [
    [
      { start: new Date(2018, 0, 14, 10, 0), end: new Date(2018, 0, 14, 21, 0) },
      { start: new Date(2018, 0, 16, 10, 0), end: new Date(2018, 0, 18, 18, 0) },
      { start: new Date(2018, 0, 26, 16, 0), end: new Date(2018, 0, 26, 18, 0) },
      { start: new Date(2018, 0, 26, 23, 0), end: new Date(2018, 0, 27, 11, 0) }
    ],
    [{ start: new Date(2018, 1, 26, 23, 0), end: new Date(2018, 1, 27, 11, 0) }],
    [{ start: new Date(2018, 2, 26, 23, 0), end: new Date(2018, 2, 27, 11, 0) }],
    [
      { start: new Date(2018, 3, 18, 10, 0), end: new Date(2018, 3, 21, 21, 0) },
      { start: new Date(2018, 3, 25, 10, 0), end: new Date(2018, 3, 26, 11, 0) },
      { start: new Date(2018, 3, 26, 16, 0), end: new Date(2018, 3, 26, 18, 0) },
      { start: new Date(2018, 3, 26, 23, 0), end: new Date(2018, 3, 27, 11, 0) }
    ],
    [
      { start: new Date(2018, 4, 14, 10, 0), end: new Date(2018, 4, 14, 21, 0) },
      { start: new Date(2018, 4, 16, 10, 0), end: new Date(2018, 4, 18, 18, 0) }
    ],
    [{ start: new Date(2018, 5, 26, 16, 0), end: new Date(2018, 5, 26, 18, 0) }],
    [
      { start: new Date(2018, 6, 26, 16, 0), end: new Date(2018, 6, 26, 18, 0) },
      { start: new Date(2018, 6, 26, 23, 0), end: new Date(2018, 6, 27, 11, 0) }
    ],
    [{ start: new Date(2018, 7, 29, 23, 0), end: new Date(2018, 8, 2, 11, 0) }],
    [
      { start: new Date(2018, 8, 14, 10, 0), end: new Date(2018, 8, 14, 21, 0) },
      { start: new Date(2018, 8, 26, 16, 0), end: new Date(2018, 8, 26, 18, 0) },
      { start: new Date(2018, 8, 26, 23, 0), end: new Date(2018, 8, 27, 11, 0) }
    ],
    [{ start: new Date(2018, 9, 14, 10, 0), end: new Date(2018, 9, 14, 21, 0) }],
    [{ start: new Date(2018, 9, 26, 23, 0), end: new Date(2018, 9, 27, 11, 0) }],
    [
      { start: new Date(2018, 10, 14, 10, 0), end: new Date(2018, 10, 14, 21, 0) },
      { start: new Date(2018, 10, 26, 23, 0), end: new Date(2018, 10, 27, 11, 0) }
    ],
    [
      { start: new Date(2018, 11, 25, 10, 0), end: new Date(2018, 11, 26, 11, 0) },
      { start: new Date(2018, 11, 26, 23, 0), end: new Date(2018, 11, 27, 11, 0) }
    ],
    []
  ];

  public onGetMonthUnavailability = (date: Date): Observable<DateTimeRange[]> => {
    const unavailabilityToReturn = this.unavailability[date.getMonth()];
    return of(unavailabilityToReturn);
  };

  public onGetUnavailableTimesForDate(date: Date): Observable<TimeSegment[]>{
    if(moment(date).isoWeekday() === 7){
      return of([
        {
          hour: 12,
          minute: 0,
          isBlocked: true
        }
      ]);
    }


    if(moment(date).isoWeekday() === 3){
      return of([
        {
          hour: 14,
          minute: 0,
          isBlocked: true
        },
        {
          hour: 14,
          minute: 30,
          isBlocked: true
        },
        {
          hour: 15,
          minute: 0,
          isBlocked: true
        },

        {
          hour: 15,
          minute: 30,
          isBlocked: true
        }
      ]);
    }

    return of([]);
  }

  ngOnInit() {}

  onDateTimeRangeSelected(range: DateTimeRange) {
    this.startDate = range.start;
    this.endDate = range.end;
  }
}
