import { IsOptional, IsString, IsBoolean } from "class-validator"
import { PartialType } from "@nestjs/mapped-types"
import { CreateModuleDto } from "./create-module.dto"
export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @IsOptional()
  @IsString()
  moduleName?: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
