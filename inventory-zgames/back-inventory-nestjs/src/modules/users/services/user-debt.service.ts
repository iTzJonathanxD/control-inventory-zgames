import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
@Injectable()
export class UserDebtService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async addDebt(userId: number, amount: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.debt = Number(user.debt) + Number(amount);
    return this.userRepository.save(user);
  }
  async reduceDebt(userId: number, amount: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.debt = Math.max(0, Number(user.debt) - Number(amount));
    return this.userRepository.save(user);
  }
  async getUserDebt(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['debt'],
    });
    return user ? Number(user.debt) : 0;
  }
  async clearDebt(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.debt = 0;
    return this.userRepository.save(user);
  }
  async getUsersWithDebt(): Promise<User[]> {
    return this.userRepository.find({
      where: { debt: { $gt: 0 } as any },
      select: ['id', 'firstName', 'lastName', 'email', 'debt'],
    });
  }
}
