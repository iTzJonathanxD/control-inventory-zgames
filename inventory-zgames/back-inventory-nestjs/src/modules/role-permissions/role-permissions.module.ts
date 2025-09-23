import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermission } from './entities/role-permission.entity';
import { RolePermissionsRepository } from './role-permissions.repository';
import { Role } from '../roles/entities/role.entity';
@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService, RolePermissionsRepository],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
