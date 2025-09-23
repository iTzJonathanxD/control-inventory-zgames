import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from "class-validator"
export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  permissionName: string
  @IsOptional()
  @IsString()
  description?: string
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
  @IsNotEmpty()
  @IsNumber()
  moduleId: number
}
