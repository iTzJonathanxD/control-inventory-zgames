import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovementsService } from './inventory-movements.service';
import { InventoryMovementsController } from './inventory-movements.controller';
import { InventoryMovementsRepository } from './inventory-movements.repository';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { ProductsModule } from '../products/products.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryMovement]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [InventoryMovementsController],
  providers: [InventoryMovementsService, InventoryMovementsRepository],
  exports: [InventoryMovementsService, InventoryMovementsRepository],
})
export class InventoryMovementsModule {}
