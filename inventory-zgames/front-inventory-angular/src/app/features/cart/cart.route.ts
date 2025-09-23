import { Routes } from '@angular/router'
export const CART_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cart-view/cart-view.component').then(
        (m) => m.CartViewComponent
      ),
  },
]
