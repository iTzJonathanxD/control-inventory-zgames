import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
export type MenuItemType = {
  key: string
  label: string
  isTitle?: boolean
  icon?: string
  url?: string
  badge?: {
    variant: string
    text: string
  }
  parentKey?: string
  isDisabled?: boolean
  collapsed?: boolean
  children?: MenuItemType[]
  requiredPermissions?: string[]
}
export type SubMenus = {
  item: MenuItemType
  linkClassName?: string
  subMenuClassName?: string
  activeMenuItems?: Array<string>
  toggleMenu?: (item: MenuItemType, status: boolean) => void
  className?: string
}
export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'RESUME',
    label: 'RESUME',
    isTitle: true,
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    key: 'DASHBOARD',
    label: 'DASHBOARD',
    icon: 'ti-dashboard',
    url: '/dashboard',
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    key: 'USERS_MANAGEMENT',
    label: 'USERS_MANAGEMENT',
    requiredPermissions: [PERMISSIONS.USER_VIEW],
    isTitle: true,
  },
  {
    key: 'USERS',
    label: 'USERS',
    icon: 'ti-user',
    url: '/users-management/users',
    requiredPermissions: [PERMISSIONS.USER_VIEW],
  },
  {
    key: 'PRODUCTS_MANAGEMENT',
    label: 'PRODUCTS_MANAGEMENT',
    isTitle: true,
    requiredPermissions: [
      PERMISSIONS.PRODUCT_VIEW,
      PERMISSIONS.CATEGORY_VIEW,
      PERMISSIONS.ENTRY_VIEW,
      PERMISSIONS.EXIT_VIEW,
    ],
  },
  {
    key: 'PRODUCT_LIST',
    label: 'PRODUCT_LIST',
    icon: 'ti-list',
    url: '/products-management',
    requiredPermissions: [PERMISSIONS.PRODUCT_VIEW],
  },
  {
    key: 'PRODUCT_CATEGORIES',
    label: 'PRODUCT_CATEGORIES',
    icon: 'ti-tag',
    url: '/categories-management/categories',
    requiredPermissions: [PERMISSIONS.CATEGORY_VIEW],
  },
  {
    key: 'SYSTEM_MANAGEMENT',
    label: 'SYSTEM_MANAGEMENT',
    requiredPermissions: [PERMISSIONS.ROLE_VIEW, PERMISSIONS.PERMISSION_VIEW],
    isTitle: true,
  },
  {
    key: 'MOVEMENTS',
    label: 'MOVEMENTS',
    icon: 'ti-archive',
    url: '/inventory-management/inventory',
    requiredPermissions: [PERMISSIONS.INVENTORY_VIEW],
  },
  {
    key: 'ROLES_AND_PERMISSIONS',
    label: 'ROLES_AND_PERMISSIONS',
    icon: 'ti-user-shield',
    url: '/system-management/roles-and-permissions',
    requiredPermissions: [PERMISSIONS.ROLE_VIEW, PERMISSIONS.PERMISSION_VIEW],
  },
  {
    key: 'USER_CATALOG',
    label: 'USER_CATALOG',
    isTitle: true,
  },
  {
    key: 'PRODUCT_CATALOG',
    label: 'PRODUCT_CATALOG',
    icon: 'ti-shopping-cart',
    url: '/user-products',
  },
  {
    key: 'ORDERS_MANAGEMENT',
    label: 'ORDERS_MANAGEMENT',
    isTitle: true,
  },
  {
    key: 'ORDERS_LIST',
    label: 'ORDERS_LIST',
    icon: 'ti-shopping-bag',
    url: '/orders',
  },
  {
    key: 'ADMIN_MANAGEMENT',
    label: 'ADMIN_MANAGEMENT',
    isTitle: true,
    requiredPermissions: [PERMISSIONS.PAYMENT_VIEW],
  },
  {
    key: 'ADMIN_PAYMENTS',
    label: 'ADMIN_PAYMENTS',
    icon: 'ti-credit-card',
    url: '/payments/list',
    requiredPermissions: [PERMISSIONS.USER_EDIT],
  },
  {
    key: 'WHATSAPP_MANAGEMENT',
    label: 'WHATSAPP_MANAGEMENT',
    isTitle: true,
    requiredPermissions: [PERMISSIONS.USER_EDIT],
  },
  {
    key: 'WHATSAPP_INSTANCES',
    label: 'WHATSAPP_INSTANCES',
    icon: 'ti-settings',
    url: '/whatsapp/instances',
    requiredPermissions: [PERMISSIONS.USER_EDIT],
  },
]
export const HORIZONTAL_MENU_ITEM: MenuItemType[] = [
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: 'ti-dashboard',
    children: [
      {
        key: 'sales',
        label: 'Sales',
        url: '/dashboards/sales',
        parentKey: 'dashboards',
        requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
      },
      {
        key: 'clinic',
        label: 'Clinic',
        url: '/dashboards/clinic',
        parentKey: 'dashboards',
        requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
      },
      {
        key: 'wallet',
        label: 'eWallet',
        url: '/dashboards/wallet',
        parentKey: 'dashboards',
        requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
      },
    ],
  },
]
