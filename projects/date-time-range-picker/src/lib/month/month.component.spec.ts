import { ChangeDetectionStrategy } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as moment_ from 'moment';
import { DayComponent } from '../day/day.component';
import { DateTimeRange } from '../models/date-time-range';
import { DTRPTranslationService } from '../translation.service';
import { MonthComponent } from './month.component';
import { MockComponent } from 'ng-mocks';
import { DayState } from '../models/day-state';

const moment = moment_;

describe('MonthComponent', () => {
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;
  const initialMonth = 6;
  const initialYear = 2018;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [MonthComponent, MockComponent(DayComponent)],
      providers: [DTRPTranslationService],
    })
      .overrideComponent(MonthComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .overrideComponent(DayComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;
    const unavailabilityToUse: DateTimeRange[] = [];
    component.selectedDate = new Date(initialYear, initialMonth, 1);
    component.unavailability = unavailabilityToUse;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('render', () => {
    it('should show the correct amount of days', () => {
      const numberOfDays = moment(component.selectedDate).daysInMonth();
      fixture.detectChanges();

      const monthDays = fixture.debugElement.queryAll(By.css('.month-day'));

      expect(monthDays.length).toBe(numberOfDays);
    });
  });

  it('should automatically start from the previously selected date', () => {
    spyOn(component.monthChanged, 'emit');
    component.selectedDate = null;
    component.hoverFrom = new Date(2019, 1, 13);

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.monthChanged.emit).toHaveBeenCalledWith(new Date(2019, 1, 13));
  });

  it('should show the correct month and year', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('2018');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('July');
  });

  it('should have the correct number of dummy days before', () => {
    fixture.detectChanges();
    const expectedDaysBefore = 6;

    const daysBefore = fixture.debugElement.queryAll(By.css('.day-before'));

    expect(daysBefore.length).toBe(expectedDaysBefore);
  });

  it('should have the correct number of dummy days after', () => {
    const expectedDaysAfter = 5;

    fixture.detectChanges();

    const daysBefore = fixture.debugElement.queryAll(By.css('.day-after'));

    expect(daysBefore.length).toBe(expectedDaysAfter);
  });

  it('should know when a day is hovered', () => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const hoverToUse = new Date(2025, 6, 4);
    component.selectedDate = new Date(yearToUse, monthToUse, 1);
    component.hoverFrom = hoverToUse;
    component.unavailability = [];
    fixture.detectChanges();

    component.dayHovered(10);
    fixture.detectChanges();

    const days = fixture.debugElement.queryAll(By.directive(DayComponent));
    const hoveredDays = days.filter(
      (day) => (day.componentInstance as DayComponent).hovered === true
    );

    expect(hoveredDays.length).toBe(7);
  });

  it('should know when a day is available', () => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const hoverToUse = new Date(2025, 6, 4);
    const unavailabilityToUse: DateTimeRange[] = [
      {
        start: new Date(2025, 6, 1),
        end: new Date(2025, 6, 10),
      },
    ];
    component.selectedDate = new Date(yearToUse, monthToUse, 1);
    component.hoverFrom = hoverToUse;
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    const days = fixture.debugElement.queryAll(By.directive(DayComponent));
    const availableDays = days.filter(
      (day) => (day.componentInstance as DayComponent).status === DayState.Free
    );

    expect(availableDays.length).toBe(21);
  });

  it('should know when a day is partially available', () => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const hoverToUse = new Date(2025, 6, 4);
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2025, 6, 1, 10, 0), end: new Date(2025, 6, 1, 15, 0) },
    ];
    component.selectedDate = new Date(yearToUse, monthToUse, 1);
    component.hoverFrom = hoverToUse;
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    const days = fixture.debugElement.queryAll(By.directive(DayComponent));
    const partialDays = days.filter(
      (day) => (day.componentInstance as DayComponent).status === DayState.Partial
    );

    expect(partialDays.length).toBe(1);
  });

  it('should know when a day is unavailable', () => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2025, 6, 10, 14, 0), end: new Date(2025, 7, 11, 21, 0) },
    ];
    component.selectedDate = new Date(yearToUse, monthToUse, 1);
    component.unavailability = unavailabilityToUse;
    fixture.detectChanges();

    const days = fixture.debugElement.queryAll(By.directive(DayComponent));
    const unavailableDays = days.filter(
      (day) => (day.componentInstance as DayComponent).status === DayState.Full
    );

    expect(unavailableDays.length).toBe(21);
  });

  it('should know when a day is selected', () => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const selectedDate = new Date(2025, 6, 21);
    const unavailabilityToUse: DateTimeRange[] = [];

    component.selectedDate = new Date(yearToUse, monthToUse, 1);
    component.unavailability = unavailabilityToUse;
    component.selectedDate = selectedDate;
    fixture.detectChanges();

    const days = fixture.debugElement.queryAll(By.directive(DayComponent));
    const selectedDays = days.filter(
      (day) => (day.componentInstance as DayComponent).status === DayState.Selected
    );

    expect(selectedDays.length).toBe(1);
  });

  it('should make days unavailable from the first unavailability after the previous selection and before the previous selection', () => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const unavailabilityToUse: DateTimeRange[] = [
      { start: new Date(2025, 6, 1, 14, 0), end: new Date(2025, 6, 3, 21, 0) },
      { start: new Date(2025, 6, 7, 14, 0), end: new Date(2025, 6, 10, 21, 0) },
    ];
    const hoverToUse = new Date(2025, 6, 4);
    component.selectedDate = new Date(yearToUse, monthToUse, 4);
    component.unavailability = unavailabilityToUse;
    component.hoverFrom = hoverToUse;
    fixture.detectChanges();

    const days = fixture.debugElement.queryAll(By.directive(DayComponent));
    const unavailableDays = days.filter(
      (day) => (day.componentInstance as DayComponent).status === DayState.Full
    );

    expect(unavailableDays.length).toBe(27);
  });

  it('should go to previous month', (done) => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const previousMonth = 5;
    const previousYear = 2025;
    component.selectedDate = new Date(yearToUse, monthToUse, 1);

    fixture.detectChanges();
    spyOn(component.monthChanged, 'emit').and.callThrough();
    component.monthChanged.subscribe((selectedDate: Date) => {
      expect(selectedDate.getFullYear()).toBe(previousYear);
      expect(selectedDate.getMonth()).toBe(previousMonth);
      done();
    });

    const previousMonthButton = fixture.debugElement.queryAll(By.css('.button-previous-month'));
    expect(previousMonthButton.length).toBe(1);

    previousMonthButton[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.monthChanged.emit).toHaveBeenCalled();
  });

  it('should go to next month', (done) => {
    const monthToUse = 6;
    const yearToUse = 2025;
    const nextMonth = 7;
    const nextYear = 2025;
    const unavailabilityToUse: DateTimeRange[] = [];
    component.selectedDate = new Date(yearToUse, monthToUse, 1);
    component.unavailability = unavailabilityToUse;

    fixture.detectChanges();
    spyOn(component.monthChanged, 'emit').and.callThrough();
    component.monthChanged.subscribe((selectedDate: Date) => {
      expect(selectedDate.getFullYear()).toBe(nextYear);
      expect(selectedDate.getMonth()).toBe(nextMonth);
      done();
    });

    const nextMonthButton = fixture.debugElement.queryAll(By.css('.button-next-month'));
    expect(nextMonthButton.length).toBe(1);

    nextMonthButton[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.monthChanged.emit).toHaveBeenCalled();
  });

  it('should emit a date selected event when a day is selected', () => {
    const monthToUse = 8;
    const yearToUse = 2018;
    const dayToSelect = 12;
    const unavailabilityToUse: DateTimeRange[] = [];
    component.selectedDate = new Date(yearToUse, monthToUse, 1);
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
