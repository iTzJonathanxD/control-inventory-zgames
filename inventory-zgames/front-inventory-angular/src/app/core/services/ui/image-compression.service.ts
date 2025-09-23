import { inject, Injectable } from '@angular/core'
import imageCompression from 'browser-image-compression'
import { ToastrNotificationService } from './notification.service'
import { TranslateService } from '@ngx-translate/core'
@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  private _notificationService = inject(ToastrNotificationService)
  private _translate = inject(TranslateService)
  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    }
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      const message = this._translate.instant(
        'COMPRESSION_IMG_ERRORS.ERROR_COMPRESSION_IMG'
      )
      this._notificationService.showNotification({
        type: 'error',
        message: message,
      })
      return file
    }
  }
}
