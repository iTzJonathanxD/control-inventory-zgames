import type { Route } from '@angular/router'
import { RolePermissionGuard } from '@core/guards/role-permission.guard'
import { PERMISSIONS } from '../shared/data/config/constants.permission'
export const VIEWS_ROUTES: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/products-dashboard.routes').then(
        (mod) => mod.PRODUCTS_DASHBOARD_ROUTES
      ),
  },
  {
    path: 'users-management',
    loadChildren: () =>
      import('./user/user.route').then((mod) => mod.USER_ROUTES),
    canActivate: [RolePermissionGuard],
    data: { permissions: [PERMISSIONS.USER_VIEW] },
  },
  {
    path: 'products-management',
    loadChildren: () =>
      import('./products/products.route').then((mod) => mod.PRODUCTS_ROUTES),
    canActivate: [RolePermissionGuard],
    data: { permissions: [PERMISSIONS.PRODUCT_VIEW] },
  },
  {
    path: 'categories-management',
    loadChildren: () =>
      import('./categories/categories.route').then(
        (mod) => mod.CATEGORIES_ROUTES
      ),
    canActivate: [RolePermissionGuard],
    data: { permissions: [PERMISSIONS.CATEGORY_VIEW] },
  },
  {
    path: 'inventory-management',
    loadChildren: () =>
      import('./inventory/inventory.route').then((mod) => mod.INVENTORY_ROUTES),
    canActivate: [RolePermissionGuard],
    data: { permissions: [PERMISSIONS.INVENTORY_VIEW] },
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.route').then((mod) => mod.PROFILE_ROUTES),
  },
  {
    path: 'system-management',
    loadChildren: () =>
      import('./system-management/system-management.route').then(
        (mod) => mod.SYSTEM_MANAGEMENT_ROUTES
      ),
  },
  {
    path: 'user-products',
    loadChildren: () =>
      import('./user-products/user-products.route').then(
        (mod) => mod.USER_PRODUCTS_ROUTES
      ),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./cart/cart.route').then((mod) => mod.CART_ROUTES),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./checkout/checkout.route').then((mod) => mod.CHECKOUT_ROUTES),
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./orders/orders.route').then((mod) => mod.ORDERS_ROUTES),
  },
  {
    path: 'payment',
    loadChildren: () =>
      import('./payment/payment.route').then((mod) => mod.PAYMENT_ROUTES),
  },
  {
    path: 'payments',
    loadChildren: () =>
      import('./payments/payment.route').then((mod) => mod.PAYMENT_ROUTES),
    canActivate: [RolePermissionGuard],
    data: { permissions: [PERMISSIONS.USER_EDIT] },
  },
  {
    path: 'confirmation',
    loadChildren: () =>
      import('./confirmation/confirmation.route').then(
        (mod) => mod.confirmationRoutes
      ),
  },
  {
    path: 'whatsapp',
    loadChildren: () =>
      import('./whatsapp/whatsapp.route').then((mod) => mod.whatsappRoutes),
  },
  {
    path: 'whatsapp',
    loadChildren: () =>
      import('./whatsapp/whatsapp.route').then((mod) => mod.whatsappRoutes),
    canActivate: [RolePermissionGuard],
    data: { permissions: [PERMISSIONS.USER_EDIT] },
  },
]
