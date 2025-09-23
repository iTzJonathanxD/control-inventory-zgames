import { Directive, HostListener, inject } from '@angular/core'
import { NgControl } from '@angular/forms'
@Directive({
  selector: '[appOnlyNumbersWhitTwoDecimal]',
})
export class OnlyNumbersWhitTwoDecimalDirective {
  private regex: RegExp = new RegExp(/^(-)?\d+(\.\d{0,2})?$/g)
  private specialKeys: Array<string> = [
    'Backspace',
    'Tab',
    'End',
    'Home',
    'ArrowLeft',
    'ArrowRight',
    'Delete',
  ]
  private ngControl = inject(NgControl)
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return
    }
    const current: string = this.ngControl.control?.value || ''
    const next: string = current.concat(event.key)
    if (event.key === '-' && current.length === 0) {
      return
    }
    if (next && !String(next).match(this.regex)) {
      event.preventDefault()
    }
  }
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text') || ''
    if (!String(clipboardData).match(this.regex)) {
      event.preventDefault()
    }
  }
}
