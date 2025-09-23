import type { Route } from '@angular/router'
import { UserProductsViewComponent } from './pages/user-products-view/user-products-view.component'
import { ProductCatalogComponent } from './pages/product-catalog/product-catalog.component'
export const USER_PRODUCTS_ROUTES: Route[] = [
  {
    path: '',
    component: ProductCatalogComponent,
    data: { title: 'USER_PRODUCTS.TITLE' },
  },
]
