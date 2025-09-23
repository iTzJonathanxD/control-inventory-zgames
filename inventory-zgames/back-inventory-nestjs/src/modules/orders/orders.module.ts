import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { UserDebtService } from '../users/services/user-debt.service';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User]),
    CartModule,
    forwardRef(() => ProductsModule),
    forwardRef(() => InventoryMovementsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, UserDebtService],
  exports: [OrdersService],
})
export class OrdersModule {}
