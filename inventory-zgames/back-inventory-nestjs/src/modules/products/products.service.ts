import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { CreateProductsDto } from './dto/create-products.dto';
import { UpdateProductsDto } from './dto/update-products.dto';
import { Product } from './entities/products.entity';
import { MovementType } from '../inventory-movements/entities/inventory-movement.entity';
@Injectable()
export class ProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    private inventoryMovementsService: InventoryMovementsService,
  ) {}
  async create(
    createProductDto: CreateProductsDto,
    userId?: number,
  ): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    const savedProduct = await this.productsRepository.save(product);
    if (createProductDto.stockCurrent && createProductDto.stockCurrent > 0) {
      try {
        await this.inventoryMovementsService.create(
          {
            movementType: MovementType.ENTRY,
            quantity: createProductDto.stockCurrent,
            productId: savedProduct.id,
            reason: 'Stock inicial del producto',
            unitCost: createProductDto.unitPrice || null,
          },
          userId || 1,
        );
      } catch (error) {
        console.error('Error creating initial inventory movement:', error);
      }
    }
    return savedProduct;
  }
  async findAll(
    page: number,
    limit: number,
    filters?: {
      productName?: string;
      codeName?: string;
      categoryId?: number;
      isActive?: boolean;
      lowStock?: boolean;
      minPrice?: number;
      maxPrice?: number;
      minStock?: number;
      maxStock?: number;
    },
  ): Promise<[Product[], number]> {
    return this.productsRepository.findAll({
      page,
      limit,
      filters,
    });
  }
  async getDashboardStats(): Promise<any> {
    const stats = await this.productsRepository.getDashboardStats();
    return stats;
  }
  async getBestSellingProducts(limit = 10): Promise<any[]> {
    return this.productsRepository.getBestSellingProducts(limit);
  }
  async getMonthlySalesData(): Promise<any[]> {
    return this.productsRepository.getMonthlySalesData();
  }
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
  async update(
    id: number,
    updateProductDto: UpdateProductsDto,
    userId?: number,
  ): Promise<Product> {
    const existingProduct = await this.findOne(id);
    if (
      updateProductDto.stockCurrent !== undefined &&
      updateProductDto.stockCurrent !== existingProduct.stockCurrent
    ) {
      const stockDifference =
        updateProductDto.stockCurrent - existingProduct.stockCurrent;
      if (stockDifference !== 0) {
        try {
          await this.inventoryMovementsService.create(
            {
              movementType: MovementType.ADJUSTMENT,
              quantity: updateProductDto.stockCurrent,
              productId: id,
              reason: `Stock ajustado de ${existingProduct.stockCurrent} a ${updateProductDto.stockCurrent}. Diferencia: ${stockDifference > 0 ? '+' : ''}${stockDifference}`,
              unitCost:
                updateProductDto.unitPrice || existingProduct.unitPrice || null,
            },
            userId || 1,
          );
        } catch (error) {
          console.error('Error creating stock adjustment movement:', error);
        }
      }
    }
    const updatedProduct = await this.productsRepository.update(
      id,
      updateProductDto,
    );
    return updatedProduct;
  }
  async updateStock(productId: number, newStock: number): Promise<Product> {
    return this.productsRepository.updateStock(productId, newStock);
  }
  async toggleStatus(id: number): Promise<Product> {
    const product = await this.findOne(id);
    const newStatus = !product.isActive;
    return this.productsRepository.update(id, { isActive: newStatus });
  }
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(id);
  }
  async findLowStockProducts(): Promise<Product[]> {
    return this.productsRepository.findLowStockProducts();
  }
  async createStockMovement(
    productId: number,
    movementType: MovementType,
    quantity: number,
    reason: string,
    provider?: string,
    unitCost?: number,
    userId?: number,
  ): Promise<void> {
    await this.inventoryMovementsService.create(
      {
        movementType,
        quantity,
        productId,
        reason,
        provider,
        unitCost,
      },
      userId || 1,
    );
  }
}
