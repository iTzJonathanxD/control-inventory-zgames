import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompanyRepository, CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
