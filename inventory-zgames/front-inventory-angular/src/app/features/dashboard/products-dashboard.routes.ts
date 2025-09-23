import type { Routes } from '@angular/router'
import { RolePermissionGuard } from '@core/guards/role-permission.guard'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
import { ProductsDashboardComponent } from './pages/products-dashboard.component'
export const PRODUCTS_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ProductsDashboardComponent,
    data: {
      title: 'Dashboard de Productos',
      breadcrumb: 'Dashboard',
    },
  },
]
