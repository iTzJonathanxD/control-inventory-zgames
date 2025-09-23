import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { Permission } from './entities/permission.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('permission')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    try {
      const permission =
        await this.permissionsService.create(createPermissionDto);
      return this.responseService.success(
        Messages.PERMISSION.CREATED,
        permission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('permissionName') permissionName?: string,
  ): Promise<ApiResponse<ApiData<Permission[]>>> {
    try {
      const filter = { permissionName };
      const [permissions, total] = await this.permissionsService.findAll(
        page,
        limit,
        filter,
      );
      return this.responseService.successWithPagination(
        Messages.PERMISSION.LIST_RETRIEVED,
        permissions,
        total,
        page,
        limit,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionsService.findOne(id);
      return this.responseService.success(
        Messages.PERMISSION.RETRIEVED,
        permission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':roleId/modules/:moduleId/permissions')
  async getPermissionsByRoleAndModule(
    @Param('roleId') roleId: number,
    @Param('moduleId') moduleId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('permissionName') permissionName?: string,
  ): Promise<ApiResponse<ApiData<Permission[]>>> {
    try {
      const [permissions, total] =
        await this.permissionsService.getPermissionsByRoleAndModule(
          roleId,
          moduleId,
          page,
          limit,
          permissionName,
        );
      return this.responseService.successWithPagination(
        Messages.PERMISSION.LIST_RETRIEVED,
        permissions,
        total,
        page,
        limit,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  async update(
    @Param('id') id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionsService.update(
        id,
        updatePermissionDto,
      );
      return this.responseService.success(
        Messages.PERMISSION.UPDATED,
        permission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch(':roleId/permissions/:permissionId/status')
  async togglePermissionStatus(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ): Promise<ApiResponse<Permission>> {
    try {
      const permission =
        await this.permissionsService.togglePermissionStatusForRole(
          roleId,
          permissionId,
        );
      return this.responseService.success(
        Messages.PERMISSION.STATUS_UPDATED,
        permission,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
