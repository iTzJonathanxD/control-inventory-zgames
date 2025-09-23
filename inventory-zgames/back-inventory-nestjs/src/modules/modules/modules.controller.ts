import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { Module } from './entities/module.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('module')
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  async create(
    @Body() createModuleDto: CreateModuleDto,
  ): Promise<ApiResponse<Module>> {
    try {
      const module = await this.modulesService.create(createModuleDto);
      return this.responseService.success(Messages.MODULE.CREATED, module);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('moduleName') moduleName?: string,
  ): Promise<ApiResponse<ApiData<Module[]>>> {
    try {
      const filter = { moduleName };
      const [modules, total] = await this.modulesService.findAll(
        page,
        limit,
        filter,
      );
      return this.responseService.successWithPagination(
        Messages.MODULE.LIST_RETRIEVED,
        modules,
        total,
        page,
        limit,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Module>> {
    try {
      const module = await this.modulesService.findOne(id);
      return this.responseService.success(Messages.MODULE.RETRIEVED, module);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':roleId/modules')
  async getModulesByRole(
    @Param('roleId') roleId: number,
  ): Promise<ApiResponse<ApiData<Module[]>>> {
    try {
      const modules = await this.modulesService.getModulesByRole(roleId);
      return this.responseService.successWithPagination(
        Messages.MODULE.LIST_RETRIEVED,
        modules,
        modules.length,
        1,
        modules.length,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  async update(
    @Param('id') id: number,
    updateModuleDto: UpdateModuleDto,
  ): Promise<ApiResponse<Module>> {
    try {
      const module = await this.modulesService.update(id, updateModuleDto);
      return this.responseService.success(Messages.MODULE.UPDATED, module);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update-status/:roleId/:moduleId')
  async toggleModuleStatus(
    @Param('roleId') roleId: number,
    @Param('moduleId') moduleId: number,
  ): Promise<ApiResponse<Module>> {
    try {
      const module = await this.modulesService.toggleModuleStatusForRole(
        roleId,
        moduleId,
      );
      return this.responseService.success(
        Messages.MODULE.STATUS_UPDATED,
        module,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
