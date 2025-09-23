import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { Role } from './entities/role.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('role')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.create(createRoleDto);
      return this.responseService.success(Messages.ROLE.CREATED, role);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('roleName') roleName?: string,
  ): Promise<ApiResponse<ApiData<Role[]>>> {
    try {
      const filter = { roleName };
      const [roles, total] = await this.rolesService.findAll(
        page,
        limit,
        filter,
      );
      return this.responseService.successWithPagination(
        Messages.ROLE.LIST_RETRIEVED,
        roles,
        total,
        page,
        limit,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.findOne(id);
      return this.responseService.success(Messages.ROLE.RETRIEVED, role);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  async update(
    @Param('id') id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.update(id, updateRoleDto);
      return this.responseService.success(Messages.ROLE.UPDATED, role);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('toggle-status/:id')
  async toggleRoleStatus(@Param('id') id: number): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.toggleRoleStatus(id);
      return this.responseService.success(Messages.ROLE.STATUS_UPDATED, role);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
