import { IsOptional, IsString, IsBoolean } from "class-validator"
import { PartialType } from "@nestjs/mapped-types"
import { CreateCategoryDto } from "./create-category.dto"
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsString()
  categoryName?: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
