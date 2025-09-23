import { Injectable, NotFoundException } from '@nestjs/common';
import { type DataSource, Repository, Like } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Module } from '../modules/entities/module.entity';
import { RolePermission } from '../role-permissions/entities/role-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {
    this.repository = repository;
  }
  async createPermission(
    createPermissionDto: Partial<Permission>,
  ): Promise<Permission> {
    const permission = this.repository.create(createPermissionDto);
    if (createPermissionDto.moduleId) {
      const module = await this.repository.manager
        .getRepository(Module)
        .findOneBy({ id: createPermissionDto.moduleId });
      if (!module)
        throw new NotFoundException(
          `Module with ID ${createPermissionDto.moduleId} not found`,
        );
      permission.module = module;
    }
    return this.repository.save(permission);
  }
  async findAllPermissions(
    page: number,
    limit: number,
    filter: { permissionName?: string },
  ): Promise<[Permission[], number]> {
    const where: any = {};
    if (filter.permissionName)
      where.permissionName = Like(`%${filter.permissionName}%`);
    return this.repository.findAndCount({
      where,
      relations: ['module', 'rolePermissions'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  async findPermissionById(id: number): Promise<Permission> {
    const permission = await this.repository.findOne({
      where: { id },
      relations: ['module', 'rolePermissions'],
    });
    if (!permission)
      throw new NotFoundException(`Permission with ID ${id} not found`);
    return permission;
  }
  async updatePermission(
    id: number,
    updatePermissionDto: Partial<Permission>,
  ): Promise<Permission> {
    const permission = await this.findPermissionById(id);
    Object.assign(permission, updatePermissionDto);
    if (updatePermissionDto.moduleId) {
      const module = await this.repository.manager
        .getRepository(Module)
        .findOneBy({ id: updatePermissionDto.moduleId });
      if (!module)
        throw new NotFoundException(
          `Module with ID ${updatePermissionDto.moduleId} not found`,
        );
      permission.module = module;
      permission.moduleId = module.id;
    }
    return this.repository.save(permission);
  }
  async getPermissionsByRoleAndModule(
    roleId: number,
    moduleId: number,
    page: number,
    limit: number,
    permissionName?: string,
  ): Promise<[Permission[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.module', 'module')
      .leftJoinAndSelect(
        'permission.rolePermissions',
        'rolePermission',
        'rolePermission.roleId = :roleId',
        { roleId },
      )
      .where('permission.moduleId = :moduleId', { moduleId })
      .andWhere('permission.isActive = :isActive', { isActive: true });
    if (permissionName) {
      queryBuilder.andWhere('permission.permissionName LIKE :permissionName', {
        permissionName: `%${permissionName}%`,
      });
    }
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('permission.permissionName', 'ASC');
    const [permissions, total] = await queryBuilder.getManyAndCount();
    const mappedPermissions = permissions.map((permission) => ({
      ...permission,
      isActiveForRole:
        permission.rolePermissions.length > 0
          ? permission.rolePermissions[0].isActiveForRole
          : false,
    }));
    return [mappedPermissions, total];
  }
  async togglePermissionStatusForRole(
    roleId: number,
    permissionId: number,
  ): Promise<Permission> {
    const rolePermissionRepo =
      this.repository.manager.getRepository(RolePermission);
    let rolePermission = await rolePermissionRepo.findOne({
      where: { roleId, permissionId },
      relations: ['permission', 'permission.module'],
    });
    if (rolePermission) {
      rolePermission.isActiveForRole = !rolePermission.isActiveForRole;
      await rolePermissionRepo.save(rolePermission);
    } else {
      rolePermission = rolePermissionRepo.create({
        roleId,
        permissionId,
        isActiveForRole: true,
      });
      await rolePermissionRepo.save(rolePermission);
      rolePermission = await rolePermissionRepo.findOne({
        where: { roleId, permissionId },
        relations: ['permission', 'permission.module'],
      });
    }
    const permission = rolePermission.permission;
    return {
      ...permission,
      isActiveForRole: rolePermission.isActiveForRole,
    } as Permission;
  }
  async createRolePermissionsForNewRole(roleId: number): Promise<void> {
    const rolePermissionRepo =
      this.repository.manager.getRepository(RolePermission);
    const permissions = await this.repository.find({
      where: { isActive: true },
    });
    const rolePermissions = permissions.map((permission) =>
      rolePermissionRepo.create({
        roleId,
        permissionId: permission.id,
        isActiveForRole: false,
      }),
    );
    await rolePermissionRepo.save(rolePermissions);
  }
}
