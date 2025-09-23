import { IsOptional, IsBoolean } from "class-validator"
import { PartialType } from "@nestjs/mapped-types"
import { CreateRolePermissionDto } from "./create-role-permission.dto"
export class UpdateRolePermissionDto extends PartialType(CreateRolePermissionDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
