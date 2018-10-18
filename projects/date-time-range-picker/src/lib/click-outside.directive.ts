import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output
} from '@angular/core';

@Directive({
  selector: '[ngxClickOutside]'
})
export class ClickOutsideDirective {
  @Output()
  public clickOutside = new EventEmitter();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement): void {
    const isDayBlock = targetElement.classList.contains('day-block');
    const isTimeBlock = targetElement.classList.contains('time-list-item');
    const isRentButton = targetElement.classList.contains('rent-button');
    const isParentInput =
      targetElement.id === 'datePicker' || targetElement.id === 'timePicker';
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (
      !clickedInside &&
      !isParentInput &&
      !isDayBlock &&
      !isTimeBlock &&
      !isRentButton
    ) {
      this.clickOutside.emit();
    }
  }

  constructor(private elementRef: ElementRef) {}
}
