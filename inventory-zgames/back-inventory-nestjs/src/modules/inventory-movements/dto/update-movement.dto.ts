import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMovementDto } from './create-movement.dto';
import { MovementType } from '../entities/inventory-movement.entity';
export class UpdateMovementDto extends PartialType(CreateMovementDto) {
  @IsOptional()
  @IsEnum(MovementType, {
    message: 'Movement type must be entry, exit, or adjustment',
  })
  @ApiProperty({
    description: 'Type of movement (entry, exit, adjustment)',
    enum: MovementType,
    required: false,
  })
  movementType?: MovementType;
  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Quantity of the product moved',
    type: Number,
    required: false,
  })
  quantity?: number;
  @IsOptional()
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsPositive({ message: 'Product ID must be positive' })
  @Type(() => Number)
  @ApiProperty({
    description: 'ID of the product being moved',
    type: Number,
    required: false,
  })
  productId?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Reason for the movement (optional)',
    required: false,
  })
  reason?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional provider for the movement (optional)',
    required: false,
  })
  provider?: string;
  @IsOptional()
  @IsNumber({}, { message: 'Unit cost must be a number' })
  @IsPositive({ message: 'Unit cost must be positive' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Unit cost of the product (optional)',
    required: false,
  })
  unitCost?: number;
}
