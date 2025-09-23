import type { Route } from '@angular/router'
import { IventoryComponent } from './pages/inventory.component'
export const INVENTORY_ROUTES: Route[] = [
  {
    path: 'inventory',
    component: IventoryComponent,
    data: { title: 'INVENTORY.TITLE' },
  },
]
