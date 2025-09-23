import type { Route } from '@angular/router'
import { PaymentComponent } from './pages/payment.component'
export const PAYMENT_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: PaymentComponent,
    data: { title: 'PAYMENT.TITLE' },
  },
]
