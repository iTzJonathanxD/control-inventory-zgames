import { IsOptional, IsString, IsBoolean } from 'class-validator';
export class CreateCompanyDto {
  @IsString()
  companyName: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
