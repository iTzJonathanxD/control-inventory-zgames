import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '../entities/inventory-movement.entity';
import { ApiProperty } from '@nestjs/swagger';
export class CreateMovementDto {
  @IsNotEmpty()
  @IsEnum(MovementType, {
    message: 'Movement type must be entry, exit, or adjustment',
  })
  @ApiProperty({
    description: 'Type of movement (entry, exit, adjustment)',
    enum: MovementType,
  })
  movementType: MovementType;
  @IsNotEmpty()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Quantity of the product moved',
    type: Number,
  })
  quantity: number;
  @IsNotEmpty()
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsPositive({ message: 'Product ID must be positive' })
  @Type(() => Number)
  @ApiProperty({
    description: 'ID of the product being moved',
    type: Number,
  })
  productId: number;
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
  @IsOptional()
  @IsNumber({}, { message: 'Previous stock must be a number' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Previous stock of the product before the movement (optional)',
    required: false,
  })
  previousStock?: number;
  @IsOptional()
  @IsNumber({}, { message: 'New stock must be a number' })
  @Type(() => Number)
  @ApiProperty({
    description: 'New stock of the product after the movement (optional)',
    required: false,
  })
  newStock?: number;
}
