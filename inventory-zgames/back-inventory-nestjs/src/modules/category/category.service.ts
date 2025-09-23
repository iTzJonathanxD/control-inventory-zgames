import { Injectable, NotFoundException } from '@nestjs/common';
import { Like } from 'typeorm';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }
  async findAll(
    page: number,
    limit: number,
    categoryName?: string,
    isActive?: boolean,
    fromDate?: string,
    toDate?: string,
  ): Promise<[Category[], number]> {
    const filter: any = {};
    if (categoryName) filter.categoryName = categoryName;
    if (isActive !== undefined) filter.isActive = isActive;
    if (fromDate) filter.fromDate = fromDate;
    if (toDate) filter.toDate = toDate;
    return this.categoryRepository.findAll({
      page,
      limit,
      filter,
    });
  }
  async findAllActives(
    page: number,
    limit: number,
    categoryName?: string,
  ): Promise<[Category[], number]> {
    const where: any = { isActive: true };
    if (categoryName) {
      where.categoryName = Like(`%${categoryName}%`);
    }
    return this.categoryRepository.findAll({
      page,
      limit,
      filter: where,
    });
  }
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }
  async toggleStatus(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return this.categoryRepository.save(category);
  }
  async findAllCategories(
    page: number,
    limit: number,
    categoryName?: string,
  ): Promise<[Category[], number]> {
    const where: any = {};
    if (categoryName) {
      where.categoryName = categoryName;
    }
    return this.categoryRepository.findAll({
      filter: where,
      page,
      limit,
    });
  }
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(id);
  }
}
