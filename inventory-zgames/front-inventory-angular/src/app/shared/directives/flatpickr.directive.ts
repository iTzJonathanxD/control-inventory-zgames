import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core'
import flatpickr from 'flatpickr'
import { Options } from 'flatpickr/dist/types/options'
@Directive({
  selector: '[mwlFlatpickr]',
  standalone: true,
})
export class FlatpickrDirective implements OnInit {
  @Input() flatpickrOptions: Options = {}
  private _elementRef = inject(ElementRef)
  ngOnInit() {
    this.initFlatpickr()
  }
  private initFlatpickr() {
    flatpickr(this._elementRef.nativeElement, this.flatpickrOptions)
  }
}
