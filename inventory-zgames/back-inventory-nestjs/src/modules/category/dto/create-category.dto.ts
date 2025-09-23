import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator"
export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  categoryName: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
