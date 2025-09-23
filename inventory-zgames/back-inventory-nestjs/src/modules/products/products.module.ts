import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { Product } from './entities/products.entity';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { CommonModule } from '../../common/common.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => InventoryMovementsModule),
    CommonModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
