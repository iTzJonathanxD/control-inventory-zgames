import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';
export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
  @IsOptional()
  @IsString()
  transactionId?: string;
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
