import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
} from '@angular/core'
@Directive({
  selector: '[sharedMaxCharacters]',
})
export class MaxCharactersDirective {
  @Input()
  public sharedMaxCharacters: number = 0
  private _elementRef = inject(ElementRef)
  @HostListener('input', ['$event'])
  public onInputChange(event: Event): void {
    this.validateInput()
  }
  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent): void {
    setTimeout(() => this.validateInput(), 0)
  }
  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    const input = this._elementRef.nativeElement as HTMLInputElement
    const inputLength = input.value.length
    if (inputLength >= this.sharedMaxCharacters) {
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault()
      }
    }
  }
  private validateInput(): void {
    const input = this._elementRef.nativeElement as HTMLInputElement
    if (input.value.length > this.sharedMaxCharacters) {
      input.value = input.value.slice(0, this.sharedMaxCharacters)
    }
  }
}
