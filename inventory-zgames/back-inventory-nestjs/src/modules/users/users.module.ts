import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDebtController } from './controllers/user-debt.controller';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UserDebtService } from './services/user-debt.service';
import { CommonModule } from '../../common/common.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), CommonModule],
  controllers: [UsersController, UserDebtController],
  providers: [UsersService, UsersRepository, UserDebtService],
  exports: [UsersService, UserDebtService],
})
export class UsersModule {}
