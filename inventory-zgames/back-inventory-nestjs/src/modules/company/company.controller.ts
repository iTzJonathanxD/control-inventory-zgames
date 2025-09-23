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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { Company } from './entities/company.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  async create(@Body() dto: CreateCompanyDto): Promise<ApiResponse<Company>> {
    try {
      const company = await this.companyService.create(dto);
      return this.responseService.success(Messages.COMPANY.CREATED, company);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('companyName') companyName?: string,
  ): Promise<ApiResponse<ApiData<Company[]>>> {
    try {
      const [companies, total] = await this.companyService.findAll(
        page,
        limit,
        companyName,
      );
      return this.responseService.successWithPagination(
        Messages.COMPANY.LIST_RETRIEVED,
        companies,
        total,
        limit,
        page,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Company>> {
    try {
      const company = await this.companyService.findOne(id);
      return this.responseService.success(Messages.COMPANY.RETRIEVED, company);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateCompanyDto,
  ): Promise<ApiResponse<Company>> {
    try {
      const company = await this.companyService.update(id, dto);
      return this.responseService.success(Messages.COMPANY.UPDATED, company);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('toggle-status/:id')
  async toggleStatus(@Param('id') id: number): Promise<ApiResponse<Company>> {
    try {
      const company = await this.companyService.toggleStatus(id);
      return this.responseService.success(
        Messages.COMPANY.STATUS_UPDATED,
        company,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<null>> {
    try {
      await this.companyService.remove(id);
      return this.responseService.success(Messages.COMPANY.DELETED, null);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
