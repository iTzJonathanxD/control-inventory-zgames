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
export class LockScreenGuard implements CanActivate {
  private authService = inject(AuthenticationService)
  private router = inject(Router)
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLocked = this.authService.isLocked()
    if (isLocked && state.url !== '/auth/lock-screen') {
      this.router.navigate(['/auth/lock-screen'])
      return false
    }
    return true
  }
}
