import { Injectable, NotFoundException } from '@nestjs/common';
import { Like } from 'typeorm';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
@Injectable()
export class CompanyService {
  constructor(private companyRepository: CompanyRepository) {}
  async create(dto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(dto);
    return this.companyRepository.save(company);
  }
  async findAll(
    page: number,
    limit: number,
    companyName?: string,
  ): Promise<[Company[], number]> {
    const where: any = {};
    if (companyName) {
      where.companyName = Like(`%${companyName}%`);
    }
    return this.companyRepository.findAll({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }
  async toggleStatus(id: number): Promise<Company> {
    const company = await this.findOne(id);
    company.isActive = !company.isActive;
    return this.companyRepository.save(company);
  }
  async remove(id: number): Promise<void> {
    await this.findOne(id); // validate exists
    await this.companyRepository.remove(id);
  }
}
