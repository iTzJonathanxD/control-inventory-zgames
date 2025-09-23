import { Injectable } from '@angular/core'
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Store } from '@ngrx/store'
import { AppState } from '@core/states/index'
import { selectAuth } from '@core/states/auth/auth.selectors'
import { Observable, of } from 'rxjs'
import { map, first } from 'rxjs/operators'
@Injectable({
  providedIn: 'root',
})
export class RoleRedirectGuard implements CanActivate {
  constructor(
    private _store: Store<AppState>,
    private _router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this._store.select(selectAuth).pipe(
      first((authState) => authState.user !== null),
      map((authState) => {
        if (authState.user) {
          const userRole =
            authState.user.role?.roleName?.toLowerCase() ||
            authState.user.roleId?.roleName?.toLowerCase()
          if (userRole === 'admin') {
            this._router.navigate(['/dashboard'])
          } else {
            this._router.navigate(['/user-products'])
          }
        }
        return false // Prevenir activación de la ruta actual ya que redirigimos
      })
    )
  }
}
