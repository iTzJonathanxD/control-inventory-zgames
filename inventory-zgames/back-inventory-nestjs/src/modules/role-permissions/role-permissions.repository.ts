import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class RolePermissionsRepository {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repository: Repository<RolePermission>,
  ) {
    this.repository = repository;
  }
  async createRolePermission(
    createRolePermissionDto: Partial<RolePermission>,
  ): Promise<RolePermission> {
    const existingRolePermission = await this.repository.findOne({
      where: {
        roleId: createRolePermissionDto.roleId,
        permissionId: createRolePermissionDto.permissionId,
      },
    });
    if (existingRolePermission) {
      throw new ConflictException('Role-Permission combination already exists');
    }
    const rolePermission = this.repository.create(createRolePermissionDto);
    if (createRolePermissionDto.roleId) {
      const role = await this.repository.manager
        .getRepository(Role)
        .findOneBy({ id: createRolePermissionDto.roleId });
      if (!role)
        throw new NotFoundException(
          `Role with ID ${createRolePermissionDto.roleId} not found`,
        );
      rolePermission.role = role;
    }
    if (createRolePermissionDto.permissionId) {
      const permission = await this.repository.manager
        .getRepository(Permission)
        .findOneBy({ id: createRolePermissionDto.permissionId });
      if (!permission)
        throw new NotFoundException(
          `Permission with ID ${createRolePermissionDto.permissionId} not found`,
        );
      rolePermission.permission = permission;
    }
    return this.repository.save(rolePermission);
  }
  async findAllRolePermissions(
    page: number,
    limit: number,
    filter: { roleId?: number; permissionId?: number },
  ): Promise<[RolePermission[], number]> {
    const where: any = {};
    if (filter.roleId) where.roleId = filter.roleId;
    if (filter.permissionId) where.permissionId = filter.permissionId;
    return this.repository.findAndCount({
      where,
      relations: ['role', 'permission', 'permission.module'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  async findRolePermissionById(id: number): Promise<RolePermission> {
    const rolePermission = await this.repository.findOne({
      where: { id },
      relations: ['role', 'permission', 'permission.module'],
    });
    if (!rolePermission)
      throw new NotFoundException(`RolePermission with ID ${id} not found`);
    return rolePermission;
  }
  async updateRolePermission(
    id: number,
    updateRolePermissionDto: Partial<RolePermission>,
  ): Promise<RolePermission> {
    const rolePermission = await this.findRolePermissionById(id);
    Object.assign(rolePermission, updateRolePermissionDto);
    return this.repository.save(rolePermission);
  }
  async deleteRolePermission(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`RolePermission with ID ${id} not found`);
  }
  async getUserPermissions(userId: number): Promise<RolePermission[]> {
    return this.repository
      .createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .leftJoinAndSelect('permission.module', 'module')
      .leftJoinAndSelect('rp.role', 'role')
      .leftJoin('users', 'user', 'user.roleId = role.id')
      .where('user.id = :userId', { userId })
      .andWhere('rp.isActiveForRole = :isActive', { isActive: true })
      .andWhere('role.isActive = :roleActive', { roleActive: true })
      .andWhere('permission.isActive = :permissionActive', {
        permissionActive: true,
      })
      .getMany();
  }
  async getUserModulesAndPermissions(userId: number) {
    const userPermissions = await this.getUserPermissions(userId);
    const modulesMap = new Map();
    userPermissions.forEach((rp) => {
      const moduleId = rp.permission.module.id;
      const moduleName = rp.permission.module.moduleName;
      if (!modulesMap.has(moduleId)) {
        modulesMap.set(moduleId, {
          id: moduleId,
          moduleName: moduleName,
          description: rp.permission.module.description,
          isActive: rp.permission.module.isActive,
          permissions: [],
        });
      }
      modulesMap.get(moduleId).permissions.push({
        id: rp.permission.id,
        permissionName: rp.permission.permissionName,
        description: rp.permission.description,
        isActive: rp.permission.isActive,
        isActiveForRole: rp.isActiveForRole,
      });
    });
    return Array.from(modulesMap.values());
  }
  async getUserRolePermissions(userId: number) {
    const userWithRole = await this.repository.manager
      .createQueryBuilder('users', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .leftJoinAndSelect('permission.module', 'module')
      .where('user.id = :userId', { userId })
      .andWhere('user.isActive = :userActive', { userActive: true })
      .andWhere('role.isActive = :roleActive', { roleActive: true })
      .andWhere('rp.isActiveForRole = :rpActive', { rpActive: true })
      .andWhere('permission.isActive = :permissionActive', {
        permissionActive: true,
      })
      .getOne();
    if (!userWithRole) {
      return {
        user: null,
        role: null,
        permissions: [],
        modules: [],
      };
    }
    const permissions = userWithRole.role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      permissionName: rp.permission.permissionName,
      description: rp.permission.description,
      isActive: rp.permission.isActive,
      isActiveForRole: rp.isActiveForRole,
      module: {
        id: rp.permission.module.id,
        moduleName: rp.permission.module.moduleName,
        description: rp.permission.module.description,
        isActive: rp.permission.module.isActive,
      },
    }));
    const modulesMap = new Map();
    permissions.forEach((perm) => {
      const moduleId = perm.module.id;
      if (!modulesMap.has(moduleId)) {
        modulesMap.set(moduleId, {
          id: moduleId,
          moduleName: perm.module.moduleName,
          description: perm.module.description,
          isActive: perm.module.isActive,
          permissions: [],
        });
      }
      modulesMap.get(moduleId).permissions.push({
        id: perm.id,
        permissionName: perm.permissionName,
        description: perm.description,
        isActive: perm.isActive,
        isActiveForRole: perm.isActiveForRole,
      });
    });
    return {
      user: {
        id: userWithRole.id,
        firstName: userWithRole.firstName,
        lastName: userWithRole.lastName,
        email: userWithRole.email,
        username: userWithRole.username,
        isActive: userWithRole.isActive,
      },
      role: {
        id: userWithRole.role.id,
        roleName: userWithRole.role.roleName,
        description: userWithRole.role.description,
        isActive: userWithRole.role.isActive,
      },
      permissions,
      modules: Array.from(modulesMap.values()),
    };
  }
}
