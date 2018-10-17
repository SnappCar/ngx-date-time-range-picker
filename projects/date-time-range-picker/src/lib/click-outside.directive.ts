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
    const isParentInput =
      targetElement.id === 'datePicker' || targetElement.id === 'timePicker';
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside && !isParentInput) {
      this.clickOutside.emit();
    }
  }

  constructor(private elementRef: ElementRef) {}
}
