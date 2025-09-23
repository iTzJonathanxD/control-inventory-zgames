import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../../core/base-entity"
import { User } from "../../users/entities/user.entity"
import { RolePermission } from "../../role-permissions/entities/role-permission.entity"
@Entity("roles")
export class Role extends BaseEntity {
  @Column({ name: "role_name", unique: true })
  roleName: string
  @Column({ nullable: true })
  description: string
  @Column({ name: "is_active", default: true })
  isActive: boolean
  @OneToMany(
    () => User,
    (user) => user.role,
  )
  users: User[]
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions: RolePermission[]
}
