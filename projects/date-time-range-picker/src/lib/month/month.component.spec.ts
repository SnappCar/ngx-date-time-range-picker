import { ChangeDetectionStrategy } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as moment_ from 'moment';
import { DayComponent } from '../day/day.component';
import { DateTimeRange } from '../models/date-time-range';
import { MonthComponent } from './month.component';

const moment = moment_;

describe('MonthComponent', () => {
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [MonthComponent, DayComponent]
    })
      .overrideComponent(MonthComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2018, 6, 1), end: new Date(2018, 6, 10) }
    ];
    component.unavailability = unavailabilityToUse;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('render', () => {
    it('should show the correct amount of days', () => {
      const numberOfDays = moment().daysInMonth();
      fixture.detectChanges();

      const monthDays = fixture.debugElement.queryAll(By.css('.month-day'));

      expect(monthDays.length).toBe(numberOfDays);
    });
  });

  it('should have the current year and month as a default selection', () => {
    expect(component.activeMoment.isSame(moment(), 'day')).toBe(true);
  });

  it('should show the current month and year', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const currentYear = moment().year();
    const currentMonth = moment().format('MMMM');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(currentYear);
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(currentMonth);
  });

  it('should have the correct number of dummy days before', () => {
    const monthToUse = 6;
    const yearToUse = 2018;
    const expectedDaysBefore = 6;
    component.activeMoment.year(yearToUse).month(monthToUse);
    fixture.detectChanges();

    const daysBefore = fixture.debugElement.queryAll(By.css('.day-before'));

    expect(daysBefore.length).toBe(expectedDaysBefore);
  });

  it('should have the correct number of dummy days after', () => {
    const monthToUse = 6;
    const yearToUse = 2018;
    const expectedDaysAfter = 5;
    component.activeMoment.year(yearToUse).month(monthToUse);
    fixture.detectChanges();

    const daysBefore = fixture.debugElement.queryAll(By.css('.day-after'));

    expect(daysBefore.length).toBe(expectedDaysAfter);
  });

  it('should know when a day is hovered', () => {
    const monthToUse = 6;
    const yearToUse = 2020;
    const hoverToUse = new Date(2020, 6, 4);
    component.activeMoment.year(yearToUse).month(monthToUse);
    component.hoverFrom = hoverToUse;
    component.unavailability = [];
    fixture.detectChanges();

    component.dayHovered(10);
    fixture.detectChanges();

    const daysHovered = fixture.debugElement.queryAll(By.css('.hover'));

    expect(daysHovered.length).toBe(7);
  });

  it('should know when a day is available', () => {
    const monthToUse = 6;
    const yearToUse = 2020;
    const hoverToUse = new Date(2020, 6, 4);
    const unavailabilityToUse: DateTimeRange[] = [
      {
        start: new Date(2020, 6, 1),
        end: new Date(2020, 6, 10)
      }
    ];
    component.activeMoment.year(yearToUse).month(monthToUse);
    component.hoverFrom = hoverToUse;
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    const daysAvailable = fixture.debugElement.queryAll(By.css('.available'));

    expect(daysAvailable.length).toBe(21);
  });

  it('should know when a day is partially available', () => {
    const monthToUse = 6;
    const yearToUse = 2020;
    const hoverToUse = new Date(2020, 6, 4);
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2020, 6, 1, 10, 0), end: new Date(2020, 6, 1, 15, 0) }
    ];
    component.activeMoment.year(yearToUse).month(monthToUse);
    component.hoverFrom = hoverToUse;
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    const daysAvailable = fixture.debugElement.queryAll(By.css('.partial'));

    expect(daysAvailable.length).toBe(1);
  });

  it('should know when a day is unavailable', () => {
    const monthToUse = 6;
    const yearToUse = 2020;
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2020, 6, 1, 14, 0), end: new Date(2020, 6, 10, 21, 0) }
    ];
    component.activeMoment.year(yearToUse).month(monthToUse);
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    const daysUnavailable = fixture.debugElement.queryAll(By.css('.unavailable'));

    expect(daysUnavailable.length).toBe(8);
  });

  it('should make days unavailable from the first unavailability after the previous selection and before the previous selection', () => {
    const monthToUse = 6;
    const yearToUse = 2020;
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2020, 6, 1, 14, 0), end: new Date(2020, 6, 3, 21, 0) },
      { start: new Date(2020, 6, 7, 14, 0), end: new Date(2020, 6, 10, 21, 0) }
    ];
    const hoverToUse = new Date(2020, 6, 4);
    component.activeMoment.year(yearToUse).month(monthToUse);
    component.unavailability = unavailabilityToUse;
    component.hoverFrom = hoverToUse;
    fixture.detectChanges();

    const daysUnavailable = fixture.debugElement.queryAll(By.css('.unavailable'));

    expect(daysUnavailable.length).toBe(27);
  });

  it('should go to previous month', done => {
    const previousMonth = moment()
      .subtract(1, 'months')
      .month();
    const previousYear = moment()
      .subtract(1, 'months')
      .year();
    spyOn(component.monthChanged, 'emit').and.callThrough();
    component.monthChanged.subscribe((selectedDate: Date) => {
      expect(selectedDate.getFullYear()).toBe(previousYear);
      expect(selectedDate.getMonth()).toBe(previousMonth);
      done();
    });

    const previousMonthButton = fixture.debugElement.queryAll(By.css('.btn-previous-month'));
    expect(previousMonthButton.length).toBe(1);

    previousMonthButton[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.activeMoment.month()).toBe(previousMonth);
    expect(component.year).toBe(previousYear);
    expect(component.monthChanged.emit).toHaveBeenCalled();
  });

  it('should go to next month', done => {
    const nextMonth = moment()
      .add(1, 'months')
      .month();
    const nextYear = moment()
      .add(1, 'months')
      .year();
    spyOn(component.monthChanged, 'emit').and.callThrough();
    component.monthChanged.subscribe((selectedDate: Date) => {
      expect(selectedDate.getFullYear()).toBe(nextYear);
      expect(selectedDate.getMonth()).toBe(nextMonth);
      done();
    });

    const nextMonthButton = fixture.debugElement.queryAll(By.css('.btn-next-month'));
    expect(nextMonthButton.length).toBe(1);

    nextMonthButton[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.activeMoment.month()).toBe(nextMonth);
    expect(component.year).toBe(nextYear);
    expect(component.monthChanged.emit).toHaveBeenCalled();
  });

  it('should emit a date selected event when a day is selected', () => {
    const monthToUse = 8;
    const yearToUse = 2018;
    const dayToSelect = 12;
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2018, 8, 1, 14, 0), end: new Date(2018, 8, 10, 21, 0) }
    ];
    component.activeMoment.year(yearToUse).month(monthToUse);
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    spyOn(component.dateSelected, 'emit').and.callThrough();
    component.dateSelected.subscribe((selectedDate: Date) => {
      expect(selectedDate).toEqual(new Date(yearToUse, monthToUse, dayToSelect));
    });

    component.daySelected(dayToSelect);
    expect(component.dateSelected.emit).toHaveBeenCalled();
  });
});
