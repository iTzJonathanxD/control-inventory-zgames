import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
} from '@angular/core'
@Directive({
  selector: '[sharedDecimalInput]',
})
export class DecimalInputDirective {
  @Input('sharedDecimalInput')
  public decimalSettings: {
    intDigs: number
    decDigs: number
  } = { intDigs: 2, decDigs: 2 }
  private _elementRef = inject(ElementRef)
  @HostListener('input', ['$event'])
  public onInput(event: Event): void {
    this.validateInput()
  }
  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent): void {
    setTimeout(() => this.validateInput(), 0)
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = this._elementRef.nativeElement as HTMLInputElement
    if (
      !(
        (event.key >= '0' && event.key <= '9') ||
        event.key === 'Backspace' ||
        event.key === 'Delete' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'Tab' ||
        (event.key === '.' && !input.value.includes('.')) ||
        (event.key === '-' && !input.value.startsWith('-'))
      )
    ) {
      event.preventDefault()
    }
  }
  private validateInput(): void {
    const input = this._elementRef.nativeElement as HTMLInputElement
    const value = input.value
    const regex = new RegExp(
      `^-?\\d{0,${this.decimalSettings.intDigs}}(\\.\\d{0,${this.decimalSettings.decDigs}})?$`
    )
    if (!regex.test(value)) {
      input.value = value.slice(0, -1)
      input.dispatchEvent(new Event('input'))
    }
  }
}
