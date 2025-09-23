import { inject, Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { DEFAULT_GLOBAL_TOASTR_CONFIG } from '@core/helpers/ui/ui.constants'
import { ApiMessage } from '@core/interfaces/api/message.interface'
import { ToastrNotification } from '@core/interfaces/ui/notification.interface'
import { LanguageService } from './language.service'
@Injectable({
  providedIn: 'root',
})
export class ToastrNotificationService {
  private _toastrService = inject(ToastrService)
  private _translateService = inject(TranslateService)
  private _lang = inject(LanguageService)
  public showNotification(notification: ToastrNotification): void {
    const { type, message, title, config } = notification
    const titleText = title ? this._translateService.instant(title) : ''
    const messageText = this.getMessageTest(message)
    const configFormatted = { ...DEFAULT_GLOBAL_TOASTR_CONFIG, ...config }
    this._toastrService[type](messageText, titleText, configFormatted)
  }
  public getMessageTest(message: ApiMessage | string): string {
    let messageFormatted = ''
    if (typeof message === 'string') {
      messageFormatted = message
    } else if (typeof message === 'object') {
      if ('text' in message && 'type' in message) {
        messageFormatted = message.text
      } else {
        const language = this._lang.code.value
        const messageText = (message as any)[language] || ''
        messageFormatted = messageText
      }
    }
    return messageFormatted
  }
  public showSuccess(message: string, title: string = ''): void {
    this.showNotification({
      type: 'success',
      message: message,
      title: title,
    })
  }
  public showError(message: string, title: string = ''): void {
    this.showNotification({
      type: 'error',
      message: message,
      title: title,
    })
  }
  public showWarning(message: string, title: string = ''): void {
    this.showNotification({
      type: 'warning',
      message: message,
      title: title,
    })
  }
  public showInfo(message: string, title: string = ''): void {
    this.showNotification({
      type: 'info',
      message: message,
      title: title,
    })
  }
}
