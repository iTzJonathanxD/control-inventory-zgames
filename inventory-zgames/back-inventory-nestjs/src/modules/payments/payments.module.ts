import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { OrdersModule } from '../orders/orders.module';
import { CommonModule } from '../../common/common.module';
import { UserDebtService } from '../users/services/user-debt.service';
import { CartModule } from '../cart/cart.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]),
    OrdersModule,
    CommonModule,
    CartModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, UserDebtService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
