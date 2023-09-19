import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dataGrid]',
})
export class GridDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}