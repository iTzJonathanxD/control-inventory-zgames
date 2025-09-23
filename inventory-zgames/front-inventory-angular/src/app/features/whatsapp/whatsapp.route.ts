import { Routes } from '@angular/router'
import { AuthGuard } from '../../core/guards/auth.guard'
export const whatsappRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'configuration',
        pathMatch: 'full',
      },
      {
        path: 'configuration',
        loadComponent: () =>
          import('./pages/whatsapp-config/whatsapp-config.component').then(
            (m) => m.WhatsAppConfigComponent
          ),
        canActivate: [AuthGuard],
        data: {
          title: 'Configuración WhatsApp',
          breadcrumb: 'WhatsApp',
        },
      },
      {
        path: 'instances',
        loadComponent: () =>
          import(
            './pages/whatsapp-instances/whatsapp-instances.component'
          ).then((m) => m.WhatsAppInstancesComponent),
        canActivate: [AuthGuard],
        data: {
          title: 'Instancias WhatsApp',
          breadcrumb: 'Instancias',
        },
      },
    ],
  },
]
