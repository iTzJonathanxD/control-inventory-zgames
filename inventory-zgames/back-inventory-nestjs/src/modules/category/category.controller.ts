import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { Category } from './entities/category.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    try {
      const category = await this.categoryService.create(createCategoryDto);
      return this.responseService.success(Messages.CATEGORY.CREATED, category);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-active')
  async getActive(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryName') categoryName?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ApiResponse<ApiData<Category[]>>> {
    try {
      const [categories, total] = await this.categoryService.findAllActives(
        page,
        limit,
        categoryName,
      );
      return this.responseService.successWithPagination(
        'Categorías activas obtenidas',
        categories,
        total,
        limit,
        page,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryName') categoryName?: string,
    @Query('isActive') isActive?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<ApiResponse<ApiData<Category[]>>> {
    try {
      const isActiveBool =
        isActive !== undefined ? isActive === 'true' : undefined;
      const [categories, total] = await this.categoryService.findAll(
        page,
        limit,
        categoryName,
        isActiveBool,
        fromDate,
        toDate,
      );
      return this.responseService.successWithPagination(
        Messages.CATEGORY.LIST_RETRIEVED,
        categories,
        total,
        limit,
        page,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Category>> {
    try {
      const category = await this.categoryService.findOne(id);
      return this.responseService.success(
        Messages.CATEGORY.RETRIEVED,
        category,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    try {
      const category = await this.categoryService.update(id, updateCategoryDto);
      return this.responseService.success(Messages.CATEGORY.UPDATED, category);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('toggle-status/:id')
  async toggleStatus(@Param('id') id: number): Promise<ApiResponse<Category>> {
    try {
      const category = await this.categoryService.toggleStatus(id);
      return this.responseService.success(
        Messages.CATEGORY.STATUS_UPDATED,
        category,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Delete('delete/:id')
  async remove(@Param('id') id: number): Promise<ApiResponse<null>> {
    try {
      await this.categoryService.remove(id);
      return this.responseService.success(Messages.CATEGORY.DELETED, null);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
