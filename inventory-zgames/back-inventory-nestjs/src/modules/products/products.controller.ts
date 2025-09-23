import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductsDto } from './dto/create-products.dto';
import { UpdateProductsDto } from './dto/update-products.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { Product } from './entities/products.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
import { FileUploadService } from '../../common/services/file-upload.service';
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly responseService: ResponseService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductsDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<ApiResponse<Product>> {
    try {
      if (file) {
        const imageUrl = await this.fileUploadService.saveProductImage(file);
        createProductDto.image = imageUrl;
      }
      const product = await this.productsService.create(
        createProductDto,
        user.id,
      );
      return this.responseService.success(Messages.PRODUCT.CREATED, product);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('productName') productName?: string,
    @Query('codeName') codeName?: string,
    @Query('categoryId') categoryId?: number,
    @Query('isActive') isActive?: string,
    @Query('lowStock') lowStock?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
  ): Promise<ApiResponse<ApiData<Product[]>>> {
    try {
      const filters = {
        productName,
        codeName,
        categoryId: categoryId ? Number(categoryId) : undefined,
        isActive: isActive ? isActive === 'true' : undefined,
        lowStock: lowStock ? lowStock === 'true' : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minStock: minStock ? Number(minStock) : undefined,
        maxStock: maxStock ? Number(maxStock) : undefined,
      };
      const [products, total] = await this.productsService.findAll(
        page,
        limit,
        filters,
      );
      return this.responseService.successWithPagination(
        Messages.PRODUCT.LIST_RETRIEVED,
        products,
        total,
        limit,
        page,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('dashboard-stats')
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.productsService.getDashboardStats();
      return this.responseService.success('Dashboard stats retrieved', stats);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('low-stock')
  async findLowStock(): Promise<ApiResponse<Product[]>> {
    try {
      const products = await this.productsService.findLowStockProducts();
      return this.responseService.success(
        Messages.PRODUCT.LOW_STOCK_RETRIEVED,
        products,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('best-selling')
  async getBestSellingProducts(
    @Query('limit') limit = 10,
  ): Promise<ApiResponse<any[]>> {
    try {
      const products = await this.productsService.getBestSellingProducts(
        Number(limit),
      );
      return this.responseService.success(
        'Best selling products retrieved',
        products,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('monthly-sales')
  async getMonthlySales(): Promise<ApiResponse<any[]>> {
    try {
      const sales = await this.productsService.getMonthlySalesData();
      return this.responseService.success(
        'Monthly sales data retrieved',
        sales,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productsService.findOne(id);
      return this.responseService.success(Messages.PRODUCT.RETRIEVED, product);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductsDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<ApiResponse<Product>> {
    try {
      if (file) {
        const imageUrl = await this.fileUploadService.saveProductImage(
          file,
          id,
        );
        updateProductDto.image = imageUrl;
      }
      const product = await this.productsService.update(
        id,
        updateProductDto,
        user.id,
      );
      return this.responseService.success(Messages.PRODUCT.UPDATED, product);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('toggle-status/:id')
  async toggleStatus(@Param('id') id: number): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productsService.toggleStatus(id);
      return this.responseService.success(
        Messages.PRODUCT.STATUS_UPDATED,
        product,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<null>> {
    try {
      await this.productsService.remove(id);
      return this.responseService.success(Messages.PRODUCT.DELETED, null);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Post(':id/stock-movement')
  async createStockMovement(
    @Param('id') productId: number,
    movementData: {
      movementType: 'entry' | 'exit' | 'adjustment';
      quantity: number;
      reason: string;
      provider?: string;
      unitCost?: number;
    },
    @GetUser() user: User,
  ): Promise<ApiResponse<null>> {
    try {
      await this.productsService.createStockMovement(
        productId,
        movementData.movementType as any,
        movementData.quantity,
        movementData.reason,
        movementData.provider,
        movementData.unitCost,
        user.id,
      );
      return this.responseService.success(
        Messages.PRODUCT.STOCK_MOVEMENT_CREATED,
        null,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      if (!file) {
        return this.responseService.error('No file uploaded', null);
      }
      const imageUrl = await this.fileUploadService.saveProductImage(file);
      return this.responseService.success('Image uploaded successfully', {
        imageUrl,
      });
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
