import { Injectable, NotFoundException } from '@nestjs/common';
import { type DataSource, Repository, Like } from 'typeorm';
import { Module } from './entities/module.entity';
import { RolePermission } from '../role-permissions/entities/role-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class ModulesRepository {
  constructor(
    @InjectRepository(Module)
    private readonly repository: Repository<Module>,
  ) {
    this.repository = repository;
  }
  async createModule(createModuleDto: Partial<Module>): Promise<Module> {
    const module = this.repository.create(createModuleDto);
    return this.repository.save(module);
  }
  async findAllModules(
    page: number,
    limit: number,
    filter: { moduleName?: string },
  ): Promise<[Module[], number]> {
    const where: any = {};
    if (filter.moduleName) where.moduleName = Like(`%${filter.moduleName}%`);
    return this.repository.findAndCount({
      where,
      relations: ['permissions'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  async findModuleById(id: number): Promise<Module> {
    const module = await this.repository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!module) throw new NotFoundException(`Module with ID ${id} not found`);
    return module;
  }
  async updateModule(
    id: number,
    updateModuleDto: Partial<Module>,
  ): Promise<Module> {
    const module = await this.findModuleById(id);
    Object.assign(module, updateModuleDto);
    return this.repository.save(module);
  }
  async getModulesByRole(roleId: number): Promise<Module[]> {
    const queryBuilder = this.repository.createQueryBuilder('module')
      .leftJoinAndSelect('module.permissions', 'permission')
      .leftJoinAndSelect(
        'permission.rolePermissions',
        'rolePermission',
        'rolePermission.roleId = :roleId',
        { roleId },
      )
      .where('module.isActive = :isActive', { isActive: true })
      .orderBy('module.moduleName', 'ASC');
    const modules = await queryBuilder.getMany();
    return modules.map((module) => ({
      ...module,
      isActiveForRole: module.permissions.some((permission) =>
        permission.rolePermissions.some((rp) => rp.isActiveForRole),
      ),
      permissions: module.permissions.map((permission) => ({
        ...permission,
        isActiveForRole:
          permission.rolePermissions.length > 0
            ? permission.rolePermissions[0].isActiveForRole
            : false,
      })),
    }));
  }
  async toggleModuleStatusForRole(
    roleId: number,
    moduleId: number,
  ): Promise<Module> {
    const rolePermissionRepo = this.repository.manager.getRepository(RolePermission);
    const module = await this.repository.findOne({
      where: { id: moduleId },
      relations: ['permissions'],
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    const rolePermissions = await rolePermissionRepo.find({
      where: {
        roleId,
        permission: { moduleId },
      },
    });
    const hasActivePermissions = rolePermissions.some(
      (rp) => rp.isActiveForRole,
    );
    const newStatus = !hasActivePermissions;
    for (const permission of module.permissions) {
      let rolePermission = await rolePermissionRepo.findOne({
        where: { roleId, permissionId: permission.id },
      });
      if (rolePermission) {
        rolePermission.isActiveForRole = newStatus;
        await rolePermissionRepo.save(rolePermission);
      } else {
        rolePermission = rolePermissionRepo.create({
          roleId,
          permissionId: permission.id,
          isActiveForRole: newStatus,
        });
        await rolePermissionRepo.save(rolePermission);
      }
    }
    return {
      ...module,
      isActiveForRole: newStatus,
    } as Module;
  }
}
