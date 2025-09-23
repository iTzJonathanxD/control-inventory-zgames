import type { Route } from '@angular/router'
export const PRODUCTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (c) => c.ProductsComponent
      ),
    data: { title: 'PRODUCTS.TITLE' },
  },
  {
    path: 'products',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/product-create/product-create.component').then(
        (c) => c.ProductCreateComponent
      ),
    data: { title: 'PRODUCTS.CREATE.TITLE' },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/product-edit/product-edit.component').then(
        (c) => c.ProductEditComponent
      ),
    data: { title: 'PRODUCTS.EDIT.TITLE' },
  },
  {
    path: 'view/:id',
    loadComponent: () =>
      import('./pages/product-view/product-view.component').then(
        (c) => c.ProductViewComponent
      ),
    data: { title: 'PRODUCTS.VIEW.TITLE' },
  },
]
