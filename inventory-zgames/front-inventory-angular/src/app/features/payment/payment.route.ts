import { Routes } from '@angular/router'
export const PAYMENT_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/payment-form/payment-form.component').then(
        (m) => m.PaymentFormComponent
      ),
  },
]
