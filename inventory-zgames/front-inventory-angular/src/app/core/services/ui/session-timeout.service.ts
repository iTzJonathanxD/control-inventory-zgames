import { Injectable, Inject, NgZone, inject } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { DOCUMENT } from '@angular/common'
import { AuthenticationService } from '@core/services/api/auth.service'
import { Subject, fromEvent, merge, timer, interval } from 'rxjs'
import { switchMap, tap, takeUntil, filter } from 'rxjs/operators'
import { ToastrNotificationService } from './notification.service'
import { TIMEOUTS } from '@core/helpers/ui/constants'
import { TranslateService } from '@ngx-translate/core'
@Injectable({
  providedIn: 'root',
})
export class SessionTimeoutService {
  private timeoutDuration = TIMEOUTS.TIMEOUT_DURATION
  private warningDuration = TIMEOUTS.WARINING_DURATION
  private reset$ = new Subject<void>()
  private destroy$ = new Subject<void>()
  private countdownValue = 10
  private countdown$ = new Subject<number>()
  private excludedRoutes = ['/auth/login', '/auth/lock-screen']
  private _router = inject(Router)
  private _authService = inject(AuthenticationService)
  private _ngZone = inject(NgZone)
  private _notificationService = inject(ToastrNotificationService)
  private _translate = inject(TranslateService)
  private document = inject(DOCUMENT)
  constructor() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap((event: any) => {
          if (this.excludedRoutes.includes(event.url)) {
            this.stopTracking()
          } else {
            this.startTracking()
          }
        })
      )
      .subscribe()
  }
  private startTracking() {
    this._ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'keydown', 'scroll', 'click']
      const eventStreams = events.map((event) =>
        fromEvent(this.document, event)
      )
      merge(...eventStreams)
        .pipe(tap(() => this.resetTimeout()))
        .subscribe()
      this.startTimeout()
    })
  }
  private startTimeout() {
    if (this.isExcludedRoute()) return
    timer(this.timeoutDuration - this.warningDuration)
      .pipe(
        tap(() => this.startWarningCountdown()),
        switchMap(() => timer(this.warningDuration)),
        tap(() => this.lockSession()),
        takeUntil(this.reset$),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  private startWarningCountdown() {
    if (this._authService.isLocked() || this.isExcludedRoute()) return
    this.countdownValue = this.warningDuration / 1000
    interval(1000)
      .pipe(
        tap(() => {
          this.countdown$.next(this.countdownValue)
          this.showWarningToast(this.countdownValue)
          this.countdownValue--
        }),
        takeUntil(timer(this.warningDuration)),
        takeUntil(this.reset$),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  private showWarningToast(timeLeft: number) {
    this._translate
      .get('SESSION_TIMEOUT.WARNING_MESSAGE', { timeLeft })
      .subscribe((translatedMessage: string) => {
        this._notificationService.showNotification({
          type: 'warning',
          title: 'Aviso de Inactividad',
          message: translatedMessage,
        })
      })
  }
  private resetTimeout() {
    if (this.isExcludedRoute()) return
    this.reset$.next()
    this.startTimeout()
  }
  private lockSession() {
    if (this.isExcludedRoute()) return
    this._authService.lockSession()
    this._router.navigate(['/auth/lock-screen'])
  }
  stopTracking() {
    this.destroy$.next()
  }
  getCountdownObservable() {
    return this.countdown$.asObservable()
  }
  private isExcludedRoute(): boolean {
    return this.excludedRoutes.includes(this._router.url)
  }
}
