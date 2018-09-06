import { ChangeDetectionStrategy } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import * as moment_ from 'moment';
import { DayComponent } from '../day/day.component';
import { DateTimeRange } from '../models/date-time-range';
import { MonthComponent } from '../month/month.component';
import { TimeComponent } from '../time/time.component';
import { DTRPTranslationService } from '../translation.service';
import { DateTimeComponent } from './date-time.component';
import {of} from "rxjs";
const moment = moment_;

describe('DateTimeComponent', () => {
  let component: DateTimeComponent;
  let fixture: ComponentFixture<DateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [DTRPTranslationService],
      declarations: [DateTimeComponent, MonthComponent, DayComponent, TimeComponent]
    })
      .overrideComponent(DateTimeComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimeComponent);
    component = fixture.componentInstance;
    component.getUnavailableTimesForDate = () => of([]);
    component.selectedDate = new Date(2020, 1, 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show a month by default', () => {
    const monthElement = fixture.debugElement.queryAll(By.css('ngx-month'));

    expect(monthElement.length).toBe(0);
  });

  it('should show a month if the parent component says so and the timePicker is not opened', () => {
    component.isOpen = true;
    component.isTimePickerShown = false;
    fixture.detectChanges();
    const monthElement = fixture.debugElement.queryAll(By.css('ngx-month'));
    expect(monthElement.length).toBe(1);
  });

  it('should not show a month if the parent component says so and the timePicker is opened', () => {
    component.isTimePickerShown = true;
    component.isOpen = true;
    fixture.detectChanges();
    const monthElement = fixture.debugElement.queryAll(By.css('ngx-month'));
    expect(monthElement.length).toBe(0);
    const timeElement = fixture.debugElement.queryAll(By.css('ngx-time'));
    expect(timeElement.length).toBe(1);
  });

  it('should hide all elements if the parent component says so', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const monthElement = fixture.debugElement.queryAll(By.css('ngx-month'));
    expect(monthElement.length).toBe(0);
    const timeElement = fixture.debugElement.queryAll(By.css('ngx-time'));
    expect(timeElement.length).toBe(0);
  });

  it('should show a month if the parent component says so', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const monthElement = fixture.debugElement.queryAll(By.css('ngx-month'));
    expect(monthElement.length).toBe(1);
  });

  it('should not be disabled by default', () => {
    const disabledInputs = fixture.debugElement.queryAll(By.css('#datePicker[disabled]'));
    expect(disabledInputs.length).toBe(0);
  });

  it('should be disabled if the parent component says so', () => {
    component.isDisabled = true;
    fixture.detectChanges();
    const disabledInputs = fixture.debugElement.queryAll(By.css('#datePicker[disabled]'));
    expect(disabledInputs.length).toBe(1);
  });

  it('should show a month when the user clicks the input', () => {
    const datePickerInput = fixture.debugElement.queryAll(By.css('#datePicker'));
    expect(datePickerInput.length).toBe(1);

    datePickerInput[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    const monthElement = fixture.debugElement.queryAll(By.css('ngx-month'));
    expect(monthElement.length).toBe(1);
  });

  it('should not show a time selection by default', () => {
    const timeElement = fixture.debugElement.queryAll(By.css('ngx-time'));

    expect(timeElement.length).toBe(0);
  });

  it('should show the time if there is a preselection', () => {
    component.selectedDate = new Date(2020, 1, 1, 13, 0);
    const timeElement = fixture.debugElement.query(By.css('#timePicker'));

    expect(timeElement.nativeElement.value).not.toBe('...');
  });

  it('should not show the time if there is no preselection', () => {
    component.selectedDate = null;
    component.timeSelected = false;

    fixture.detectChanges();
    component.ngOnInit();
    const timeElement = fixture.debugElement.query(By.css('#timePicker'));

    expect(timeElement.nativeElement.value).toBe('...');
  });

  it('should show a time when the user clicks the input', () => {
    const timePickerInput = fixture.debugElement.queryAll(By.css('#timePicker'));
    expect(timePickerInput.length).toBe(1);

    timePickerInput[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    const timeElement = fixture.debugElement.queryAll(By.css('ngx-time'));
    expect(timeElement.length).toBe(1);
  });

  it('should show a time when the user selects the date', () => {
    component.isTimePickerShown = false;
    component.timeSelected = false;
    component.onDayMonthSelected(
      moment()
        .date(28)
        .toDate()
    );

    expect(component.isTimePickerShown).toBe(true);
  });

  it('should give time unavailabilities when a day-month is picked', () => {
    const unavailability: DateTimeRange[] = [
      { start: new Date(2019, 11, 14, 10, 0), end: new Date(2019, 11, 14, 21, 0) },
      { start: new Date(2019, 11, 16, 10, 0), end: new Date(2019, 11, 18, 18, 0) },
      { start: new Date(2019, 11, 18, 10, 0), end: new Date(2019, 11, 21, 21, 0) },
      { start: new Date(2019, 11, 25, 10, 0), end: new Date(2019, 11, 26, 11, 0) },
      { start: new Date(2019, 11, 26, 16, 0), end: new Date(2019, 11, 26, 18, 0) },
      { start: new Date(2019, 11, 26, 23, 0), end: new Date(2019, 11, 27, 11, 0) }
    ];
    const expectedTimeUnavailability: DateTimeRange[] = [
      { start: new Date(2019, 11, 25, 10, 0), end: new Date(2019, 11, 26, 11, 0) },
      { start: new Date(2019, 11, 26, 16, 0), end: new Date(2019, 11, 26, 18, 0) },
      { start: new Date(2019, 11, 26, 23, 0), end: new Date(2019, 11, 27, 11, 0) }
    ];
    component.monthUnavailabilities = unavailability;
    component.ngOnInit();
    fixture.detectChanges();

    component.onDayMonthSelected(new Date(2019, 11, 26));

    expect(component.timeUnavailabilities).toEqual(expectedTimeUnavailability);
  });

  it('should remember the selected date', () => {
    component.monthUnavailabilities = [];
    const dateToSelect = new Date(2019, 11, 26);
    component.ngOnInit();
    fixture.detectChanges();

    component.onDayMonthSelected(dateToSelect);

    expect(component.activeMoment).toEqual(moment(dateToSelect));
  });

  it('should emit a date-time when a time is picked', done => {
    spyOn(component.dateTimeSelected, 'emit').and.callThrough();
    component.onDayMonthSelected(
      moment()
        .date(26)
        .startOf('minute')
        .toDate()
    );
    component.dateTimeSelected.subscribe((selectedDate: Date) => {
      expect(selectedDate).toEqual(
        moment()
          .date(26)
          .hour(20)
          .minute(10)
          .startOf('minute')
          .toDate()
      );
      done();
    });

    component.onTimeSelected({ hours: 20, minutes: 10 });
  });

  it('should emit blocked times to time component when date changes', (done)=>{
    const testDate = new Date(2017, 10, 10, 12, 30);
    let calledOnce: boolean = false;

    component.getUnavailableTimesForDate = (date: Date) => {
      return of([{
        hour: date.getHours(),
        minute: date.getMinutes(),
        isBlocked: true
      }]);
    };

    component.unavailableTimesForDay.subscribe((times) => {
      if(calledOnce) {
        expect(times[0].hour).toBe(12);
        expect(times[0].minute).toBe(30);
        done();
      }else{
        calledOnce = true;
      }
    });

    component.onDayMonthSelected(testDate);
  });

  it('should emit a date-time when a date is picked', done => {
    spyOn(component.dateTimeSelected, 'emit').and.callThrough();
    component.dateTimeSelected.subscribe((selectedDate: Date) => {
      expect(selectedDate).toEqual(
        moment()
          .date(26)
          .startOf('minute')
          .toDate()
      );
      done();
    });

    component.onDayMonthSelected(
      moment()
        .date(26)
        .startOf('minute')
        .toDate()
    );
  });
});
