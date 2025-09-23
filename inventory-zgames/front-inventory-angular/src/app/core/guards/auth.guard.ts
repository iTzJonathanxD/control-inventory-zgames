import { Injectable } from '@angular/core'
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { AuthenticationService } from '@core/services/api/auth.service'
import { inject } from '@angular/core'
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private _auth = inject(AuthenticationService)
  private _router = inject(Router)
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = !this._auth.isLoggedOut()
    if (!isLoggedIn) {
      this._router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      })
      return false
    }
    if (state.url === '/auth/login') {
      this._router.navigateByUrl('/')
      return false
    }
    return true
  }
}
