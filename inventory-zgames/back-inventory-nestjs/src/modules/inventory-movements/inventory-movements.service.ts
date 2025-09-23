import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InventoryMovementsRepository } from './inventory-movements.repository';
import { ProductsService } from '../products/products.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';
@Injectable()
export class InventoryMovementsService {
  private readonly logger = new Logger(InventoryMovementsService.name);
  constructor(
    private movementsRepository: InventoryMovementsRepository,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
  ) {}
  async create(
    createMovementDto: CreateMovementDto,
    userId: number,
  ): Promise<InventoryMovement> {
    try {
      const product = await this.productsService.findOne(
        createMovementDto.productId,
      );
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createMovementDto.productId} not found`,
        );
      }
      const previousStock = product.stockCurrent;
      let newStock: number;
      switch (createMovementDto.movementType) {
        case MovementType.ENTRY:
          newStock = previousStock + createMovementDto.quantity;
          break;
        case MovementType.EXIT:
          if (previousStock < createMovementDto.quantity) {
            throw new BadRequestException(
              `Insufficient stock for this operation. Available: ${previousStock}, Requested: ${createMovementDto.quantity}`,
            );
          }
          newStock = previousStock - createMovementDto.quantity;
          break;
        case MovementType.ADJUSTMENT:
          newStock = createMovementDto.quantity;
          break;
        default:
          throw new BadRequestException('Invalid movement type');
      }
      const movement = this.movementsRepository.create({
        ...createMovementDto,
        userId,
        previousStock,
        newStock,
        totalCost: createMovementDto.unitCost
          ? createMovementDto.unitCost * createMovementDto.quantity
          : null,
      });
      const savedMovement = await this.movementsRepository.save(movement);
      await this.productsService.updateStock(
        createMovementDto.productId,
        newStock,
      );
      this.logger.log(
        `Movement created successfully with ID ${savedMovement.id}`,
      );
      return savedMovement;
    } catch (error) {
      this.logger.error(
        `Error creating movement: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async findAll(
    page: number,
    limit: number,
    productId?: number,
    movementType?: MovementType,
    startDate?: string,
    endDate?: string,
    userId?: number,
  ): Promise<[InventoryMovement[], number]> {
    try {
      const filter: any = {};
      if (productId) filter.productId = productId;
      if (movementType) filter.movementType = movementType;
      if (userId) filter.userId = userId;
      if (startDate) filter.fromDate = startDate;
      if (endDate) filter.toDate = endDate;
      return this.movementsRepository.findAll({
        page,
        limit,
        filter,
      });
    } catch (error) {
      this.logger.error(
        `Error finding movements: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async findOne(id: number): Promise<InventoryMovement> {
    try {
      const movement = await this.movementsRepository.findOne(id);
      if (!movement) {
        throw new NotFoundException(`Movement with ID ${id} not found`);
      }
      return movement;
    } catch (error) {
      this.logger.error(
        `Error finding movement ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async findByProduct(
    productId: number,
    page: number,
    limit: number,
  ): Promise<[InventoryMovement[], number]> {
    try {
      return this.movementsRepository.findByProduct(productId, {
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `Error finding movements for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async getMovementStats(startDate?: string, endDate?: string) {
    try {
      const where: any = {};
      if (startDate && endDate) {
        const [movements] = await this.movementsRepository.findByDateRange(
          new Date(startDate),
          new Date(endDate),
        );
        return this.calculateStats(movements);
      }
      const [movements] = await this.movementsRepository.findAll();
      return this.calculateStats(movements);
    } catch (error) {
      this.logger.error(
        `Error getting movement stats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  private calculateStats(movements: InventoryMovement[]) {
    const stats = {
      totalMovements: movements.length,
      entries: movements.filter((m) => m.movementType === MovementType.ENTRY)
        .length,
      exits: movements.filter((m) => m.movementType === MovementType.EXIT)
        .length,
      adjustments: movements.filter(
        (m) => m.movementType === MovementType.ADJUSTMENT,
      ).length,
      totalValue: movements.reduce((sum, m) => sum + (m.totalCost || 0), 0),
    };
    return stats;
  }
  async update(
    id: number,
    updateMovementDto: UpdateMovementDto,
    userId: number,
  ): Promise<InventoryMovement> {
    try {
      if (!updateMovementDto) {
        throw new BadRequestException('Request body is required');
      }
      this.logger.log(`Updating movement with ID ${id}`);
      const existingMovement = await this.movementsRepository.findOne(id);
      if (!existingMovement) {
        throw new NotFoundException(`Movement with ID ${id} not found`);
      }
      const needsStockRecalculation =
        updateMovementDto.productId !== undefined ||
        updateMovementDto.quantity !== undefined ||
        updateMovementDto.movementType !== undefined;
      let newStock: number = existingMovement.newStock;
      let product = existingMovement.product;
      if (needsStockRecalculation) {
        if (
          updateMovementDto.productId &&
          updateMovementDto.productId !== existingMovement.productId
        ) {
          product = await this.productsService.findOne(
            updateMovementDto.productId,
          );
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${updateMovementDto.productId} not found`,
            );
          }
        }
        await this.productsService.updateStock(
          existingMovement.productId,
          existingMovement.previousStock,
        );
        const currentProductId =
          updateMovementDto.productId || existingMovement.productId;
        const currentQuantity =
          updateMovementDto.quantity || existingMovement.quantity;
        const currentMovementType =
          updateMovementDto.movementType || existingMovement.movementType;
        const currentProduct =
          await this.productsService.findOne(currentProductId);
        const currentStock = currentProduct.stockCurrent;
        switch (currentMovementType) {
          case MovementType.ENTRY:
            newStock = currentStock + currentQuantity;
            break;
          case MovementType.EXIT:
            if (currentStock < currentQuantity) {
              await this.productsService.updateStock(
                existingMovement.productId,
                existingMovement.newStock,
              );
              throw new BadRequestException(
                `Insufficient stock for this operation. Available: ${currentStock}, Requested: ${currentQuantity}`,
              );
            }
            newStock = currentStock - currentQuantity;
            break;
          case MovementType.ADJUSTMENT:
            newStock = currentQuantity;
            break;
          default:
            throw new BadRequestException('Invalid movement type');
        }
        await this.productsService.updateStock(currentProductId, newStock);
      }
      const updatedData = {
        ...updateMovementDto,
        userId,
        newStock,
        totalCost: updateMovementDto.unitCost
          ? updateMovementDto.unitCost *
            (updateMovementDto.quantity || existingMovement.quantity)
          : updateMovementDto.unitCost !== undefined
            ? null
            : existingMovement.totalCost,
      };
      const updatedMovement = await this.movementsRepository.update(
        id,
        updatedData,
      );
      this.logger.log(`Movement updated successfully with ID ${id}`);
      return updatedMovement;
    } catch (error) {
      this.logger.error(
        `Error updating movement ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
