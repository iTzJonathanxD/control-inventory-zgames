import { Directive, HostBinding, HostListener } from "@angular/core";
@Directive({
  selector: "[onlyNumbers]",
})
export class OnlyNumbersDirective {
  @HostBinding("autocomplete") public autocomplete;
  constructor() {
    this.autocomplete = "off";
  }
  @HostListener("keypress", ["$event"]) public disableKeys(e: KeyboardEvent) {
    const keyCode = e.keyCode;
    return keyCode === 8 || (keyCode >= 48 && keyCode <= 57);
  }
  @HostListener("paste", ["$event"]) public disablePaste(e: ClipboardEvent) {
    const clipboardData = e.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData("text");
    if (!/^\d+$/.test(pastedText)) {
      e.preventDefault();
    }
  }
}
