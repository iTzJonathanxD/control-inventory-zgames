import { IsOptional, IsString, IsBoolean, IsNumber } from "class-validator"
import { PartialType } from "@nestjs/mapped-types"
import { CreatePermissionDto } from "./create-permission.dto"
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsOptional()
  @IsString()
  permissionName?: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
  @IsOptional()
  @IsNumber()
  moduleId?: number
}
