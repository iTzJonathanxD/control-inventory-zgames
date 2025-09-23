import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductsModule as OriginalProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryMovementsModule } from './modules/inventory-movements/inventory-movements.module';
import { CompanyModule } from './modules/company/company.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ModulesModule } from './modules/modules/modules.module';
import { CommonServicesModule } from './common/services/common-services.module';
import { CommonModule } from './common/common.module';
import { FilesController } from './common/controllers/files.controller';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
    }),
    CommonServicesModule,
    CommonModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    RolesModule,
    OriginalProductsModule,
    CartModule,
    OrdersModule,
    WhatsAppModule,
    PaymentsModule,
    InventoryMovementsModule,
    CategoryModule,
    CompanyModule,
    RolePermissionsModule,
    PermissionsModule,
    ModulesModule,
  ],
  controllers: [FilesController],
})
export class AppModule {}
