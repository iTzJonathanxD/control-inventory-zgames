import { Injectable } from '@nestjs/common';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {
    this.repository = repository;
  }
  create(data: Partial<Product>): Product {
    return this.repository.create(data);
  }
  async save(product: Product): Promise<Product> {
    return this.repository.save(product);
  }
  async findOne(id: number): Promise<Product | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['category'],
    });
  }
  async findByCode(codeName: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { codeName },
      relations: ['category'],
    });
  }
  async findAll(options: {
    page: number;
    limit: number;
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
    };
  }): Promise<[Product[], number]> {
    const { page, limit, filters } = options;
    let queryBuilder: SelectQueryBuilder<Product> = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');
    if (filters) {
      if (filters.productName) {
        queryBuilder = queryBuilder.andWhere(
          'LOWER(product.productName) LIKE LOWER(:productName)',
          {
            productName: `%${filters.productName}%`,
          },
        );
      }
      if (filters.codeName) {
        queryBuilder = queryBuilder.andWhere(
          'LOWER(product.codeName) LIKE LOWER(:codeName)',
          {
            codeName: `%${filters.codeName}%`,
          },
        );
      }
      if (filters.categoryId) {
        queryBuilder = queryBuilder.andWhere(
          'product.categoryId = :categoryId',
          { categoryId: filters.categoryId },
        );
      }
      if (filters.isActive !== undefined) {
        queryBuilder = queryBuilder.andWhere('product.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }
      if (filters.lowStock) {
        queryBuilder = queryBuilder.andWhere(
          'product.stockCurrent <= product.stockMin',
        );
      }
      if (filters.minPrice !== undefined) {
        queryBuilder = queryBuilder.andWhere('product.unitPrice >= :minPrice', {
          minPrice: filters.minPrice,
        });
      }
      if (filters.maxPrice !== undefined) {
        queryBuilder = queryBuilder.andWhere('product.unitPrice <= :maxPrice', {
          maxPrice: filters.maxPrice,
        });
      }
      if (filters.minStock !== undefined) {
        queryBuilder = queryBuilder.andWhere(
          'product.stockCurrent >= :minStock',
          { minStock: filters.minStock },
        );
      }
      if (filters.maxStock !== undefined) {
        queryBuilder = queryBuilder.andWhere(
          'product.stockCurrent <= :maxStock',
          { maxStock: filters.maxStock },
        );
      }
    }
    queryBuilder = queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.createdAt', 'DESC');
    return queryBuilder.getManyAndCount();
  }
  async getDashboardStats(): Promise<any> {
    const totalProducts = await this.repository.count();
    const activeProducts = await this.repository.count({
      where: { isActive: true },
    });
    const lowStockProducts = await this.repository
      .createQueryBuilder('product')
      .where('product.stockCurrent <= product.stockMin')
      .getCount();
    const totalValue = await this.repository
      .createQueryBuilder('product')
      .select('SUM(product.unitPrice * product.stockCurrent)', 'total')
      .getRawOne();
    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalInventoryValue: Number.parseFloat(totalValue.total) || 0,
    };
  }
  async getBestSellingProducts(limit: number): Promise<any[]> {
    const result = await this.repository
      .createQueryBuilder('product')
      .leftJoin('product.movements', 'movement')
      .leftJoinAndSelect('product.category', 'category')
      .select([
        'product.id',
        'product.productName',
        'product.codeName',
        'product.unitPrice',
        'product.stockCurrent',
        'category.name',
      ])
      .addSelect(
        'SUM(CASE WHEN movement.movementType = :exitType THEN movement.quantity ELSE 0 END)',
        'totalSold',
      )
      .where('product.isActive = :isActive', { isActive: true })
      .setParameter('exitType', 'exit')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .orderBy('totalSold', 'DESC')
      .limit(limit)
      .getRawAndEntities();
    return result.entities;
  }
  async getMonthlySalesData(): Promise<any[]> {
    const result = await this.repository
      .createQueryBuilder('product')
      .leftJoin('product.movements', 'movement')
      .select([
        'EXTRACT(MONTH FROM movement.createdAt) as month',
        'EXTRACT(YEAR FROM movement.createdAt) as year',
        'SUM(CASE WHEN movement.movementType = :exitType THEN movement.quantity * product.unitPrice ELSE 0 END) as sales',
      ])
      .where('movement.movementType = :exitType', { exitType: 'exit' })
      .andWhere('movement.createdAt >= :startDate', {
        startDate: new Date(new Date().getFullYear(), 0, 1),
      })
      .groupBy('EXTRACT(MONTH FROM movement.createdAt)')
      .addGroupBy('EXTRACT(YEAR FROM movement.createdAt)')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();
    return result;
  }
  async findLowStockProducts(): Promise<Product[]> {
    return this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.stockCurrent <= product.stockMin')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.stockCurrent', 'ASC')
      .getMany();
  }
  async update(id: number, updateData: Partial<Product>): Promise<Product> {
    await this.repository.update(id, updateData);
    return this.findOne(id);
  }
  async updateStock(id: number, newStock: number): Promise<Product> {
    await this.repository.update(id, { stockCurrent: newStock });
    return this.findOne(id);
  }
  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
