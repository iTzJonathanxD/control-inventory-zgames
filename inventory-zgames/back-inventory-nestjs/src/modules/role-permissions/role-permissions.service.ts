import { Injectable } from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { RolePermissionsRepository } from './role-permissions.repository';
@Injectable()
export class RolePermissionsService {
  constructor(
    private readonly rolePermissionsRepository: RolePermissionsRepository,
  ) {}
  create(createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionsRepository.createRolePermission(
      createRolePermissionDto,
    );
  }
  findAll(page: number, limit: number, filter: any) {
    return this.rolePermissionsRepository.findAllRolePermissions(
      page,
      limit,
      filter,
    );
  }
  findOne(id: number) {
    return this.rolePermissionsRepository.findRolePermissionById(id);
  }
  update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    return this.rolePermissionsRepository.updateRolePermission(
      id,
      updateRolePermissionDto,
    );
  }
  remove(id: number) {
    return this.rolePermissionsRepository.deleteRolePermission(id);
  }
  async getUserPermissions(userId: number) {
    return this.rolePermissionsRepository.getUserPermissions(userId);
  }
  async getUserModulesAndPermissions(userId: number) {
    return this.rolePermissionsRepository.getUserModulesAndPermissions(userId);
  }
  async getUserRolePermissions(userId: number) {
    return this.rolePermissionsRepository.getUserRolePermissions(userId);
  }
}
