import { Permission } from './permission.interface'
export interface RolePermission {
  id?: number
  roleId: string
  permissionId: string | Permission
}
