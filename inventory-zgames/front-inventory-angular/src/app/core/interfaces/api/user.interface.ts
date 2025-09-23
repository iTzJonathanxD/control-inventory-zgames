import { Company } from './company.interface'
import { Role } from './rol.interface'
export interface User {
  id?: number
  username: string
  firstName: string
  lastName: string
  password?: string
  email: string
  address?: string
  phone?: string
  debt?: number
  failedLoginAttempts?: number
  isLocked?: boolean
  isActive?: boolean
  roleId: Role
  role?: Role
  companyId?: Company
  company?: Company
  profilePhoto: string
  createdAt?: string
  updatedAt?: string
  permissions?: string[]
}
export interface UserLoginRequest {
  email: string
  password: string
}
export interface UserState {
  user: User | null
  permissions: string[]
  message: string | null
  loading: boolean
}
export interface GetAllUsersResponse {
  data: {
    result: User[]
    totalCount: number
  }
  message?: string
}
export interface UserModalData {
  isEditForm?: boolean
  user?: User
  mode?: ModalMode
}
export type ModalMode = 'create' | 'edit' | 'view'
export interface UserFormData {
  id?: string
  username: string
  firstName: string
  lastName: string
  email: string
  password?: string
  address?: string
  phone?: string
  debt?: number
  roleId: string
  companyId: string
  isActive: boolean
  profilePhoto?: string
}
