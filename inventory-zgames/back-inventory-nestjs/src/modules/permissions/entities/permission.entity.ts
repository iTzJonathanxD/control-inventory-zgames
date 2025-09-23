import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import { BaseEntity } from "../../../core/base-entity"
import { Module } from "../../modules/entities/module.entity"
import { RolePermission } from "../../role-permissions/entities/role-permission.entity"
@Entity("permissions")
export class Permission extends BaseEntity {
  @Column({ name: "permission_name" })
  permissionName: string
  @Column({ nullable: true })
  description: string
  @Column({ name: "is_active", default: true })
  isActive: boolean
  @Column({ name: "module_id" })
  moduleId: number
  @ManyToOne(
    () => Module,
    (module) => module.permissions,
  )
  @JoinColumn({ name: "module_id" })
  module: Module
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[]
}
