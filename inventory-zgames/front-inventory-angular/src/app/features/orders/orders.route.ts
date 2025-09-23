import { Routes } from '@angular/router'
export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-list/orders-list.component').then(
        (m) => m.OrdersListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-details/order-details.component').then(
        (m) => m.OrderDetailsComponent
      ),
  },
]
