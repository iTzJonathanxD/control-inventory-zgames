import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from "class-validator"
export class CreateRolePermissionDto {
  @IsNotEmpty()
  @IsNumber()
  roleId: number
  @IsNotEmpty()
  @IsNumber()
  permissionId: number
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
