import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router'
import { Store } from '@ngrx/store'
import { AppState } from '@core/states/index'
import {
  selectUserPermissions,
  selectAuth,
  selectUser,
} from '@core/states/auth/auth.selectors'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { Observable, of, combineLatest } from 'rxjs'
import { map, catchError, first, tap } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core'
import { DEFAULT_VALUES } from '@core/helpers/ui/constants'
@Injectable({
  providedIn: 'root',
})
export class RolePermissionGuard implements CanActivate {
  constructor(
    private _store: Store<AppState>,
    private _router: Router,
    private _notificationService: ToastrNotificationService,
    private _translate: TranslateService
  ) {}
  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredPermissions = route.data['permissions'] as string[]
    return combineLatest([
      this._store.select(selectUserPermissions),
      this._store.select(selectAuth),
      this._store.select(selectUser),
    ]).pipe(
      first(
        ([permissions, authState, user]) =>
          permissions.length > DEFAULT_VALUES.ZERO ||
          user?.role?.roleName === 'ADMIN'
      ),
      map(([permissions, authState, user]) => {
        if (user?.role?.roleName === 'ADMIN') {
          return { hasPermission: true, authState }
        }
        const hasPermission = this.checkPermission(
          requiredPermissions,
          permissions
        )
        return { hasPermission, authState }
      }),
      tap(({ hasPermission, authState }) => {
        if (!hasPermission) {
          this._notificationService.showNotification({
            type: 'error',
            message: this._translate.instant('GLOBAL.NOTIFICATIONS.ERROR'),
            title: this._translate.instant(
              'GLOBAL.NOTIFICATIONS.ERROR_PERMISSION'
            ),
          })
          const userRole =
            authState.user?.role?.roleName?.toLowerCase() ||
            authState.user?.roleId?.roleName?.toLowerCase()
          if (userRole === 'admin') {
            this._router.navigate(['/dashboard'])
          } else {
            this._router.navigate(['/user-products'])
          }
        }
      }),
      map(({ hasPermission }) => hasPermission),
      catchError(() => {
        this._notificationService.showNotification({
          type: 'error',
          message: this._translate.instant('GLOBAL.NOTIFICATIONS.ERROR'),
          title: this._translate.instant('GLOBAL.NOTIFICATIONS.ERROR_TITLE'),
        })
        this._router.navigate(['/user-products'])
        return of(DEFAULT_VALUES.FALSE)
      })
    )
  }
  /**
   * Retorna true si el usuario tiene al menos uno de los permisos requeridos
   */
  private checkPermission(
    requiredPermissions: string[],
    userPermissions: string[]
  ): boolean {
    if (
      !Array.isArray(requiredPermissions) ||
      requiredPermissions.length === 0
    ) {
      return false
    }
    if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
      return false
    }
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    )
  }
}
