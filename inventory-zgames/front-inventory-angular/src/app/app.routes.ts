import { Routes } from '@angular/router'
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component'
import { LayoutComponent } from './shared/components/layouts/layout/layout.component'
import { AuthGuard } from '@core/guards/auth.guard'
import { LoginGuard } from '@core/guards/login.guard'
import { LockScreenGuard } from '@core/guards/lock-screen.guard'
import { RoleRedirectGuard } from '@core/guards/role-redirect.guard'
export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleRedirectGuard],
    children: [],
  },
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () =>
      import('./features/views.route').then((mod) => mod.VIEWS_ROUTES),
    canActivate: [AuthGuard, LockScreenGuard],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.route').then((mod) => mod.AUTH_ROUTES),
    canActivate: [LoginGuard],
  },
]
