import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { RolePermission } from './entities/role-permission.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('role-permission')
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  async create(
    @Body() createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<ApiResponse<RolePermission>> {
    try {
      const rolePermission = await this.rolePermissionsService.create(
        createRolePermissionDto,
      );
      return this.responseService.success(
        Messages.ROLE_PERMISSION.CREATED,
        rolePermission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('roleId') roleId?: number,
    @Query('permissionId') permissionId?: number,
  ): Promise<ApiResponse<ApiData<RolePermission[]>>> {
    try {
      const filter = { roleId, permissionId };
      const [rolePermissions, total] =
        await this.rolePermissionsService.findAll(page, limit, filter);
      return this.responseService.successWithPagination(
        Messages.ROLE_PERMISSION.LIST_RETRIEVED,
        rolePermissions,
        total,
        page,
        limit,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<RolePermission>> {
    try {
      const rolePermission = await this.rolePermissionsService.findOne(id);
      return this.responseService.success(
        Messages.ROLE_PERMISSION.RETRIEVED,
        rolePermission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  async update(
    @Param('id') id: number,
    updateRolePermissionDto: UpdateRolePermissionDto,
  ): Promise<ApiResponse<RolePermission>> {
    try {
      const rolePermission = await this.rolePermissionsService.update(
        id,
        updateRolePermissionDto,
      );
      return this.responseService.success(
        Messages.ROLE_PERMISSION.UPDATED,
        rolePermission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.rolePermissionsService.remove(id);
      return this.responseService.success(
        Messages.ROLE_PERMISSION.DELETED,
        null,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
