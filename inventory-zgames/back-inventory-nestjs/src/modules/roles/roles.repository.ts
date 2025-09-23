import { Injectable, NotFoundException } from "@nestjs/common"
import { type DataSource, Repository, Like } from "typeorm"
import { Role } from "./entities/role.entity"
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {
    this.repository = repository;
  }
  async createRole(createRoleDto: Partial<Role>): Promise<Role> {
    const role = this.repository.create(createRoleDto);
    const savedRole = await this.repository.save(role);
    await this.createRolePermissionsForNewRole(savedRole.id);
    return savedRole;
  }
  async findAllRoles(
    page: number,
    limit: number,
    filter: { roleName?: string },
  ): Promise<[Role[], number]> {
    const where: any = {};
    if (filter.roleName) where.roleName = Like(`%${filter.roleName}%`);
    return this.repository.findAndCount({
      where,
      relations: ['users', 'rolePermissions'],
      skip: (page - 1) * limit,
      take: limit,
      order: { roleName: 'ASC' },
    });
  }
  async findRoleById(id: number): Promise<Role> {
    const role = await this.repository.findOne({
      where: { id },
      relations: ['users', 'rolePermissions'],
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }
  async updateRole(id: number, updateRoleDto: Partial<Role>): Promise<Role> {
    const role = await this.findRoleById(id);
    Object.assign(role, updateRoleDto);
    return this.repository.save(role);
  }
  async toggleRoleStatus(id: number): Promise<Role> {
    const role = await this.findRoleById(id);
    role.isActive = !role.isActive;
    return this.repository.save(role);
  }
  private async createRolePermissionsForNewRole(roleId: number): Promise<void> {
    const permissionsRepo = this.repository.manager.getRepository('Permission');
    const rolePermissionRepo = this.repository.manager.getRepository('RolePermission');
    const permissions = await permissionsRepo.find({
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
