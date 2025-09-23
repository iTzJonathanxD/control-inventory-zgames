import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateOrderDto {
  @IsObject()
  @IsOptional()
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  @IsObject()
  @IsOptional()
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
