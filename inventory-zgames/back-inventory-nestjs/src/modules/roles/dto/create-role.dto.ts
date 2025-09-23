import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator"
export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  roleName: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
