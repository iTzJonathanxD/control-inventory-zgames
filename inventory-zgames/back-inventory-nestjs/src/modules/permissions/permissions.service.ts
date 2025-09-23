import { Injectable } from "@nestjs/common"
import { CreatePermissionDto } from "./dto/create-permission.dto"
import { UpdatePermissionDto } from "./dto/update-permission.dto"
import { PermissionsRepository } from "./permissions.repository"
@Injectable()
export class PermissionsService {
  constructor(private permissionsRepository: PermissionsRepository) {}
  create(createPermissionDto: CreatePermissionDto) {
    return this.permissionsRepository.createPermission(createPermissionDto)
  }
  findAll(page: number, limit: number, filter: any) {
    return this.permissionsRepository.findAllPermissions(page, limit, filter)
  }
  findOne(id: number) {
    return this.permissionsRepository.findPermissionById(id)
  }
  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsRepository.updatePermission(id, updatePermissionDto)
  }
  getPermissionsByRoleAndModule(
    roleId: number,
    moduleId: number,
    page: number,
    limit: number,
    permissionName?: string,
  ) {
    return this.permissionsRepository.getPermissionsByRoleAndModule(roleId, moduleId, page, limit, permissionName)
  }
  togglePermissionStatusForRole(roleId: number, permissionId: number) {
    return this.permissionsRepository.togglePermissionStatusForRole(roleId, permissionId)
  }
}
