import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
@Injectable()
export class InventoryMovementsRepository {
  constructor(
    @InjectRepository(InventoryMovement)
    private repository: Repository<InventoryMovement>,
  ) {}
  create(data: Partial<InventoryMovement>): InventoryMovement {
    return this.repository.create(data);
  }
  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    return this.repository.save(movement);
  }
  async findOne(id: number): Promise<InventoryMovement | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });
  }
  async findAll(options?: {
    page?: number;
    limit?: number;
    filter?: any;
  }): Promise<[InventoryMovement[], number]> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const where = this.buildWhereClause(options?.filter || {});
    return this.repository.findAndCount({
      where,
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  private buildWhereClause(filter: any): any {
    const where: any = {};
    if (filter.movementType) where.movementType = filter.movementType;
    if (filter.productId) where.productId = filter.productId;
    if (filter.userId) where.userId = filter.userId;
    if (filter.fromDate && filter.toDate) {
      where.createdAt = Between(
        new Date(filter.fromDate),
        new Date(filter.toDate),
      );
    } else if (filter.fromDate) {
      where.createdAt = Between(new Date(filter.fromDate), new Date());
    }
    return where;
  }
  async findByProduct(
    productId: number,
    options?: any,
  ): Promise<[InventoryMovement[], number]> {
    return this.repository.findAndCount({
      where: { productId },
      ...options,
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: any,
  ): Promise<[InventoryMovement[], number]> {
    return this.repository.findAndCount({
      where: {
        ...options?.where,
        createdAt: Between(startDate, endDate),
      },
      skip: options?.skip,
      take: options?.take,
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
  async update(
    id: number,
    data: Partial<InventoryMovement>,
  ): Promise<InventoryMovement> {
    await this.repository.update(id, data);
    return this.findOne(id);
  }
}
