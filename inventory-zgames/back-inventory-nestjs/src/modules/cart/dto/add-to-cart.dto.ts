import { IsNumber, IsPositive, Min } from 'class-validator';
export class AddToCartDto {
  @IsNumber()
  @IsPositive()
  productId: number;
  @IsNumber()
  @Min(1)
  quantity: number;
}
