import { Injectable } from "@nestjs/common"
import { CreateRoleDto } from "./dto/create-role.dto"
import { UpdateRoleDto } from "./dto/update-role.dto"
import { RolesRepository } from "./roles.repository"
@Injectable()
export class RolesService {
  constructor(
    private rolesRepository: RolesRepository) {}
  create(createRoleDto: CreateRoleDto) {
    return this.rolesRepository.createRole(createRoleDto)
  }
  findAll(page: number, limit: number, filter: any) {
    return this.rolesRepository.findAllRoles(page, limit, filter)
  }
  findOne(id: number) {
    return this.rolesRepository.findRoleById(id)
  }
  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.rolesRepository.updateRole(id, updateRoleDto)
  }
  toggleRoleStatus(id: number) {
    return this.rolesRepository.toggleRoleStatus(id)
  }
}
