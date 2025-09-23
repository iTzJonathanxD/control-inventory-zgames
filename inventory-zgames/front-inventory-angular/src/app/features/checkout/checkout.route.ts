import { Routes } from '@angular/router'
export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/checkout-view/checkout-view.component').then(
        (m) => m.CheckoutViewComponent
      ),
  },
]
