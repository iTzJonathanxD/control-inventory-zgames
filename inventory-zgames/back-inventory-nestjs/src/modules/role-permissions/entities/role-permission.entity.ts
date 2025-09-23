import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../core/base-entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
export class RolePermission extends BaseEntity {
  @Column({ name: 'role_id' })
  roleId: number;
  @Column({ name: 'permission_id' })
  permissionId: number;
  @Column({ name: 'is_active_for_role', default: true })
  isActiveForRole: boolean;
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;
  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
