import { Injectable } from '@nestjs/common';
import {
  Repository,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class CategoryRepository {
  private repository: Repository<Category>;
  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    this.repository = repository;
  }
  create(data: Partial<Category>): Category {
    return this.repository.create(data);
  }
  async save(category: Category): Promise<Category> {
    return this.repository.save(category);
  }
  async findOne(id: number): Promise<Category | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['products'],
    });
  }
  async findAll(options?: {
    page?: number;
    limit?: number;
    filter?: any;
  }): Promise<[Category[], number]> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const where = this.buildWhereClause(options?.filter || {});
    return this.repository.findAndCount({
      where,
      relations: ['products'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  private buildWhereClause(filter: any): any {
    const where: any = {};
    if (filter.categoryName) {
      where.categoryName = Like(`%${filter.categoryName}%`);
    }
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter.id !== undefined) {
      where.id = filter.id;
    }
    if (filter.fromDate && filter.toDate) {
      where.createdAt = Between(
        new Date(filter.fromDate),
        new Date(filter.toDate),
      );
    } else if (filter.fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(filter.fromDate));
    } else if (filter.toDate) {
      where.createdAt = LessThanOrEqual(new Date(filter.toDate));
    } else if (filter.createdAt !== undefined) {
      where.createdAt = filter.createdAt;
    }
    if (filter.updatedAt !== undefined) {
      where.updatedAt = filter.updatedAt;
    }
    return where;
  }
  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
