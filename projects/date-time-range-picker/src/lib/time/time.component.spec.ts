import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TimeComponent } from './time.component';
import {TimeSegment} from "../models/time-segment";
import {Subject} from "rxjs";

describe('TimeComponent', () => {
  let component: TimeComponent;
  let fixture: ComponentFixture<TimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [TimeComponent]
    })
      .overrideComponent(TimeComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeComponent);
    component = fixture.componentInstance;
    component.unavailableTimes = new Subject<TimeSegment[]>();
    component.selectedDate = new Date(2018, 6, 26);
    component.unavailabilities = [
      { start: new Date(2018, 6, 25, 10, 0), end: new Date(2018, 6, 26, 11, 0) },
      { start: new Date(2018, 6, 26, 16, 0), end: new Date(2018, 6, 26, 18, 0) },
      { start: new Date(2018, 6, 26, 23, 0), end: new Date(2018, 6, 27, 11, 0) }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should make times unavailable based on alwaysUnavailableTimes', () => {
    const optionThatShouldNotYetBeBlocked = component
      .timeOptions
      .filter(timeoption => timeoption.hour === 12 && timeoption.minute === 30)[0];

    component.unavailableTimes.next([{
      hour:12,
      minute: 30,
      isBlocked: true
    }]);

    const optionThatShouldBeBlocked = component
      .timeOptions
      .filter(timeoption => timeoption.hour === 12 && timeoption.minute === 30)[0];

    expect(optionThatShouldNotYetBeBlocked.isBlocked).toBe(false);
    expect(optionThatShouldBeBlocked.isBlocked).toBe(true);
  });

  it('should show all options in a day', () => {
    const options = fixture.debugElement.queryAll(By.css('li.time-list-item'));

    expect(options.length).toBe(48);
  });

  it('should have the correct amount of unavailable options in case of an overlapping start', () => {
    component.selectedDate = new Date(2018, 6, 26);
    component.unavailabilities = [
      { start: new Date(2018, 6, 25, 10, 0), end: new Date(2018, 6, 26, 11, 0) }
    ];

    component.ngOnInit();
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('li.time-list-item.disabled'));

    expect(options.length).toBe(23);
  });

  it('should have the correct amount of unavailable options in case of an overlapping end', () => {
    component.selectedDate = new Date(2018, 6, 26);
    component.unavailabilities = [
      { start: new Date(2018, 6, 26, 23, 0), end: new Date(2018, 6, 27, 11, 0) }
    ];

    component.ngOnInit();
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('li.time-list-item.disabled'));

    expect(options.length).toBe(2);
  });

  it('should have the correct amount of unavailable options in case of a period within the day', () => {
    component.selectedDate = new Date(2018, 6, 26);
    component.unavailabilities = [
      { start: new Date(2018, 6, 26, 16, 0), end: new Date(2018, 6, 26, 18, 0) }
    ];

    component.ngOnInit();
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('li.time-list-item.disabled'));

    expect(options.length).toBe(5);
  });

  it('should emit when a time is selected', () => {
    spyOn(component.timeSelected, 'emit').and.callThrough();

    const timeToSelect = { hour: 23, minute: 30, isBlocked: false };
    component.onTimeSelected(timeToSelect);

    expect(component.timeSelected.emit).toHaveBeenCalledWith({
      hours: timeToSelect.hour,
      minutes: timeToSelect.minute
    });
  });

  it('should not emit when the selected time is blocked', () => {
    spyOn(component.timeSelected, 'emit').and.callThrough();

    const timeToSelect = { hour: 23, minute: 30, isBlocked: true };
    component.onTimeSelected(timeToSelect);

    expect(component.timeSelected.emit).not.toHaveBeenCalled();
  });
});
