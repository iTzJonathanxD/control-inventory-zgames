import { PartialType } from '@nestjs/mapped-types';
import { CreateProductsDto } from './create-products.dto';
export class UpdateProductsDto extends PartialType(CreateProductsDto) {}
