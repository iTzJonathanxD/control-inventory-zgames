import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InventoryMovementsService } from './inventory-movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
@Controller('inventory-movements')
@UseGuards(JwtAuthGuard)
export class InventoryMovementsController {
  constructor(
    private readonly movementsService: InventoryMovementsService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() createMovementDto: CreateMovementDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<InventoryMovement>> {
    try {
      console.log('Received DTO:', createMovementDto);
      console.log('User:', user);
      const movement = await this.movementsService.create(
        createMovementDto,
        user.id,
      );
      return this.responseService.success(
        Messages.INVENTORY_MOVEMENT.CREATED,
        movement,
      );
    } catch (error) {
      console.error('Error creating movement:', error);
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('productId') productId?: string,
    @Query('movementType') movementType?: MovementType,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse<ApiData<InventoryMovement[]>>> {
    try {
      const pageNum = Number.parseInt(page) || 1;
      const limitNum = Number.parseInt(limit) || 10;
      const productIdNum = productId ? Number.parseInt(productId) : undefined;
      const userIdNum = userId ? Number.parseInt(userId) : undefined;
      if (movementType && !Object.values(MovementType).includes(movementType)) {
        movementType = undefined;
      }
      const [movements, total] = await this.movementsService.findAll(
        pageNum,
        limitNum,
        productIdNum,
        movementType,
        startDate,
        endDate,
        userIdNum,
      );
      return this.responseService.successWithPagination(
        Messages.INVENTORY_MOVEMENT.LIST_RETRIEVED,
        movements,
        total,
        limitNum,
        pageNum,
      );
    } catch (error) {
      console.error('Error retrieving movements:', error);
      return this.responseService.error(error.message, null);
    }
  }
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const stats = await this.movementsService.getMovementStats(
        startDate,
        endDate,
      );
      return this.responseService.success(
        Messages.INVENTORY_MOVEMENT.STATS_RETRIEVED,
        stats,
      );
    } catch (error) {
      console.error('Error retrieving stats:', error);
      return this.responseService.error(error.message, null);
    }
  }
  @Get('product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<ApiResponse<ApiData<InventoryMovement[]>>> {
    try {
      const productIdNum = Number.parseInt(productId);
      const pageNum = Number.parseInt(page) || 1;
      const limitNum = Number.parseInt(limit) || 10;
      const [movements, total] = await this.movementsService.findByProduct(
        productIdNum,
        pageNum,
        limitNum,
      );
      return this.responseService.successWithPagination(
        Messages.INVENTORY_MOVEMENT.PRODUCT_MOVEMENTS_RETRIEVED,
        movements,
        total,
        limitNum,
        pageNum,
      );
    } catch (error) {
      console.error('Error retrieving product movements:', error);
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<InventoryMovement>> {
    try {
      const idNum = Number.parseInt(id);
      const movement = await this.movementsService.findOne(idNum);
      return this.responseService.success(
        Messages.INVENTORY_MOVEMENT.RETRIEVED,
        movement,
      );
    } catch (error) {
      console.error('Error retrieving movement:', error);
      return this.responseService.error(error.message, null);
    }
  }
  @Put('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Body() updateMovementDto: UpdateMovementDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<InventoryMovement>> {
    try {
      const idNum = Number.parseInt(id);
      const movement = await this.movementsService.update(
        idNum,
        updateMovementDto,
        user.id,
      );
      return this.responseService.success(
        Messages.INVENTORY_MOVEMENT.UPDATED,
        movement,
      );
    } catch (error) {
      console.error('Error updating movement:', error);
      return this.responseService.error(error.message, null);
    }
  }
}
