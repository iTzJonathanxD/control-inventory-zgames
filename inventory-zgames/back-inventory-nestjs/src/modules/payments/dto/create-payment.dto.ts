import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';
export class CreatePaymentDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'orderId must be a valid number' })
  orderId: number;
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a valid number' })
  amount: number;
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
  @IsOptional()
  @IsString()
  transactionId?: string;
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceImages?: string[];
  @IsOptional()
  @IsString()
  evidenceNotes?: string;
}
