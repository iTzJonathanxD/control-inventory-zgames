import { Routes } from '@angular/router'
import { AuthGuard } from '../../core/guards/auth.guard'
export const confirmationRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'order/:id',
        loadComponent: () =>
          import(
            './pages/order-confirmation/order-confirmation.component'
          ).then((m) => m.OrderConfirmationComponent),
        data: {
          title: 'Confirmación de Pedido',
          breadcrumb: 'Confirmación',
        },
      },
    ],
  },
]
