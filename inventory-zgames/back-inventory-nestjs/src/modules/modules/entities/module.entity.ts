import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../../core/base-entity"
import { Permission } from "../../permissions/entities/permission.entity"
@Entity("modules")
export class Module extends BaseEntity {
  @Column({ name: "module_name", unique: true })
  moduleName: string
  @Column({ nullable: true })
  description: string
  @Column({ name: "is_active", default: true })
  isActive: boolean
  @OneToMany(
    () => Permission,
    (permission) => permission.module,
  )
  permissions: Permission[]
}
