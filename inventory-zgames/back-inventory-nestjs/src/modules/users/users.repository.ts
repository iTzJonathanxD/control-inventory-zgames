import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  Repository,
  Like,
  MoreThan,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async createUser(createUserDto: Partial<User>): Promise<User> {
    const user = this.create(createUserDto);
    if (createUserDto.roleId) {
      const role = await this.dataSource
        .getRepository(Role)
        .findOneBy({ id: createUserDto.roleId });
      if (!role)
        throw new NotFoundException(
          `Role with ID ${createUserDto.roleId} not found`,
        );
      user.role = role;
    }
    return this.save(user);
  }
  async findAllUsers(
    page: number,
    limit: number,
    filter: {
      id?: number;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      username?: string;
      address?: string;
      isActive?: boolean;
      isLocked?: boolean;
      roleId?: number;
      companyId?: number;
      debt?: boolean;
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<[User[], number]> {
    const where = this.buildWhereClause(filter);
    return this.findAndCount({
      where,
      relations: ['role', 'company'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  async findUserById(id: number): Promise<User> {
    const user = await this.findOne({
      where: { id },
      relations: ['role', 'company', 'movements'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.findOne({
      where: { email },
      relations: ['role', 'company', 'movements'],
    });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }
  async updateUser(
    id: number,
    updateUserDto: Partial<User> & { roleId?: number },
  ): Promise<User> {
    const user = await this.findUserById(id);
    Object.assign(user, updateUserDto);
    if (updateUserDto.roleId) {
      const role = await this.dataSource
        .getRepository(Role)
        .findOneBy({ id: updateUserDto.roleId });
      if (!role)
        throw new NotFoundException(
          `Role with ID ${updateUserDto.roleId} not found`,
        );
      user.role = role;
      user.roleId = role.id;
    }
    return this.save(user);
  }
  async changePassword(id: number, newPassword: string): Promise<User> {
    const user = await this.findUserById(id);
    user.password = newPassword;
    return this.save(user);
  }
  async deleteUser(id: number): Promise<void> {
    const result = await this.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`User with ID ${id} not found`);
  }
  async toggleUserStatus(id: number): Promise<User> {
    const user = await this.findUserById(id);
    user.isActive = !user.isActive;
    return this.save(user);
  }
  async toggleUserLockStatus(id: number): Promise<User> {
    const user = await this.findUserById(id);
    user.isLocked = !user.isLocked;
    return this.save(user);
  }
  private buildWhereClause(filter: any): any {
    const whereClause = {
      ...this.buildLikeFilters(filter),
      ...this.buildBooleanFilters(filter),
      ...this.buildIdFilters(filter),
      ...this.buildDateFilters(filter),
    };
    if (filter.debt !== undefined) {
      console.log('Repository - Processing debt filter:', filter.debt);
      if (filter.debt === true) {
        console.log('Repository - Filtering users WITH debt (> 0)');
        whereClause.debt = MoreThan(0);
      } else {
        console.log('Repository - Filtering users WITHOUT debt (= 0)');
        whereClause.debt = 0;
      }
    }
    return whereClause;
  }
  private buildLikeFilters(filter: any): any {
    const likeFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'username',
      'address',
    ];
    const result: any = {};
    likeFields
      .filter((field) => filter[field])
      .forEach((field) => {
        result[field] = Like(`%${filter[field]}%`);
      });
    return result;
  }
  private buildBooleanFilters(filter: any): any {
    const booleanFields = ['isActive', 'isLocked'];
    const result: any = {};
    booleanFields
      .filter((field) => filter[field] !== undefined)
      .forEach((field) => {
        result[field] = filter[field];
      });
    return result;
  }
  private buildIdFilters(filter: any): any {
    const idFields = ['roleId', 'companyId'];
    const result: any = {};
    if (filter.id !== undefined && filter.id !== null) {
      result.id = filter.id;
    }
    idFields
      .filter((field) => filter[field])
      .forEach((field) => {
        result[field] = filter[field];
      });
    return result;
  }
  private buildDateFilters(filter: any): any {
    const result: any = {};
    if (filter.dateFrom && filter.dateTo) {
      result.createdAt = Between(
        new Date(filter.dateFrom),
        new Date(filter.dateTo),
      );
    } else if (filter.dateFrom) {
      result.createdAt = MoreThanOrEqual(new Date(filter.dateFrom));
    } else if (filter.dateTo) {
      result.createdAt = LessThanOrEqual(new Date(filter.dateTo));
    }
    return result;
  }
}
