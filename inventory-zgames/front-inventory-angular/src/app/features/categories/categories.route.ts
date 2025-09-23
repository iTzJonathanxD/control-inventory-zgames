import type { Route } from '@angular/router'
import { CategoriesComponent } from './pages/category/category.component'
export const CATEGORIES_ROUTES: Route[] = [
  {
    path: 'categories',
    component: CategoriesComponent,
    data: { title: 'CATEGORIAS.TITLE' },
  },
]
