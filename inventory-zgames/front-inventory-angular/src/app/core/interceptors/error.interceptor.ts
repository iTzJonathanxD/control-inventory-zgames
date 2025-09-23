import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { RESPONSE_CODES } from '@core/helpers/global/auth.constants'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { TranslateService } from '@ngx-translate/core'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private _notificationService = inject(ToastrNotificationService)
  private _translateService = inject(TranslateService)
  private router = inject(Router)
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = this._translateService.instant('WORDS.UNKNOWN_ERROR')
        if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
        if (error.status === RESPONSE_CODES.FORBIDDEN) {
          this.router.navigate(['/auth/account-deactivation'])
        }
        this._notificationService.showNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        })
        const errorMessageTranslated =
          this._notificationService.getMessageTest(errorMessage)
        return throwError(() => new Error(errorMessageTranslated))
      })
    )
  }
}
export const ERROR_INTERCEPTOR_PROVIDERS = [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
]
