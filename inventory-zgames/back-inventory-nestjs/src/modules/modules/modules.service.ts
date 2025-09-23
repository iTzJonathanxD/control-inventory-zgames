import { Injectable } from "@nestjs/common"
import { CreateModuleDto } from "./dto/create-module.dto"
import { UpdateModuleDto } from "./dto/update-module.dto"
import { ModulesRepository } from "./modules.repository"
@Injectable()
export class ModulesService {
  constructor(private modulesRepository: ModulesRepository) {}
  create(createModuleDto: CreateModuleDto) {
    return this.modulesRepository.createModule(createModuleDto)
  }
  findAll(page: number, limit: number, filter: any) {
    return this.modulesRepository.findAllModules(page, limit, filter)
  }
  findOne(id: number) {
    return this.modulesRepository.findModuleById(id)
  }
  update(id: number, updateModuleDto: UpdateModuleDto) {
    return this.modulesRepository.updateModule(id, updateModuleDto)
  }
  getModulesByRole(roleId: number) {
    return this.modulesRepository.getModulesByRole(roleId)
  }
  toggleModuleStatusForRole(roleId: number, moduleId: number) {
    return this.modulesRepository.toggleModuleStatusForRole(roleId, moduleId)
  }
}
