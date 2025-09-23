import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}
  create(data: Partial<Company>): Company {
    return this.repository.create(data);
  }
  async save(company: Company): Promise<Company> {
    return this.repository.save(company);
  }
  async findOne(id: number): Promise<Company | null> {
    return this.repository.findOne({ where: { id } });
  }
  async findAll(options?: any): Promise<[Company[], number]> {
    return this.repository.findAndCount(options);
  }
  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
