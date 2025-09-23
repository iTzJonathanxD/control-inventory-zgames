import { IsOptional, IsString, IsBoolean } from "class-validator"
import { PartialType } from "@nestjs/mapped-types"
import { CreateRoleDto } from "./create-role.dto"
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsString()
  roleName?: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
