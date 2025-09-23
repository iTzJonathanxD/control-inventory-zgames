import { Module } from './module.interface'
export interface Permission {
  id: number
  permissionName: string
  description?: string
  isActive: boolean
  moduleId: string | Module
  isActiveForRole?: boolean
}
