import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateProductsDto {
  @IsNotEmpty()
  @IsString()
  productName: string;
  @IsNotEmpty()
  @IsString()
  codeName: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  stockMin: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  stockCurrent: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  unitPrice?: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  categoryId: number;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
  @IsOptional()
  @IsString()
  image?: string;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  rating?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  weight?: number;
  @IsOptional()
  specifications?: Record<string, any>;
}
