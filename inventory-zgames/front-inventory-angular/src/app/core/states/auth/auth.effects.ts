import { inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AuthenticationService } from '@core/services/api/auth.service'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs'
import {
  USER_SESSION,
  USER_SESSION_PRE,
} from '../../helpers/global/global.constants'
import { UserService } from '../../services/api/user.service'
import { StorageService } from '../../services/ui/storage.service'
import { UserActions } from './auth.actions'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { TranslateService } from '@ngx-translate/core'
@Injectable()
export class AuthEffects {
  private _actions$ = inject(Actions)
  private _router = inject(Router)
  private _authService = inject(AuthenticationService)
  private _userService = inject(UserService)
  private _storageService = inject(StorageService)
  private _notificationService = inject(ToastrNotificationService)
  private _translate = inject(TranslateService)
  loadUserSession$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.loadUserSession),
      exhaustMap(() => this.loadUserSession())
    )
  )
  loginUser$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userAuthenticationRequest),
      switchMap((action) => this.loginUser(action)),
      switchMap(() => this.reloadUserSessionAfterLogin())
    )
  )
  logoutUser$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userLogout),
      switchMap(() => {
        this._authService.logout()
        return [UserActions.completeUserLogout()]
      })
    )
  )
  updateUserProfile$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.requestUserProfileUpdate),
      map((action) => {
        return action.user
      }),
      switchMap((user) =>
        this._userService.updateProfile(user).pipe(
          map((res) =>
            UserActions.userProfileUpdateSuccess({ user: res.data })
          ),
          catchError((error) =>
            of(
              UserActions.userProfileUpdateFailure({
                message: error.message,
              })
            )
          )
        )
      )
    )
  )
  private loadUserSession() {
    const storedSession = JSON.parse(
      this._storageService.secureStorage.getItem(USER_SESSION)
    )
    if (storedSession) {
      return this._authService.getMeUser().pipe(
        map((response) => {
          const user = response.data
          return UserActions.userAuthenticationSuccess({ user })
        }),
        catchError((error) => {
          return of(
            UserActions.userAuthenticationFailure({
              message: `Failed to load session: ${error.message}`,
            })
          )
        })
      )
    } else {
      return of(
        UserActions.userAuthenticationFailure({
          message: 'User session not found.',
        })
      )
    }
  }
  private loginUser(
    action: ReturnType<typeof UserActions.userAuthenticationRequest>
  ) {
    const { request } = action
    return this._authService.login(request).pipe(
      map((user) => {
        return UserActions.userAuthenticationSuccess({ user: user.data })
      }),
      catchError((error) =>
        of(
          UserActions.userAuthenticationFailure({
            message: `Login failed: ${error.message}`,
          })
        )
      )
    )
  }
  reloadUserSessionAfterLogin() {
    const storedSession =
      JSON.parse(this._storageService.secureStorage.getItem(USER_SESSION)) ||
      JSON.parse(this._storageService.secureStorage.getItem(USER_SESSION_PRE))
    if (storedSession) {
      return this._authService.getMeUser().pipe(
        map((response) => {
          const user = response.data
          this.redirectBasedOnRole(user)
          return UserActions.userAuthenticationSuccess({ user })
        }),
        catchError((error) => {
          return of(
            UserActions.userAuthenticationFailure({
              message: `Failed to load session: ${error.message}`,
            })
          )
        })
      )
    } else {
      return of(
        UserActions.userAuthenticationFailure({
          message: 'User session not found.',
        })
      )
    }
  }
  private redirectBasedOnRole(user: any) {
    const userRole =
      user.role?.roleName?.toLowerCase() || user.roleId?.roleName?.toLowerCase()
    if (userRole === 'admin') {
      this._router.navigate(['/dashboard'])
    } else {
      this._router.navigate(['/user-products'])
    }
  }
}
